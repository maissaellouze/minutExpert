from django.urls import path
from .views import CategoryListView, ExpertListView, ExpertDetailView, ExpertMeView, ExpertMySessionsView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('list/', ExpertListView.as_view(), name='expert-list'),
    path('me/', ExpertMeView.as_view(), name='expert-me'),
    path('me/sessions/', ExpertMySessionsView.as_view(), name='expert-me-sessions'),
    path('detail/<int:pk>/', ExpertDetailView.as_view(), name='expert-detail'),
]
