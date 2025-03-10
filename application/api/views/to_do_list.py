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
                "id": todo_list.pk,
                "name": todo_list.name,
                "is_shared": todo_list.is_shared,
                "tasks": [
                    {
                        "id": task.pk,
                        "title": task.title,
                        "content": task.content,
                        "is_completed": task.is_completed,
                        "creation_date": task.creation_date
                    }
                    for task in tasks
                ]
            })

        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        # Define the action type in request body

        url_name = request.resolver_match.view_name

        if url_name == "create_new_task":
            return self.create_task(request)
        elif url_name == "create_new_list":
            return self.create_list(request)
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id = None):

        url_name = request.resolver_match.view_name
        if url_name == "delete_task":
            return self.delete_task(request, id)
        elif url_name == "delete_list":
            return self.delete_list(request, id)
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

    def delete_task(self, request, task_id):
        try:

            if toDoList.objects.filter(pk=task_id).exists():
                toDoList.objects.get(pk=task_id).delete()
                return self.get(request)
            else:
                return Response({"error": "Task doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete_list(self, request, list_id):
        print("Deleting ..")
        try:

            if List.objects.filter(pk=list_id).exists():
                toDoList.objects.filter(list=list_id).delete()
                Permission.objects.filter(list_id = list_id).delete()
                List.objects.get(pk=list_id).delete()

                return self.get(request)
            else:
                return Response({"error": "Task doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create_task(self, request):
        try:
            print("Creating list ...")
            data = request.data
            title = data.get("title")
            list_id = data.get("list_id")
            content = data.get("content")

            if List.objects.filter(pk=list_id).exists():
                list = List.objects.get(pk=list_id)
                task = toDoList.objects.create(
                    title=title, content=content, list=list)
                task.save()


                response_data={
                    "listId": task.list.pk,
                    "id": task.pk,
                    "title": task.title,
                    "content": task.content,
                    "is_completed": task.is_completed,
                    #"creation_date": task.creation_date
                }
                return Response(response_data, status=status.HTTP_200_OK)

            else:
                return Response({"error": "List doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def create_list(self, request):
        try:
            user = request.user
            data = request.data
            name = data.get("name")
            is_shared = data.get("is_shared")

            list = List.objects.create(
                name=name, is_shared=is_shared)
            list.save()

            permission = Permission.objects.create(list_id=list, user_id=user)
            permission.save()
            
            response_data = {
                "listId": list.pk,
                "name": list.name,
                "isShared": list.is_shared,
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    def patch(self, request, task_id):
        print(f"Received PATCH request for task_id: {task_id}")

        try:
        # This line throws DoesNotExist if not found
            task = toDoList.objects.get(id=task_id)

            new_task_status = not task.is_completed
            task.is_completed = new_task_status
            task.save()

            return Response({"is_completed": task.is_completed}, status=status.HTTP_200_OK)

        except toDoList.DoesNotExist:  # Catch the specific exception
            return Response({"error": "Task not found"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": "Invalid request", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
