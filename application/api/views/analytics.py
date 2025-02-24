from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from api.models import SessionUser, User

from django.db import models

@api_view(['GET'])
def get_analytics(request, username=None):
    """
    Get analytics for a specific user (by ID or username).
    If no user_identifier is given, return the logged-in user's data.
    """

    if username:  
        # Try to get the user by username
        user = get_object_or_404(User, models.Q(username=username))
    else:
        # Default to logged-in user
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "You must be logged in to view analytics."}, status=401)

    # Calculate average study hours
    avg_study_hours = user.hours_studied / user.total_sessions if user.total_sessions > 0 else 0

    return Response({
        "streaks": user.streaks,
        "average_study_hours": round(avg_study_hours, 2)
    })