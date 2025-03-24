from django.contrib.auth.models import User
from django.test import TestCase, RequestFactory
from rest_framework.test import APIClient
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from api.models import StudySession, SessionUser, User
from api.views import create_room, join_room, get_room_details, leave_room, notify_participants


class GroupStudyRoomViewsTests(TestCase):
    fixtures = ['api/tests/fixtures/default_user.json']

    def setUp(self):
        """Set up the test data"""
        self.url = '/api/login/'  # Adjust to the correct URL for login view
        self.user_data = {
            'email': 'alice@example.com',
            'password': 'Password123',
        }
        # Create a user for testing
        self.user = User.objects.get(username='@alice123')

        # Create a test study session
        self.study_session = StudySession.objects.create(createdBy=self.user, sessionName="Test Room")

        # Set up API client
        self.client = APIClient()

        # Force authentication for testing purposes
        self.client.force_authenticate(user=self.user)

    def test_create_room(self):
        """
        Test creating a new study room.
        """
        data = {"sessionName": "New Study Room"}
        response = self.client.post("/api/create-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("roomCode", response.data)
        self.assertIn("roomList", response.data)

        # Verify the room was created in the database
        room = StudySession.objects.get(roomCode=response.data["roomCode"])
        self.assertEqual(room.sessionName, "New Study Room")
        self.assertEqual(room.createdBy, self.user)

    def test_create_room_unauthenticated(self):
        """
        Test creating a room without authentication.
        """
        client = APIClient()  # Unauthenticated client
        data = {"sessionName": "New Study Room"}
        response = client.post("/api/create-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_join_room(self):
        """
        Test joining an existing study room.
        """
        data = {"roomCode": self.study_session.roomCode}
        response = self.client.post("/api/join-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Joined successfully!")

        # Verify the user was added to the room
        self.study_session.refresh_from_db()
        self.assertIn(self.user, self.study_session.participants.all())

    def test_join_room_not_found(self):
        """
        Test joining a non-existent room.
        """
        data = {"roomCode": "INVALID_CODE"}
        response = self.client.post("/api/join-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Room not found")

    def test_get_room_details(self):
        """
        Test retrieving details of a study room.
        """
        response = self.client.get(f"/api/get-room-details/?roomCode={self.study_session.roomCode}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sessionName"], self.study_session.sessionName)
        self.assertEqual(response.data["roomList"], self.study_session.toDoList.id)

    def test_get_room_details_not_found(self):
        """
        Test retrieving details of a non-existent room.
        """
        response = self.client.get("/api/get-room-details/?roomCode=INVALID_CODE")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_leave_room(self):
        """
        Test leaving a study room successfully
        """
        # Add two users to the room first
        self.study_session.participants.add(self.user)
        self.study_session.participants.add(User.objects.get(username= "@bob456"))
        SessionUser.objects.create(user=self.user, session=self.study_session)

        data = {"roomCode": self.study_session.roomCode}
        response = self.client.post("/api/leave-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Left successfully!")

        # Verify the user was removed from the room
        self.study_session.refresh_from_db()
        self.assertNotIn(self.user, self.study_session.participants.all())

    def test_leave_room_not_found(self):
        """
        Test leaving a non-existent room.
        """
        data = {"roomCode": "INVALID_CODE"}
        response = self.client.post("/api/leave-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Room not found")

    def test_leave_nonexistent_room(self):
        self.study_session.participants.add(self.user)
        response = self.client.post('/leave_room/', {'roomCode': 'NONEXISTENT'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_leave_room_unauthenticated(self):
        self.study_session.participants.add(self.user)
        response = self.client.post('/leave_room/', {'roomCode': self.study_session.roomCode}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_leave_room_destroy_when_empty(self):

        self.study_session.participants.add(self.user)

        SessionUser.objects.create(user=self.user, session=self.study_session)

        data = {"roomCode": self.study_session.roomCode}
        response = self.client.post("/api/leave-room/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Left successfully!")
        self.assertFalse(StudySession.objects.filter(roomCode=self.study_session.roomCode).exists())

    def test_leave_room_not_in_session(self):
        another_user =  User.objects.get(username='@bob456')
        self.client.force_authenticate(user=another_user)
        response = self.client.post('/leave_room/', {'roomCode': self.study_session.roomCode}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

   


    # def test_notify_participants(self):
    #     """
    #     Test the notify_participants function.
    #     """
    #     # Mock the channel layer
    #     channel_layer = get_channel_layer()
    #     async_to_sync(channel_layer.group_send) = lambda group, message: None
    #
    #     participants = self.study_session.participants.all()
    #     notify_participants(self.study_session.roomCode, participants)
    #
    #     # Verify the function was called (no exceptions raised)
    #     self.assertTrue(True)