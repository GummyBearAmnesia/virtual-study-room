from django.db import models
from django.conf import settings
from django.forms import ValidationError
from api.models import List

'''
toDoList Model:
    This is a model that manages the toDoList items in the database, each item has various attributes.

Model Breakdown:
    list_id -> Primary key to uniquely identify each toDoList item in the database.
    title -> CharField of max 255 characters, to give each toDoList item a title. This is set by the user (and cannot be empty) and stored as an attribute to the toDoList item.
    content -> CharField but has no limit of characters and can remain empty, this is all set by the user and stored as an attribute.
    creation_date -> DateField and this automatically sets that field to the current date. This is effectively a read-only field.
    is_completed -> BooleanField that is set to false by default, this indiacted whether the user has completed the task.
    is_shared -> BooleanField that is also set to false by default, this field is to mark whether the user wants to share the toDolist item with others.

save Method:
    This makes sure that after the creation_date has been added as a field, it can't be amended.

str Method:
    This prints out the title and list_id of the toDoList item, in the database, useful for debugging. 

'''

class toDoList(models.Model):
    #list_id = models.AutoField(primary_key=True)
    list = models.ForeignKey(List, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=False)
    content = models.CharField(max_length=1000, blank=True)
    creation_date = models.DateField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.pk: 
            original = toDoList.objects.get(pk=self.pk)
            if self.creation_date != original.creation_date:
                raise ValidationError("You cannot modify the creation_date.")
        super().save(*args, **kwargs)

    def __str__(self):
        return(f"{self.title} has list_id {self.list_id}")