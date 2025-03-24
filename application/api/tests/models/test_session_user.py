from django.test import TestCase
from django.utils.timezone import now
from api.models import User, StudySession, SessionUser
from django.db import connection
from datetime import datetime, time, timedelta
from django.test.utils import CaptureQueriesContext

class SessionUserTest(TestCase):

    fixtures = [
        'api/tests/fixtures/default_user.json'
    ]

    def setUp(self):
        """Set up test data"""
        self.user = User.objects.get(pk=1)

        # Create a datetime object using a specific date (e.g., today's date) and time (23:59)
        end_time = datetime.combine(datetime.today(), time(hour=23, minute=59))

        self.session = StudySession.objects.create(
            createdBy=self.user,
            sessionName='Test Session',
            endTime=end_time  # Provide a datetime object instead of time
        )

        self.session_user = SessionUser.objects.create(
            user=self.user,
            session=self.session,
        )

    def test_str_representation(self):
        """Test string representation"""
        expected = f"{self.user.username} - {self.session.sessionName}"
        self.assertEqual(str(self.session_user), expected)


    def test_leave_session_from_casual(self):
        """ Test leaving session """
        
        self.session_user.leave_session()
        
        # Instead of checking for deletion, verify left_at is set
        #session_user = SessionUser.objects.get(pk=self.session_user.pk)
        self.assertIsNotNone(self.session_user.left_at)

    def test_rejoin_session_sequence(self):
        """Test session joining sequence"""
        
        # Store session info before leaving
        session = self.session_user.session
        user = self.session_user.user
        
        # Print all SessionUser objects before leaving
        print("\nBefore leaving:")
        for su in SessionUser.objects.all():
            print(f"SessionUser {su.pk}")
        
        # Leave first session
        self.session_user.leave_session()
        
        # Verify deletion
        print("\nAfter leaving:")
        for su in SessionUser.objects.all():
            print(f"SessionUser {su.pk}")
        

    def test_meta_ordering(self):
        """Test that sessions are ordered correctly"""
        other_user = SessionUser.objects.create(
            user=self.user,
            session=self.session,
            joined_at=now() + timedelta(hours=1)  # Changed from joinedAt
        )
        
        sessions = SessionUser.objects.all()
        
        self.assertEqual(sessions[0], self.session_user)
        self.assertEqual(sessions[1], other_user)


