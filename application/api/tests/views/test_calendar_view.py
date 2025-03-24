from rest_framework.test import APITestCase
from rest_framework import status
from api.models.user import User
from datetime import datetime, timedelta
from api.models.events import Appointments

class EventViewSetTests(APITestCase):

    def setUp(self):
        # Create a test user with all required fields
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            email="testuser@example.com",  # Provide a valid email
            firstname="Test",               # Provide a first name
            lastname="User",                 # Provide a last name
            description="Test User"          # Provide a description
        )
        self.client.login(username="testuser", password="testpassword")
        
        # Create some test appointments
        self.appointment1 = Appointments.objects.create(user=self.user,
            name='Appointment 1',
            comments='This is a test event',
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(hours=1),
            status='Test Location')
        
        self.appointment2 = Appointments.objects.create(user=self.user,
            name='Appointment 2',
            comments='This is a test event',
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(hours=1),
            status='Test Location')

    def test_get_queryset(self):
        # Test if get_queryset returns only the appointments of the authenticated user
        response = self.client.get("/api/eventts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["title"], self.appointment1.title)
        self.assertEqual(response.data[1]["title"], self.appointment2.title)

    def test_create_appointment(self):
        # Test if a new appointment is created and assigned to the authenticated user
        data = {"title": "New Appointment"}
        response = self.client.post("/api/events/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointments.objects.count(), 3)
        self.assertEqual(Appointments.objects.last().user, self.user)

    def test_permissions(self):
        # Test if unauthenticated users are denied access
        self.client.logout()
        response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_perform_create(self):
        # Test if the user is correctly assigned to the appointment on creation
        data = {"title": "Appointment 1"}
        response = self.client.post("/api/events/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Fetch the last created appointment
        appointment = Appointments.objects.last()
        
        # Check if the appointment's user is the authenticated user
        self.assertEqual(appointment.user, self.user)
        
        # Check if the appointment's title is correct
        self.assertEqual(appointment.title, "Appointment 1")