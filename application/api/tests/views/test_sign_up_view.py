from rest_framework.test import APITestCase
from rest_framework import status
from api.models import User


class SignupTestCase(APITestCase):

    def test_signup_success(self):
        """Test if the signup is successful when data is correct."""
        data = {
            'firstname': 'John',
            'lastname': 'Doe',
            'username': 'johndoe',
            'email': 'johndoe@example.com',
            'password': 'password123',
            'passwordConfirmation': 'password123'
        }
        response = self.client.post('/api/signup/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'],
                         'User registered successfully!')

        user = User.objects.get(username='johndoe')
        self.assertEqual(user.email, 'johndoe@example.com')

    def test_signup_password_mismatch(self):
        """Test if signup fails when passwords do not match."""
        data = {
            'firstname': 'John',
            'lastname': 'Doe',
            'username': 'johndoe',
            'email': 'johndoe@example.com',
            'password': 'password123',
            'passwordConfirmation': 'wrongpassword123'
        }
        response = self.client.post('/api/signup/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Passwords do not match')

    def test_signup_username_taken(self):
        """Test if signup fails when the username is already taken."""
        User.objects.create_user(
            firstname='Jane', lastname='Doe', username='johndoe', email='janedoe@example.com', password='password123'
        )

        data = {
            'firstname': 'John',
            'lastname': 'Doe',
            'username': 'johndoe',
            'email': 'johndoe@example.com',
            'password': 'password123',
            'passwordConfirmation': 'password123'
        }
        response = self.client.post('/api/signup/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Username already taken')

    def test_signup_email_taken(self):
        """Test if signup fails when the email is already taken."""
        # Create a user to have the email taken
        User.objects.create_user(
            firstname='Jane', lastname='Doe', username='janedoe', email='johndoe@example.com', password='password123'
        )

        data = {
            'firstname': 'John',
            'lastname': 'Doe',
            'username': 'johndoe',
            'email': 'johndoe@example.com',
            'password': 'password123',
            'passwordConfirmation': 'password123'
        }
        response = self.client.post('/api/signup/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email already taken')

    def test_signup_invalid_data(self):
        """Test if signup fails when the data is invalid (missing required fields)."""
        data = {
            'firstname': 'John',
            'lastname': 'Doe',
            'username': '',
            'email': 'johndoe@example.com',
            'password': 'password123',
            'passwordConfirmation': 'password123'
        }
        response = self.client.post('/api/signup/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('details', response.data)
