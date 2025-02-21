from django.contrib.auth.mixins import LoginRequiredMixin
from api.models import List, toDoList, Permission
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views import View
from rest_framework.permissions import IsAuthenticated

class ViewToDoList(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, is_shared="false"):
        user = request.user
        is_shared_bool = is_shared.lower() == "true"

        user_permissions = Permission.objects.filter(user_id=user)
        user_lists = List.objects.filter(
            id__in=user_permissions.values_list('list_id', flat=True),
             is_shared=is_shared_bool
             )

        
        response_data = []
        for todo_list in user_lists:
            # Fetch related tasks manually
            tasks = toDoList.objects.filter(list=todo_list)


            response_data.append({
                "id": todo_list.id,
                "name": todo_list.name,
                "is_shared": todo_list.is_shared,
                "tasks": [
                    {
                        "id": task.id,
                        "title": task.title,
                        "content": task.content,
                        "is_completed": task.is_completed,
                    }
                    for task in tasks
                ]
            })

        return Response(response_data, status=status.HTTP_200_OK)
    
    def post(self):
        pass
