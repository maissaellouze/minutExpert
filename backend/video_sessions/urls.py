from django.urls import path
from .views import SessionStartView, SessionAcceptView, SessionStatusView, SessionPendingView, SessionEndView, SessionRejectView

urlpatterns = [
    path('start/',   SessionStartView.as_view(),   name='session-start'),
    path('accept/',  SessionAcceptView.as_view(),  name='session-accept'),
    path('reject/',  SessionRejectView.as_view(),  name='session-reject'),
    path('status/',  SessionStatusView.as_view(),  name='session-status'),
    path('pending/', SessionPendingView.as_view(), name='session-pending'),
    path('end/',     SessionEndView.as_view(),     name='session-end'),
]
