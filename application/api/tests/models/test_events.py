from django.test import TestCase
from api.models.user import User
from datetime import datetime, timedelta
from api.models.events import Appointments

class EventModelTest(TestCase):
    ''' Tests for the Appointments model '''

    fixtures = [
        'api/tests/fixtures/default_user.json'
    ]

    def setUp(self):
        ''' Create a test user '''

        self.user = User.objects.get(pk=1)
        
        ''' Create a test event '''
        self.event = Appointments.objects.create(
            user=self.user,
            name='Test Event',
            comments='This is a test event',
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(hours=1),
        )

    def test_event_creation(self):
        """ Test if the event is created properly. """
        self.assertEqual(self.event.name, 'Test Event')
        self.assertEqual(self.event.comments, 'This is a test event')
        self.assertEqual(self.event.user, self.user)
    
    def test_event_completion(self):
        """ Test marking the event as completed. """
        self.event.save()
        completed_event = Appointments.objects.get(id=self.event.pk)
        self.assertEqual(completed_event.user, self.user)

    def test_event_time_validation(self):
        """ Test that event end time is after the start time. """
        self.assertTrue(self.event.end_date > self.event.start_date)

    def test_event_string_representation(self):
        """ Test the string representation of the event. """
        self.assertEqual(str(self.event), 'Test Event')

    def test_event_updating(self):
        """ Test updating an event's title and description. """
        self.event.name = 'Updated Event'
        self.event.comments = 'Updated Description'
        self.event.save()
        updated_event = Appointments.objects.get(id=self.event.pk)
        self.assertEqual(updated_event.name, 'Updated Event')
        self.assertEqual(updated_event.comments, 'Updated Description')

    def test_event_deletion(self):
        """ Test deleting an event. """
        event_id = self.event.pk
        self.event.delete()
        with self.assertRaises(Appointments.DoesNotExist):
            Appointments.objects.get(pk=event_id)

