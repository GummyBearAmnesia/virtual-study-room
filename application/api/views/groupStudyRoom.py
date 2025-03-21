from asgiref.sync import async_to_sync
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import SessionUser, User, toDoList
from ..models.study_session import StudySession

from .to_do_list import ViewToDoList

# for websockets
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# These are APIs related to the group study room!
# create_room will send create a study session, use the room_id as the room code, and created_by user
# join_room will take the roomCode and add the User to the study session

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request user:", request.user)  # Debugging: Log the user
    print("Request data:", request.data)  # Debugging: Log the request data

    user = request.user  # To check if the user is logged in

    # Add a check to make sure the user is logged in here!
    if not user.is_authenticated:
        return Response({"error": "User must be logged in"}, status=401)

    # sets the name, if none given, default name is on the right :)
    session_name = request.data.get('sessionName', "Untitled Study Session - maybe something went wrong?")
    if session_name == "":
        session_name = "We couldn't think of anything :)"

    print("User", user, "is attempting to make a room called:", session_name)
    # use as default session name for now, later take as input field for user to type in
    #session_name = "Untitled Study Session"

     # if the user is already in another room they have to 'leave' that room first
    if SessionUser.objects.filter(user=user).exists():
        print("Deleting user from old session")
        session_users = SessionUser.objects.filter(user=user)
        for session_user in session_users:
            previous_session = session_user.session
            user = session_user.user
            previous_session.participants.remove(user)
            session_user.delete()
            print(" user removed from old session")
            
    try:

        print("Room start")
        room = StudySession.objects.create(
                createdBy = user,
                sessionName = session_name
        )

        print("Room ", room)

        # is using the study session auto generated ID as the room code
        # Add the user to the participants field
        room.participants.add(user)

        print("Room ", room)
        room.save()

        print("Room ", room)
        if SessionUser.objects.filter(user=user, session=room).exists():
            print("User is already in the session. Updating join sequence.")
            session_user = SessionUser.objects.filter(user=user, session=room).first()
            session_user.rejoin_session(user, room)
        else:
            print("Creating new SessionUser instance.")
            session_user = SessionUser.objects.create(
                user=user,
                session=room,
            )

        print("User", user, "has successfully made the room:", session_name, "with code:", room.roomCode)
        return Response({"roomCode" : room.roomCode,
                        "roomList": room.toDoList.id
        })
        # returns the room ID as the room code
    except Exception as e:
        return Response({"error": f"Failed to create room: {str(e)}"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_room(request):
    print("API is being called")
    # Debugging: Log request headers
    print("Request headers:", request.headers)
    print("Request user:", request.user)  # Debugging: Log the user
    print("Request room code:", request.data)

    user = request.user  # To check if the user is logged in

    # Add a check to make sure the user is logged in here!
    if not user.is_authenticated:
        return Response({"error": "User must be logged in"}, status=401)

    print("User", user, "is attempting to join room :",
          request.data.get("roomCode"))
    # takes the room code

    # if the user is already in another room they have to 'leave' that room first
    if SessionUser.objects.filter(user=user).exists():
        print("Deleting user from old session")
        session_users = SessionUser.objects.filter(user=user)
        for session_user in session_users:
            previous_session = session_user.session
            user = session_user.user
            previous_session.participants.remove(user)
            session_user.delete()
            print(" user removed from old session")

    room_code = request.data.get('roomCode')
    if StudySession.objects.filter(roomCode=room_code).exists():
        # Fetch the study session using the room code
        study_session = StudySession.objects.get(roomCode=room_code)

        # Add the user to the participants field
        study_session.participants.add(user)
        study_session.save()

        # Notify all clients in the room
        participants = study_session.participants.all()
        notify_participants(room_code, participants)

        print(f"Notifying participants in room {room_code}: {participants}")

        # create an instance of session user
        if SessionUser.objects.filter(user=user, session=study_session).exists():
            print("User is already in the session. Updating join sequence.")
            session_user = SessionUser.objects.filter(
                user=user, session=study_session).first()
            session_user.rejoin_session(user, study_session)
        else:
            print("Creating new SessionUser instance.")
            session_user = SessionUser.objects.create(
                user=user,
                session=study_session,
            )
        return Response({"message": "Joined successfully!"})
    return Response({"error": "Room not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_details(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request query params:", request.query_params)  # Debugging: Log the query parameters

    room_code = request.query_params.get('roomCode')  # Extract roomCode from query params

    print("Retrieving name for the study room", room_code)

    try:
        # get the room and get the name of the room
        study_session = StudySession.objects.get(roomCode=room_code)
        session_name = study_session.sessionName
        print("Retrieved the room name", session_name)
        return Response({"sessionName" : session_name,
                         "roomList": study_session.toDoList.id
        })
        # returns the room name
    except Exception as e:
        return Response({"error": f"Failed to retrieve room details: {str(e)}"}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_room(request):
    print("API is being called")
    print("Request headers:", request.headers)  # Debugging: Log request headers
    print("Request user:", request.user)  # Debugging: Log the user
    print("Request room code:", request.data)

    user = request.user  # To check if the user is logged in

    # Add a check to make sure the user is logged in here!
    if not user.is_authenticated:
        return Response({"error": "User must be logged in"}, status=401)

    print("User", user, "is attempting to leave room :", request.data.get("roomCode"))
    # takes the room code

    room_code = request.data.get('roomCode')
    if StudySession.objects.filter(roomCode=room_code).exists():
        print("room found")
        # Fetch the study session using the room code
        study_session = StudySession.objects.get(roomCode=room_code)

        # Remove the user from the participants field
        study_session.participants.remove(user)
        study_session.save()

        # Fetch the updated participants list
        participants = study_session.participants.all()

        # Notify all clients in the room
        notify_participants(room_code, participants)

        print(f"Notifying participants in room {room_code}: {participants}")

        try:
            session_user = SessionUser.objects.get(user=user, session=study_session)
            session_user.leave_session()

            if (study_session.participants.count() == 0):
                destroy_room(request, study_session)

            user1 = session_user.user
            return Response({"message": "Left successfully!", "username": user.username})
        except SessionUser.DoesNotExist:
            return Response({"error": "User is not in the session"}, status=404)
        return Response({"error": "Room not found"}, status=404)

# update the participants in real time as someone joins the room, and leaves the room
def notify_participants(room_code, participants):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"room_{room_code}",
        {
            'type': 'participants_update',
            'participants': [participant.username for participant in participants],
        }
    )

# destroy the room if there are no participants in it
def destroy_room(request, study_session):

    toDo = ViewToDoList()

    # delete the to do list in the room
    toDoList = study_session.toDoList.pk
    if toDoList:
        toDo.delete_list(request = request, list_id = toDoList)
    print("to do list deleted")
    print("session name: ", study_session.sessionName)
    study_session.delete()
    print("session deleted")




