from django.db import models
from .user import User


class List(models.Model):
    name = models.CharField(max_length=255)  # Example field
    is_shared = models.BooleanField(default=False)

class Permission(models.Model):
    READ = 'read'
    WRITE = 'write'

    PERMISSION_TYPE_CHOICES = [
        (READ, 'Read'),
        (WRITE, 'Write'),
    ]

    user_id = models.ForeignKey(User, on_delete=models.CASCADE)  # Links to User
    #list_id = models.ForeignKey(toDoList, on_delete=models.CASCADE)
    list_id = models.ForeignKey(List, on_delete=models.CASCADE)
    permission_type = models.CharField(max_length=10, choices=PERMISSION_TYPE_CHOICES)

    class Meta:
        unique_together = ('user_id', 'list_id')  # Ensures a user can't have duplicate permissions for the same list

    def __str__(self):
        return f"{self.user_id} - {self.list_id} - {self.permission_type}"