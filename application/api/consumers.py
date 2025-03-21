# this is for websocket handling
from channels.generic.websocket import AsyncWebsocketConsumer
import json

from django.core.exceptions import ObjectDoesNotExist

from .models import StudySession, User
from asgiref.sync import sync_to_async

from asgiref.sync import async_to_sync

class RoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.room_code = None
        self.username = None
        self.list_id = None

    # Methods for joining and leaving the study room

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]

        print(f"Consumers.py Room code: {self.room_code}")  # Debugging: Log the room code

        try:
            # Use sync_to_async to call the synchronous ORM code
            self.study_session = await sync_to_async(StudySession.objects.get)(roomCode=self.room_code)
        except ObjectDoesNotExist:
            # If the study session does not exist, close the connection
            await self.close()
            return

        # Create a name to refer to the room
        self.room_group_name = f"room_{self.room_code}"

        # Add the user to the room's group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Fetch and broadcast the updated participants list
        await self.update_participants()


    async def disconnect(self, close_code):
        # Remove the user from the room's group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Fetch and broadcast the updated participants list
        await self.update_participants()


    # Methods for updating the users in the study room for all participants

    @sync_to_async
    def get_participants(self):
        # Fetch participants from the StudySession model
        # try:
        #     print("Yes")
        #     print(StudySession.objects.filter(roomCode=self.room_code))
        #     study_session = StudySession.objects.get(roomCode=self.room_code)
        # except StudySession.DoesNotExist:
        #     print(f"StudySession with room code {self.room_code} does not exist.")
        #     # You can also add some handling logic here, for example:
        #     # - Return a message to the user
        #     # - Try again or handle the error in a way that doesn't crash the program
        #     study_session = None  # Or handle it appropriately
        # participants = study_session.participants.all()
        
        # return [participant.username for participant in participants]
        if not self.study_session:
            return []  # Return an empty list if study_session is None

        try:
            study_session = StudySession.objects.get(roomCode=self.room_code)
            participants = study_session.participants.all()
            return [participant.username for participant in participants]
        except StudySession.DoesNotExist:
            print(f"StudySession with room code {self.room_code} does not exist.")
            return []  # Return an empty list if the StudySession does not exist


   # Method to send to-do list updates to all group participants
    async def broadcast_todo_list(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "add_task":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "add_task",
                    "task": data["task"],
                }
            )
        elif message_type == "remove_task":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "remove_task",
                    "task_id": data["task_id"],
                }
            )
        elif message_type == "toggle_task":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "toggle_task",
                    "task_id": data["task_id"],
                }
            )
            # MAY NOT NEED FUNCTIONALITY TO DELETE LIST, CHECK WITH YULIIA
        elif message_type == "delete_list":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "delete_list",
                    "list_id": data["list_id"],
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "chat_message":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": data["message"],
                    "sender": data["sender"],
                }
            )
        elif message_type == "update_participants":
            # Trigger a participants update
            await self.update_participants()
        elif message_type == "study_update":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "study_update",
                    "update": data["update"],
                }
            )
        elif message_type == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing",
                    "sender":data["sender"],
                }
            )

        elif message_type == "file_uploaded":
            # Broadcast the new file to all the users in the study room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type" : "file_uploaded",
                    "file" : data["file"],
                }
            )
        elif message_type == "file_deleted":
            # Broadcast the new file to all the users in the study room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type" : "file_deleted",
                    "fileName" : data["fileName"],
                }
            )

    # Method to send an updated list of participants when someone joins or leaves
    async def participants_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "participants_update",
            "participants": event["participants"],
        }))

    # Methods for chat functionality

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"],
            "sender": event["sender"],
        }))

    async def study_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "study_update",
            "update": event["update"],
        }))

    async def typing(self, event):
        await self.send(text_data=json.dumps({
            "type": "typing",
            "sender" : event["sender"],
        }))


    # Methods TO SEND SIGNALS for to do list
    async def add_task(self, event):
        await self.send(text_data=json.dumps({
            "type": "add_task",
            "task": event["task"],
        }))

    async def remove_task(self, event):
        await self.send(text_data=json.dumps({
            "type": "remove_task",
            "task_id": event["task_id"],
        }))

    async def toggle_task(self, event):
        await self.send(text_data=json.dumps({
            "type": "toggle_task",
            "task_id": event["task_id"],
            "is_completed": event["is_completed"],
        }))

    async def delete_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "delete_list",
            "list_id": event["list_id"],
        }))
        
    # Methods for Shared Materials

    async def file_uploaded(self, event):
        # Send the new file to the client
        await self.send(text_data=json.dumps({
            "type": "file_uploaded",
            "file": event["file"],
        }))

    async def file_deleted(self, event):
        try:
            # Notify the client about the deleted file
            await self.send(text_data=json.dumps({
                "type": "file_deleted",
                "fileName": event["fileName"],
            }))
        except Exception as e:
            print(f"Error in file_deleted: {e}")

    async def update_participants(self):
        """Fetch the updated list of participants and broadcast it to the room."""
        participants = await self.get_participants()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "participants_update",
                "participants": participants,
            }
        )