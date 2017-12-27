from django.shortcuts import (
    render,
    HttpResponse,
    redirect,
    HttpResponseRedirect
)
from django.contrib.auth.decorators import login_required
from django.utils.safestring import mark_safe
from django.conf import settings

from geonode.maps.views import _PERMISSION_MSG_VIEW

from cartoview.app_manager.models import AppInstance, App
from cartoview.app_manager.views import _resolve_appinstance

from . import APP_NAME
import json


def home(request):
    return render(
        request,
        template_name="%s/home.html" % APP_NAME,
        context={'app_name': APP_NAME}
    )


@login_required
def new(request):
    if request.method == 'POST':
        return save(request, app_name=APP_NAME)
    return render(
        request,
        template_name="%s/new.html" % APP_NAME,
        context={'app_name': APP_NAME}
    )


@login_required
def view(request, instance_id, template="%s/view.html" % APP_NAME, context={}):
    instance = _resolve_appinstance(
        request,
        instance_id,
        'base.view_resourcebase',
        _PERMISSION_MSG_VIEW
    )
    instance = AppInstance.objects.get(pk=instance_id)
    context.update(instance=instance)
    context.update(app_name=APP_NAME)
    context.update(basemaps=json.dumps(settings.MAP_BASELAYERS))
    return render(request, template, context)


def save(request, instance_id=None, app_name=APP_NAME):
    res_json = dict(success=False)

    data = json.loads(request.body)

    title = data.get('title', "")
    abstract = data.get('abstract', "")
    config = data.get('config', None)
    access = config['access']

    config = json.dumps(data.get('config', None))

    if instance_id is None:
        instance_obj = AppInstance()
        instance_obj.app = App.objects.get(name=app_name)
        instance_obj.owner = request.user
    else:
        instance_obj = AppInstance.objects.get(pk=instance_id)

    instance_obj.title = title
    instance_obj.abstract = abstract
    instance_obj.config = config
    instance_obj.save()

    owner_permissions = [
        'view_resourcebase',
        'download_resourcebase',
        'change_resourcebase_metadata',
        'change_resourcebase',
        'delete_resourcebase',
        'change_resourcebase_permissions',
        'publish_resourcebase',
    ]

    if access == "private":
        permessions = {
            'users': {
                '{}'.format(request.user): owner_permissions,
            }
        }
    else:
        permessions = {
            'users': {
                '{}'.format(request.user): owner_permissions,
                'AnonymousUser': [
                    'view_resourcebase',
                ],
            }
        }
    # set permissions so that no one can view this appinstance other than
    #  the user
    instance_obj.set_permissions(permessions)

    res_json.update(dict(success=True, id=instance_obj.id))
    return HttpResponse(json.dumps(res_json), content_type="application/json")


@login_required
def edit(request, instance_id, template="%s/edit.html" % APP_NAME, context={}):
    instance = _resolve_appinstance(
        request,
        instance_id,
        'base.view_resourcebase',
        _PERMISSION_MSG_VIEW
    )

    if request.method == 'POST':
        return save(request, instance_id)

    instance = AppInstance.objects.get(pk=instance_id)
    context.update(instance=instance)
    context.update(app_name=APP_NAME)
    return render(request, template, context)
