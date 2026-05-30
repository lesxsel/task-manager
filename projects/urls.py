from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkspaceViewSet, ProjectViewSet, TaskViewSet

# Роутер автоматически свяжет ViewSet-ы с адресами
router = DefaultRouter()
router.register('workspaces', WorkspaceViewSet, basename='workspace')
router.register('projects', ProjectViewSet, basename='project')
router.register('tasks', TaskViewSet, basename='task')

urlpatterns = [
    path('', include(router.urls)),
]
