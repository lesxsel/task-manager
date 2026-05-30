from django.db import models
from django.contrib.auth import get_user_model

# Получаем стандартную модель пользователя Django
User = get_user_model()

class Workspace(models.Model):
    """Рабочее пространство (компания или личное пространство)"""
    name = models.CharField(max_length=255, verbose_name="Название пространства")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="workspaces", verbose_name="Владелец")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    """Проект внутри рабочего пространства"""
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="projects", verbose_name="Пространство")
    name = models.CharField(max_length=255, verbose_name="Название проекта")
    description = models.TextField(blank=True, null=True, verbose_name="Описание проекта")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    """Задача внутри проекта (карточка для Канбан-доски)"""
    # Варианты статусов для Канбан-доски
    STATUS_CHOICES = [
        ('todo', 'Нужно сделать'),
        ('in_progress', 'В работе'),
        ('done', 'Готово'),
    ]

    # Варианты приоритетов
    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks", verbose_name="Проект")
    title = models.CharField(max_length=255, verbose_name="Заголовок задачи")
    description = models.TextField(blank=True, null=True, verbose_name="Описание задачи")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo', verbose_name="Статус")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name="Приоритет")
    
    # Исполнитель (может быть пустым, если задача еще никому не поручена)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks", verbose_name="Исполнитель")
    
    due_date = models.DateField(null=True, blank=True, verbose_name="Срок выполнения")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
