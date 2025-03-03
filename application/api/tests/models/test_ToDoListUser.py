from django.test import TestCase
from api.models.user import User
from api.models.todo_list import toDoList
from api.models.todo_list_user import Permission, List 


class PermissionModelTest(TestCase):

    fixtures = [
        'api/tests/fixtures/default_user.json',
        'api/tests/fixtures/default_lists.json'
    ]

    def setUp(self) -> None:

        self.user1 = User.objects.get(pk=1)
        self.list1 = List.objects.get(pk=1)

    def test_create_permission(self):
        permission = Permission.objects.create(user_id=self.user1, list_id=self.list1)
        self.assertEqual(permission.user_id, self.user1)
        self.assertEqual(permission.list_id, self.list1)

    def test_unique_permission_constraint(self):
        # Test that we cannot have duplicate permissions for the same list.
        Permission.objects.create(user_id=self.user1, list_id=self.list1)
        with self.assertRaises(Exception):  
            Permission.objects.create(user_id=self.user1, list_id=self.list1)

    def test_string_representation(self):
        # Test the __str__ method of Permission model.
        permission = Permission.objects.create(user_id=self.user1, list_id=self.list1)
        expected_str = f"{self.user1} - {self.list1}"
        self.assertEqual(str(permission), expected_str)