"""Unit tests of the sign up form."""
from django.contrib.auth.hashers import check_password
from django import forms
from django.test import TestCase
from api.forms import SignUpForm
from api.models import User

class SignUpFormTestCase(TestCase):
    """Unit tests of the sign up form."""

    def setUp(self):
        self.form_input = {
            "firstname": "Alice",
            "lastname": "Smith",
            "email": "alice@example.com",
            "username": "@alice123",
            "new_password": "Password123",
            "password_confirmation": "Password123",
            "created_at": "2025-01-01T12:00:00Z"
        }

    def test_valid_sign_up_form(self):
        form = SignUpForm(data=self.form_input)
        self.assertTrue(form.is_valid())

    def test_form_has_necessary_fields(self):
        form = SignUpForm()
        self.assertIn('firstname', form.fields)
        self.assertIn('lastname', form.fields)
        self.assertIn('username', form.fields)
        self.assertIn('email', form.fields)
        email_field = form.fields['email']
        self.assertTrue(isinstance(email_field, forms.EmailField))
        self.assertIn('new_password', form.fields)
        new_password_widget = form.fields['new_password'].widget
        self.assertTrue(isinstance(new_password_widget, forms.PasswordInput))
        self.assertIn('password_confirmation', form.fields)
        password_confirmation_widget = form.fields['password_confirmation'].widget
        self.assertTrue(isinstance(password_confirmation_widget, forms.PasswordInput))

    def test_form_uses_model_validation(self):
        self.form_input['username'] = 'x' * 51
        form = SignUpForm(data=self.form_input)
        #print(form.errors)
        self.assertFalse(form.is_valid())

    def test_password_must_contain_uppercase_character(self):
        self.form_input['new_password'] = 'password123'
        self.form_input['password_confirmation'] = 'password123'
        form = SignUpForm(data=self.form_input)
        self.assertFalse(form.is_valid())

    def test_password_must_contain_lowercase_character(self):
        self.form_input['new_password'] = 'PASSWORD123'
        self.form_input['password_confirmation'] = 'PASSWORD123'
        form = SignUpForm(data=self.form_input)
        self.assertFalse(form.is_valid())

    def test_password_must_contain_number(self):
        self.form_input['new_password'] = 'PasswordABC'
        self.form_input['password_confirmation'] = 'PasswordABC'
        form = SignUpForm(data=self.form_input)
        self.assertFalse(form.is_valid())

    def test_new_password_and_password_confirmation_are_identical(self):
        self.form_input['password_confirmation'] = 'WrongPassword123'
        form = SignUpForm(data=self.form_input)
        self.assertFalse(form.is_valid())

    def test_form_must_save_correctly(self):
        form = SignUpForm(data=self.form_input)
        before_count = User.objects.count()
        self.assertTrue(form.is_valid())
        form.save()
        after_count = User.objects.count()
        self.assertEqual(after_count, before_count+1)
        user = User.objects.get(email='alice@example.com')
        self.assertEqual(user.firstname, 'Alice')
        self.assertEqual(user.lastname, 'Smith')
        self.assertEqual(user.username, '@alice123')
        is_password_correct = check_password('Password123', user.password)
        self.assertTrue(is_password_correct)

    def test_email_already_in_use(self):
        form_data1 = {
            'firstname': 'Name1',
            'lastname': 'Surname1',
            'username': '@username1',
            'email': 'email@example.org',
            'new_password': 'Password123',
            'password_confirmation': 'Password123'
        }
        form = SignUpForm(data=form_data1)
        form.is_valid()
        form.save()

        form_data2 = {
            'firstname': 'Name2',
            'lastname': 'Surname2',
            'username': '@username2',
            'email': 'email@example.org',
            'new_password': 'Password123',
            'password_confirmation': 'Password123'
        }
        form = SignUpForm(data=form_data2)

        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)
        self.assertEqual(form.errors['email'][0], "This email is already in use.")

    def test_username_already_in_use(self):
        form_data1 = {
            'firstname': 'Name1',
            'lastname': 'Surname1',
            'username': '@username',
            'email': 'email1@example.org',
            'new_password': 'Password123',
            'password_confirmation': 'Password123'
        }
        form = SignUpForm(data=form_data1)
        form.is_valid()
        form.save()

        form_data2 = {
            'firstname': 'Name2',
            'lastname': 'Surname2',
            'username': '@username',
            'email': 'email2@example.org',
            'new_password': 'Password123',
            'password_confirmation': 'Password123'
        }
        form = SignUpForm(data=form_data2)

        self.assertFalse(form.is_valid())
        self.assertIn('username', form.errors)
        self.assertEqual(form.errors['username'][0], "This username is already in use.")
