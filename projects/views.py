from rest_framework import viewsets
from .models import Workspace, Project, Task
from .serializers import WorkspaceSerializer, ProjectSerializer, TaskSerializer

class WorkspaceViewSet(viewsets.ModelViewSet):
    """Логика управления пространствами"""
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [] # Доступно без токенов для быстрого теста

class ProjectViewSet(viewsets.ModelViewSet):
    """Логика управления проектами"""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = []

class TaskViewSet(viewsets.ModelViewSet):
    """Логика управления задачами на Канбан-доске"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = []
