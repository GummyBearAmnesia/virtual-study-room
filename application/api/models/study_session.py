from django.db import models
import datetime
from .user import User
from .todo_list_user import List
from django.utils.timezone import now
import string
import random

# model for the study session (can be group or individual)
class StudySession(models.Model):

    # user that creates the study session
    createdBy = models.ForeignKey(User, on_delete = models.CASCADE, related_name = 'study_session')
    sessionName = models.CharField(max_length=255, blank=False)
    roomCode = models.CharField(max_length=8, unique=True, blank=True) # to join a room, non-predictable
    startTime = models.DateTimeField(default=now)
    endTime = models.DateTimeField(null=True, blank=True)
    date = models.DateField(default=datetime.date.today)
    toDoList = models.ForeignKey(List, on_delete=models.CASCADE, null=True, blank=True)
    participants = models.ManyToManyField(User, related_name='study_sessions', blank = True)
    
    def generate_room_code(self):
        """To generate an 8-digit room code with uppercase letters and numbers"""
        characters = string.ascii_uppercase + string.digits
        # will use A-Z and 0-9
        return ''.join(random.choice(characters) for _ in range(8))

    def save(self, *args, **kwargs):
        """Override the save method and ensire that every room code is unique!"""

        # makes sure it has a roomCode if not already
        if not self.roomCode:
            while True:
                    # generate a new room code
                    self.roomCode = self.generate_room_code()
                    # check if already used code
                    if not StudySession.objects.filter(roomCode=self.roomCode).exists():
                        break # if unique, stop you did it!

            if not self.toDoList:
                todo_list = List.objects.create(
                    name="TaskTrack: Study Edition",
                    is_shared=True
                )
                self.toDoList = todo_list
        super().save(*args, **kwargs)   # save the room code

    def __str__(self):
        return f"Study session {self.sessionName} was created by {self.createdBy} on {self.date}. It was initiated at {self.startTime} and terminated at {self.endTime}"



