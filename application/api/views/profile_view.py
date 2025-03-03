from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models.rewards import Rewards

'''Retrives the username and description of the currently logged in user'''
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ensures only logged in users can access
def get_logged_in_user(request):
    user = request.user  # get authenticated user

    return Response({
        "username": user.username,
        "description": user.description,
    })

'''Saves the updated description in the user model'''
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def save_description(request):
    user = request.user
    description = request.data.get('description')
    if description is None:
        description = ""
    user.description = description
    user.save()

    return Response({
        "message": "Description updated successfully",
        "username": user.username,
        "description": user.description,
    })

'''Returns the list of badges that the user currently has'''
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_badges(request):
    user = request.user
    badges = Rewards.objects.filter(user=user)
    badge_list = [
        {
            "reward_number": badge.reward_number,
            "date_earned": badge.date_earned,
        }
        for badge in badges
    ]

    return Response(badge_list)