from django.urls import path
from .views import CategoryListView, ExpertListView, ExpertDetailView

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('list/', ExpertListView.as_view(), name='expert-list'),
    path('detail/<int:pk>/', ExpertDetailView.as_view(), name='expert-detail'),
]
