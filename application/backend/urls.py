"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from api.views.profile_view import get_logged_in_user, save_description, get_user_badges

from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api import views

from api.views.analytics import get_analytics

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    path('api/profile/', get_logged_in_user, name='get_logged_in_user'),
    path('api/description/', save_description, name='save_description'),
    path('api/badges/', get_user_badges, name='get_user_badges'),
    path('api/signup/', views.SignUpView.as_view(), name='signup'),
    path("api/analytics/", get_analytics, name="analytics"),  # Default for logged-in user
    path("api/analytics/<str:username>/", get_analytics, name="analytics_by_user"),  # Fetch by username
    path('api/login/', views.login, name='login'),
    path('api/todolists/<str:is_shared>/', views.ViewToDoList.as_view(), name='toDoList'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/motivational-message/', views.motivationalMessage, name='motivation'),
    path('api/check-email/', views.checkEmailView, name='check_email'),
    path('api/check-username/', views.checkUsernameView, name='check_username')
] 

