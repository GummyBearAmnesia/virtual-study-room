
from api.models import User
from rest_framework.decorators import api_view

from rest_framework.response import Response
from rest_framework import status

@api_view(["POST"])
def signup(request):
    try:
        data = request.data  
        firstname = data.get("firstname")
        lastname = data.get("lastname")
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        password_confirmation = data.get("passwordConfirmation")

        if password != password_confirmation:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            firstname=firstname, lastname=lastname, username=username, email=email, password=password)

        user.save()

        return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
