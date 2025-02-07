from django.test import TestCase
from django.contrib.auth import get_user_model

class UserModelTest(TestCase):
    def setUp(self):
        """Set up test data"""
        self.user_data =    {
            "email": "testuser@email.com",
            "firstname": "Test",
            "lastname": "User",
            "username": "TestUser1",
            "password": "Password123"
        }
    
    def test_user_creation(self):
        """Test creating a user with valid details"""
        User = get_user_model()
        user = User.objects.create_user(**self.user_data)

        self.assertEqual(user.email, self.user_data['email'])
        self.assertEqual(user.firstname, self.user_data['firstname'])
        self.assertEqual(user.lastname, self.user_data['lastname'])
        self.assertEqual(user.username, self.user_data['username'])
        self.assertTrue(user.check_password(self.user_data['password']))
    
    def test_email_normlalisation(self):
        """Test that email is normalized -- lowercased domain part"""
        User = get_user_model()
        email = 'Test@EXAMPLE.com'
        user = User.objects.create_user(email=email, firstname="Test", lastname="User", username="testuser", password="Password123!")
        self.assertEqual(user.email, "Test@example.com")

    def test_user_without_email_error(self):
        """Test that creating a user without an email raises an error"""
        User = get_user_model()
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", firstname="Test", lastname="User", username="testUser", password="password123")
        
    def test_user_without_username_error(self):
        """Test that creating a user without a username raises an error"""
        User = get_user_model()
        with self.assertRaises(ValueError):
            User.objects.create_user(email="test@example.com", firstname="Test", lastname="User", username="", password="password123")

    def test_user_without_password_error(self):
        """Test that creating a user without a password raises an error"""
        User = get_user_model()
        with self.assertRaises(ValueError):
            User.objects.create_user(email="test@example.com", firstname="Test", lastname="User", username="testUser", password="")

        
    