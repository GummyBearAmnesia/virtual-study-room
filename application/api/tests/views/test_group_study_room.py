from django.contrib.auth.models import User
from django.test import TestCase, RequestFactory
from rest_framework.test import APIClient
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from api.models import StudySession, SessionUser, User
from api.views import create_room, join_room, get_room_details, leave_room, notify_participants

"""
Tests for the Group Study room view functions
"""
class GroupStudyRoomViewsTests(TestCase):
    fixtures = ['api/tests/fixtures/default_user.json']

    def setUp(self):
        """Set up the test data"""
        self.url = '/api/login/' 
        self.user_data = {
            'email': 'alice@example.com',
            'password': 'Password123',
        }

        self.user = User.objects.get(username='@alice123')

        self.study_session = StudySession.objects.create(createdBy=self.user, sessionName="Test Room")

        self.client = APIClient()

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
        Test leaving a study room.
        """
        # Add the user to the room first
        self.study_session.participants.add(self.user)
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