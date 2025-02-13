from django.db import IntegrityError
from django.test import TestCase
from django.core.exceptions import ValidationError

from api.models.friend_request import Friends
from api.models.user import User
from api.models.choices import Status


class FriendsModelTestCase(TestCase):
    fixtures = [
        'api/tests/fixtures/default_user.json',
        'api/tests/fixtures/default_friends.json'
    ]

    def setUp(self) -> None:
        self.user1 = User.objects.get(pk=1)
        self.user2 = User.objects.get(pk=2)
        self.user3 = User.objects.get(pk=3)

        self.friendship_accepted = Friends.objects.get(pk=1)
        self.friendship_pending = Friends.objects.get(pk=2)
        self.friendship_rejected = Friends.objects.get(pk=3)

    def test_valid_user(self):
        """Test to check if a valid user can be considered valid"""
        self._assert_user_is_valid(self.friendship_accepted)

    def test_friends_count(self):
        """Check if 3 users exist in the database"""
        self.assertEqual(Friends.objects.count(), 3)

    def test_status_cannot_be_blank(self):
        """Test to check if the status cannot be blank"""
        self.friendship_accepted.status = ''
        self._assert_user_is_invalid(self.friendship_accepted)

    def test_status_cannot_be_over_10_characters_long(self):
        """Test to check if the status cannot exceed 10 characters"""
        self.friendship_accepted.status = 'x' * 11
        self._assert_user_is_invalid(self.friendship_accepted)

    def test_friends_should_be_unique(self):
        """Test that friendship between two users should be unique"""
        existing_friendship = Friends.objects.filter(user1=self.user1, user2=self.user2).first()

        duplicate_friendship = Friends(
            user1=self.user2,
            user2=self.user1,
            status=Status.ACCEPTED,
            created_at="2025-02-01T12:00:00Z"
        )
        if existing_friendship:
            with self.assertRaises(IntegrityError):
                duplicate_friendship.save()

    def test_check_friends_exists(self):
        """Ensure a specific user exists in the database"""
        friends = Friends.get_friends_with_status(self.user1, Status.ACCEPTED)
        self.assertEqual(len(friends), 1)
        self.assertEqual(friends[0].user2.user_id, self.user2.user_id)

    def _assert_user_is_valid(self, friendship):
        friendship.full_clean()

    def _assert_user_is_invalid(self, friendship):
        with self.assertRaises(ValidationError):
            friendship.full_clean()

    def test_student_str(self):
        """Test the string representation of Friends."""

        self.assertEqual(
            f'Friendship between {self.user1.firstname} {self.user1.lastname} and {self.user2.firstname} {self.user2.lastname}',
            str(self.friendship_accepted))

    def test_are_friends_with_accepted_status(self):
        """Test if the method correctly identifies friends with 'ACCEPTED' status"""
        self.assertTrue(Friends.are_friends(self.user1, self.user2))
        self.assertTrue(Friends.are_friends(self.user2, self.user1))

    def test_are_friends_with_pending_status(self):
        """Test if the method correctly identifies when users are not friends with 'PENDING' status"""
        self.assertFalse(Friends.are_friends(self.user2, self.user3))
        self.assertFalse(Friends.are_friends(self.user3, self.user2))

    def test_are_friends_with_rejected_status(self):
        """Test if the method correctly identifies when users are not friends with 'REJECTED' status"""
        self.assertFalse(Friends.are_friends(self.user1, self.user3))
        self.assertFalse(Friends.are_friends(self.user3, self.user1))
from django.db import IntegrityError
from django.test import TestCase
from django.core.exceptions import ValidationError

from api.models.friend_request import Friends
from api.models.user import User
from api.models.choices import Status


class FriendsModelTestCase(TestCase):
    fixtures = [
        'api/tests/fixtures/default_user.json',
        'api/tests/fixtures/default_friends.json'
    ]
    
    def setUp(self) -> None:
        
        self.user1 = User.objects.get(pk=1)
        self.user2 = User.objects.get(pk=2)
        self.user3 = User.objects.get(pk=3)

        self.friendship_accepted  = Friends.objects.get(pk=1)
        self.friendship_pending = Friends.objects.get(pk=2)
        self.friendship_rejected = Friends.objects.get(pk=3)

    
    def test_valid_user(self):
        """Test to check if a valid user can be considered valid"""
        self._assert_user_is_valid(self.friendship_accepted )

    def test_friends_count(self):
        """Check if 3 users exist in the database"""
        self.assertEqual(Friends.objects.count(), 3)

    def test_status_cannot_be_blank(self):
        """Test to check if the status cannot be blank"""
        self.friendship_accepted .status = ''
        self._assert_user_is_invalid(self.friendship_accepted)

    def test_status_cannot_be_over_10_characters_long(self):
        """Test to check if the status cannot exceed 10 characters"""
        self.friendship_accepted .status = 'x' * 11
        self._assert_user_is_invalid(self.friendship_accepted)

    def test_friends_should_be_unique(self):
        """Test that friendship between two users should be unique"""
        existing_friendship = Friends.objects.filter(user1=self.user1, user2=self.user2).first()
        
        duplicate_friendship = Friends(
            user1=self.user2,
            user2=self.user1,
            status=Status.ACCEPTED,
            created_at="2025-02-01T12:00:00Z"
        )
        if existing_friendship:
            with self.assertRaises(IntegrityError):
                duplicate_friendship.save()

    def test_check_friends_exists(self):
        """Ensure a specific user exists in the database"""
        friends = Friends.get_friends_with_status(self.user1, Status.ACCEPTED)
        self.assertEqual(len(friends), 1)
        self.assertEqual(friends[0].user2.user_id, self.user2.user_id)

    def _assert_user_is_valid(self, friendship):
        friendship.full_clean()

    def _assert_user_is_invalid(self, friendship):
        with self.assertRaises(ValidationError):
            friendship.full_clean()
    
    def test_student_str(self):
        """Test the string representation of Friends."""

        self.assertEqual(f'Friendship between {self.user1.firstname} {self.user1.lastname} and {self.user2.firstname} {self.user2.lastname}', str(self.friendship_accepted ))

    def test_are_friends_with_accepted_status(self):
        """Test if the method correctly identifies friends with 'ACCEPTED' status"""
        self.assertTrue(Friends.are_friends(self.user1, self.user2))
        self.assertTrue(Friends.are_friends(self.user2, self.user1))

    def test_are_friends_with_pending_status(self):
        """Test if the method correctly identifies when users are not friends with 'PENDING' status"""
        self.assertFalse(Friends.are_friends(self.user2, self.user3))
        self.assertFalse(Friends.are_friends(self.user3, self.user2))

    def test_are_friends_with_rejected_status(self):
        """Test if the method correctly identifies when users are not friends with 'REJECTED' status"""
        self.assertFalse(Friends.are_friends(self.user1, self.user3))
        self.assertFalse(Friends.are_friends(self.user3, self.user1))