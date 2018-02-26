from django.urls import path
from . import views

urlpatterns = [
    path('', views.preambule, name='preambule'),
    path('oeuvre/add', views.add_oeuvre, name='add_oeuvre'),
    path('oeuvre/<slug:slug>', views.detail_oeuvre, name='detail_oeuvre'),
    path('oeuvre/<slug:slug>/delete', views.delete_oeuvre, name='delete_oeuvre'),
    path('oeuvre/<slug:slug>/add_comment', views.add_comment, name='add_comment'),
    path('oeuvre/<slug:slug>/update_latest_comment', views.update_latest_comment, name='update_latest_comment'),
    path('oeuvre/<slug:slug>/delete_latest_comment', views.delete_latest_comment, name='delete_latest_comment'),
    path('artiste/<str:artist>', views.artiste, name='artiste'),
    path('envies/', views.list_envies, name='list_envies'),
    path('envies/<str:mtype>', views.list_envies, name='list_envies'),
    path('envies/<str:mtype>/<int:page>', views.list_envies, name='list_envies'),
    path('collection/', views.list_oeuvres, name='list_oeuvres'),
    path('collection/<str:mtype>', views.list_oeuvres, name='list_oeuvres'),
    path('collection/<str:mtype>/<int:page>', views.list_oeuvres, name='list_oeuvres'),
    path('notes/', views.list_notes, name='list_notes'),
    path('notes/<int:page>', views.list_notes, name='list_notes'),
    path('notes/<str:mtype>', views.list_notes, name='list_notes'),
    path('notes/<str:mtype>/<int:page>', views.list_notes, name='list_notes'),
    path('top_films/', views.top_films, name='top_films'),
    path('top_films/<int:year>', views.top_films, name='top_films'),
    path('textes/', views.top_textes, name='top_textes'),
    path('cinema/id/<str:id>', views.detail_cinema, name='detail_cinema'),
    path('cinema/id/<str:id>/delete', views.delete_cinema, name='delete_cinema'),
    path('cinemas/', views.list_cinemas, name='list_cinemas'),
    path('seances/', views.list_seances, name='list_seances'),
    path('seances/add', views.add_seance, name='add_seance'),
    path('seances/<int:year>', views.list_seances, name='list_seances'),
]

