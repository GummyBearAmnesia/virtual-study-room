from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import MotivationalMessage
from random import randint


@api_view(['GET'])
def motivationalMessage(request):
    numMessages = MotivationalMessage.objects.count()
    # choosing a random motivational message from the database
    motivation = MotivationalMessage.objects.get(id = randint(1, numMessages))
    message = motivation.text
    return Response({'message': message})