from django.contrib import admin
from django.contrib.auth.models import User
from django.forms.models import BaseInlineFormSet

from photologue.admin import GalleryAdmin as GalleryAdminDefault, PhotoAdmin as PhotoAdminDefault
from photologue.models import Gallery, Photo

from .models import GalleryCustom, PhotoCustom


class GalleryCustomFormSet(BaseInlineFormSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.forms[0].fields["allowed_users"].queryset = User.objects.filter(is_superuser=False)
        #
        # Instead of excluding all non-superusers,
        # we could also include all superusers by default.
        #
        #initial = []
        #allowed_users = list(User.objects.filter(is_superuser=True) \
        #                                 .values_list("pk", flat=True))
        #initial.append({"allowed_users": allowed_users})
        #self.initial = initial
        #self.extra += len(initial)

class GalleryCustomInline(admin.StackedInline):
    model = GalleryCustom
    can_delete = False
    filter_horizontal = ("allowed_users",)
    formset = GalleryCustomFormSet

class GalleryAdmin(GalleryAdminDefault):
    inlines = [GalleryCustomInline, ]

class PhotoCustomInline(admin.StackedInline):
    model = PhotoCustom
    can_delete = False

class PhotoAdmin(PhotoAdminDefault):
    inlines = [PhotoCustomInline, ]

admin.site.unregister(Gallery)
admin.site.register(Gallery, GalleryAdmin)
admin.site.unregister(Photo)
admin.site.register(Photo, PhotoAdmin)
