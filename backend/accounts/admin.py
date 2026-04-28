from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ClientProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('id', 'email', 'role', 'status', 'is_staff', 'is_active')
    list_filter = ('role', 'status', 'is_staff')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'phone', 'role', 'status', 'argent')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'phone', 'role', 'status', 'password1', 'password2'),
        }),
    )

    search_fields = ('email',)
    ordering = ('email',)

admin.site.register(ClientProfile)