from rest_framework.test import APITestCase
from rest_framework import status
from api.models import User


class SignupTestCase(APITestCase):

    def test_signup_success(self):
        """Test if the signup is successful when data is correct."""
        data = {
            'firstname': 'John',
            'lastname': 'Doe',
            'username': '@johndoe',
            'email': 'johndoe@example.com',
            'description': '',
            'password': 'password123',
            'passwordConfirmation': 'password123'
        }
        response = self.client.post('/api/signup/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'],
                         'User registered successfully!')

        user = User.objects.get(username='@johndoe')
        self.assertEqual(user.email, 'johndoe@example.com')

   