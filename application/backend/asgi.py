import os
import django
from django.core.asgi import get_asgi_application


# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from api.routing import websocket_urlpatterns

# ASGI application router that handles both HTTP and WebSocket protocols
application = ProtocolTypeRouter({

    # Standard HTTP requests -> Django ASGI application
    "http": get_asgi_application(),
    
    # WebSocket connections -> Custom URL routing from api/routing.py
    "websocket": URLRouter(websocket_urlpatterns),
})
