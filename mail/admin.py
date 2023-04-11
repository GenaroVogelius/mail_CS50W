from django.contrib import admin
from .models import *

# Register your models here.


class EmailAdmin(admin.ModelAdmin):
    list_display = ("user", "sender","recipients","subject","body", "timestamp", "read", "archived")

admin.site.register(Email)

class UserAdmin(admin.ModelAdmin):
    list_display = ("user")

admin.site.register(User)