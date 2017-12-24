from django.conf.urls import patterns, url, include
from django.views.generic import TemplateView
from . import views, APP_NAME

from api import LayerResource
from tastypie.api import Api

Resources_api = Api(api_name="api")
Resources_api.register(LayerResource())

urlpatterns = patterns(
    '',
    url(r'^$', views.home, name='%s.home' % APP_NAME),
    url(r'^new/$', views.new, name='%s.new' % APP_NAME),
    url(r'^(?P<instance_id>\d+)/edit/$', views.edit, name='%s.edit' % APP_NAME),
    url(r'^(?P<instance_id>\d+)/view/$', views.view, name='%s.view' % APP_NAME),

    url(r'^', include(Resources_api.urls)),
)
