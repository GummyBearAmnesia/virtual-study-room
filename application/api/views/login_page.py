from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

# ACTUALLY WE DONT NEED THIS FILE ANYMORE...
# LET IT BE AN EXAMPLE


# POST method API call to send credentials to database server
# we do not use GET here because that would send the password details...
# ...to the frontend which is less secure!
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        })
    return Response({'error': 'Invalid Credentials'}, status=400)
