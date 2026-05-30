from django.contrib import admin
from django.urls import path, include  # Не забудь импортировать include!

urlpatterns = [
    # Твоя рабочая админка
    path('admin/', admin.site.urls),
    
    # Подключаем наше приложение с задачами к адресу /api/
    path('api/', include('projects.urls')),
]
