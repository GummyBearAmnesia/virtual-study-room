from django.urls import path
from .views.login_page import login
from .views.motivational_message import motivationalMessage



urlpatterns = [
    path('views/login-page', login),
    path('motivational-message/', motivationalMessage, name="motivational_message" ),
]