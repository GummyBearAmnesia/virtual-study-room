from django.test import TestCase
from api.models.user import User
from api.models.todo_list import toDoList
from api.models.todo_list_user import Permission 


class PermissionModelTest(TestCase):

    def setUp(self):
        #Test Data creation
        self.user = User.objects.create_user(email = "test_user@email.com", firstname = "test_user", lastname = "test_user", username = "test_user", password = "test_user")
        self.todo_list = toDoList.objects.create(title="Test List", content="")

    def test_create_permission(self):
        permission = Permission.objects.create(user_id=self.user, list_id=self.todo_list, permission_type=Permission.READ)
        self.assertEqual(permission.user_id, self.user)
        self.assertEqual(permission.list_id, self.todo_list)
        self.assertEqual(permission.permission_type, Permission.READ)

    def test_unique_permission_constraint(self):
        # Test that we cannot have duplicate permissions for the same list.
        Permission.objects.create(user_id=self.user, list_id=self.todo_list, permission_type=Permission.READ)
        with self.assertRaises(Exception):  
            Permission.objects.create(user_id=self.user, list_id=self.todo_list, permission_type=Permission.WRITE)

    def test_string_representation(self):
        # Test the __str__ method of Permission model.
        permission = Permission.objects.create(user_id=self.user, list_id=self.todo_list, permission_type=Permission.READ)
        expected_str = f"{self.user} - {self.todo_list} - {Permission.READ}"
        self.assertEqual(str(permission), expected_str)