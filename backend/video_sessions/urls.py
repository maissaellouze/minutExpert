from django.urls import path
from .views import SessionStartView, SessionEndView

urlpatterns = [
    path('start/', SessionStartView.as_view(), name='session-start'),
    path('end/', SessionEndView.as_view(), name='session-end'),
]
