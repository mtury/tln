import binascii
import json
import os
import pytz
import random
import requests
import shutil

from datetime import datetime, time
from itertools import chain
from PIL import Image
from django.conf import settings
from django.contrib.auth.decorators import login_required, permission_required
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404, render, redirect
from django.template.defaultfilters import slugify
from django.utils import timezone

from .forms import OeuvreForm, CommentaireForm, CinemaForm, SeanceForm
from .models import (Artiste, Oeuvre, OeuvreInfo, Titres, Tag,
                     Commentaire, TopFilms, TopJeux, Cinema, Seance)


# Index

def index(req):
    return render(req, 'critique/index.html', {})


# Artiste

def detail_artiste(req, slug):
    artist = get_object_or_404(Artiste, slug=slug)
    oeuvres = Oeuvre.objects.filter(info__artists=artist) \
                            .order_by('info__year')
    context = {'oeuvres': oeuvres, 'artist': artist.name}
    return render(req, 'critique/artiste.html', context)


# Oeuvre

# Helpers

def download_distant_image(url):
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        r.raw.decode_content = True
        h = binascii.hexlify(os.urandom(16))
        local_url = h.decode('ascii')
        with open('static/critique/tmp/%s' % local_url, 'wb') as f:
            shutil.copyfileobj(r.raw, f)
        baseheight = 300
        img = Image.open('static/critique/tmp/%s' % local_url)
        fmt = 'jpg'
        if img.format == 'PNG':
            fmt = 'png'
        hpercent = baseheight/float(img.size[1])
        wsize = int(float(img.size[0])*float(hpercent))
        img = img.resize((wsize, baseheight), Image.ANTIALIAS)
        img.save('static/critique/%s.%s' % (local_url, fmt))
        os.remove('static/critique/tmp/%s' % local_url)
        return 'critique/%s.%s' % (local_url, fmt)
    return ''

def get_oeuvre_form_data(oeuvre):
    form_data = {}
    form_data['mtype'] = oeuvre.info.mtype
    form_data['title_vf'] = oeuvre.info.titles.vf
    form_data['title_vo'] = oeuvre.info.titles.vo
    form_data['title_alt'] = oeuvre.info.titles.alt
    names = [artist.name for artist in oeuvre.info.artists.all()]
    form_data['artists'] = '; '.join(names)
    form_data['year'] = oeuvre.info.year
    form_data['imdb_id'] = oeuvre.info.imdb_id
    tags = [tag.tag for tag in oeuvre.tags.all()]
    form_data['tags'] = '; '.join(tags)
    form_data['envie'] = oeuvre.envie
    return form_data

@permission_required('critique.all_rights')
def update_oeuvre(req, oeuvre, form):
    oeuvre.info.mtype = form.cleaned_data['mtype']
    update_slug = form.cleaned_data['title_vf'] != oeuvre.info.titles.vf
    oeuvre.info.titles.vf = form.cleaned_data['title_vf']
    oeuvre.info.titles.vo = form.cleaned_data['title_vo']
    oeuvre.info.titles.alt = form.cleaned_data['title_alt']
    oeuvre.info.year = form.cleaned_data['year']
    oeuvre.info.imdb_id = form.cleaned_data['imdb_id']
    if form.cleaned_data['image_link']:
        url = download_distant_image(form.cleaned_data['image_link'])
        if oeuvre.info.image_url:
            try:
                os.remove('static/%s' % oeuvre.info.image_url)
            except FileNotFoundError:
                pass
        oeuvre.info.image_url = url
    oeuvre.envie = form.cleaned_data['envie']
    oeuvre.info.titles.save()
    oeuvre.info.save()
    oeuvre.save(update_slug=update_slug)

    artists_names = form.cleaned_data['artists'].split('; ')
    artists = []
    for artist_name in artists_names:
        artist, _ = Artiste.objects.get_or_create(name=artist_name,
                                                  slug=slugify(artist_name))
        artists.append(artist)
    oeuvre.info.artists.set(artists)
    tags = []
    tags_names = form.cleaned_data['tags'].split('; ')
    for tag_name in tags_names:
        tag, _ = Tag.objects.get_or_create(tag=tag_name)
        tags.append(tag)
    oeuvre.tags.set(tags)

def get_comment_form_data(comment):
    form_data = {}
    form_data['title'] = comment.title
    form_data['date'] = comment.date.strftime('%Y-%m-%d')
    if hasattr(comment, 'date_month_unknown'):
        form_data['no_month'] = comment.date_month_unknown
    if hasattr(comment, 'date_day_unknown'):
        form_data['no_day'] = comment.date_day_unknown
    form_data['content'] = comment.content
    return form_data

@permission_required('critique.all_rights')
def update_latest_comment(req, slug):
    comment_form = CommentaireForm(req.POST)
    if req.POST and comment_form.is_valid():
        # actually there should already have been client-side validation
        oeuvre = get_object_or_404(Oeuvre, slug=slug)
        comments = sorted(oeuvre.comments.all(), key=lambda p: p.date, reverse=True)
        update_comment_with_form(comments[0], comment_form)
        oeuvre.save()
    return redirect('detail_oeuvre', slug=slug)

def update_comment_with_form(comment, form):
    comment.title = form.cleaned_data['title']
    dt = datetime.combine(form.cleaned_data['date'], datetime.now().time())
    comment.date = timezone.make_aware(dt, pytz.timezone(settings.TIME_ZONE))
    comment.date_month_unknown = form.cleaned_data['no_month']
    comment.date_day_unknown = form.cleaned_data['no_day']
    comment.content = form.cleaned_data['content']
    comment.save()

@permission_required('critique.all_rights')
def add_comment(req, slug):
    form = CommentaireForm(req.POST)
    if form.is_valid():
        oeuvre = get_object_or_404(Oeuvre, slug=slug)
        comment = Commentaire(oeuvre=oeuvre)
        update_comment_with_form(comment, form)
        oeuvre.comments.add(comment)
    return redirect('detail_oeuvre', slug=slug)

# Views

@permission_required('critique.all_rights')
def add_oeuvre(req):
    form = OeuvreForm(req.POST)
    oeuvre = Oeuvre(info=OeuvreInfo(titles=Titres()))
    if form.is_valid():
        update_oeuvre(req, oeuvre, form)
        return redirect('detail_oeuvre', slug=oeuvre.slug)

def detail_oeuvre(req, slug):
    """
    We need to order the comments by date before sending them to the template.
    For now, only the most recent comment may be edited.
    """
    oeuvre = get_object_or_404(Oeuvre, slug=slug)
    comments = comment_form = None
    if oeuvre.comments.count() > 0:
        comments = sorted(oeuvre.comments.all(), key=lambda p: p.date, reverse=True)
        comment_form = CommentaireForm(get_comment_form_data(comments[0]))
    oeuvre_form = OeuvreForm(req.POST or get_oeuvre_form_data(oeuvre))
    if req.POST and oeuvre_form.is_valid():
        # actually there should already have been client-side validation
        update_oeuvre(req, oeuvre, oeuvre_form)
        # we redirect because the slug might change
        return redirect('detail_oeuvre', slug=oeuvre.slug)
    return render(req, 'critique/oeuvre.html', locals())

@permission_required('critique.all_rights')
def delete_oeuvre(req, slug):
    oeuvre = get_object_or_404(Oeuvre, slug=slug)
    mtype = oeuvre.info.mtype
    if hasattr(oeuvre.info, 'image_url') and oeuvre.info.image_url:
        try:
            os.remove('static/%s' % oeuvre.info.image_url)
        except FileNotFoundError:
            pass
    oeuvre.delete()
    return redirect('list_oeuvres', mtype)

@permission_required('critique.all_rights')
def delete_latest_comment(req, slug):
    oeuvre = get_object_or_404(Oeuvre, slug=slug)
    if oeuvre.comments:
        comments = sorted(oeuvre.comments.all(), key=lambda p: p.date, reverse=True)
        comments[0].delete()
    return redirect('detail_oeuvre', slug=slug)


# Search Oeuvres

def format_oeuvreinfo_results(info_set, ajax):
    if ajax:
        res = [ {'vf': info.titles.vf,
                 'vo': info.titles.vo,
                 'year': info.year,
                 'slug': info.oeuvre.slug} for info in info_set ]
        return json.dumps(res)
    else:
        return [info.oeuvre for info in info_set]

def get_oeuvres(match, limit, ajax=False):
    artiste = Artiste.objects.filter(name__iexact=match)
    if artiste:
        o_info = artiste[0].oeuvres_info.select_related('oeuvre', 'titles') \
                                        .order_by('-year')[:limit]
        return format_oeuvreinfo_results(o_info, ajax)
    else:
        o_info = OeuvreInfo.objects \
                           .filter(Q(oeuvre__comment__isnull=False) &
                                     (Q(titles__vo__icontains=match) |
                                      Q(titles__vf__icontains=match))) \
                           .select_related('oeuvre', 'titles') \
                           .order_by('-oeuvre__comment__date')[:limit]
        o_info_cnt = o_info.count()
        if o_info_cnt == limit:
            return format_oeuvreinfo_results(o_info, ajax)
        else:
            o_info2 = OeuvreInfo.objects \
                                .filter(Q(oeuvre__comment=None) &
                                          (Q(titles__vo__icontains=match) |
                                           Q(titles__vf__icontains=match))) \
                                .order_by('-year')[:limit-o_info_cnt]
            o_info_concat = list(chain(o_info, o_info2))
            return format_oeuvreinfo_results(o_info_concat, ajax)

def search_oeuvres(req, match=''):
    get_match = req.GET.get('match', None)
    if get_match is not None:
        if get_match:
            return redirect('search_oeuvres', match=get_match)
        else:
            return redirect('search_oeuvres')

    if req.is_ajax():
        oeuvres = get_oeuvres(match, 5, ajax=True)
        return HttpResponse(oeuvres)
    else:
        oeuvres = get_oeuvres(match, 10)
        return render(req, 'critique/search_oeuvres.html', locals())


# Top Textes

def top_textes(req):
    top_textes = Commentaire.objects.filter(starred=True).order_by('-date')
    return render(req, 'critique/top_textes.html', locals())


# Notes

def list_notes(req, mtype="all", page=1):
    if mtype == "all":
        notes_full = Commentaire.objects.all()
    else:
        notes_full = Commentaire.objects.filter(oeuvre__info__mtype=mtype)
    notes_full = notes_full.order_by('-date')
    paginator = Paginator(notes_full, 20)
    try:
        notes = paginator.page(page)
    except EmptyPage:
        notes = paginator.page(paginator.num_pages)
    context = {'notes': notes, 'mtype': mtype}
    return render(req, 'critique/notes.html', context)


# Collection

def list_oeuvres(req, mtype="film", page=1):
    """
    Liste les oeuvres qui ne sont pas marquées en tant qu'envies.
    (Les "re-" envies ne sont pas prises en charge.)
    """
    oeuvres_list = Oeuvre.objects.filter(envie=False, info__mtype=mtype)
    oeuvres = oeuvres_list.order_by('-info__year', '-id')
    context = {'oeuvres': oeuvres, 'mtype': mtype}
    return render(req, 'critique/collection.html', context)


# Envies

def list_envies(req, mtype="film", page=1):
    oeuvres_list = Oeuvre.objects.filter(envie=True, info__mtype=mtype)
    oeuvres = oeuvres_list.order_by('-info__year', '-id')
    paginator = Paginator(oeuvres, 22)
    try:
        oeuvres_page = paginator.page(page)
    except EmptyPage:
        oeuvres_page = paginator.page(paginator.num_pages)
    context = {'oeuvres': oeuvres_page, 'mtype': mtype}
    return render(req, 'critique/envies.html', context)


# Cinemas

# Helpers

def get_cinema_form_data(cinema):
    form_data = {}
    form_data['name'] = cinema.name
    form_data['comment'] = cinema.comment
    form_data['visited'] = cinema.visited.strftime('%Y-%m-%d')
    return form_data

@permission_required('critique.all_rights')
def update_cinema(req, cinema, form):
    cinema.name = form.cleaned_data['name']
    cinema.comment = form.cleaned_data['comment']
    cinema.visited = form.cleaned_data['visited']
    cinema.save()

# Views

def list_cinemas(req):
    """
    L'ordre des cinémas est aléatoire, mais constant pour un jour donné.
    """
    cinemas = list(Cinema.objects.all())
    random.seed(datetime.today().date())
    random.shuffle(cinemas)
    return render(req, 'critique/cinemas.html', {'cinemas': cinemas})

def detail_cinema(req, slug):
    cinema = get_object_or_404(Cinema, slug=slug)
    form = CinemaForm(req.POST or get_cinema_form_data(cinema))
    if req.POST and form.is_valid():
        update_cinema(req, cinema, form)
    return render(req, 'critique/cinema.html', locals())

@permission_required('critique.all_rights')
def delete_cinema(req, slug):
    cinema = get_object_or_404(Cinema, slug=slug).delete()
    return redirect('list_cinemas')


# Séances

@permission_required('critique.all_rights')
def update_seance(req, seance, data):
    seance.cinema = data['cinema']
    date = data['date']
    dtime = time(int(data['hour'][:2]), int(data['hour'][3:5]))
    dt = datetime.combine(date, dtime)
    seance.date = timezone.make_aware(dt, pytz.timezone(settings.TIME_ZONE))
    if 'no_month' in data:
        seance.date_month_unknown = data['no_month']
    if ('film_slug' not in data and
        'seance_title' not in data):
        return
    if 'film_slug' in data and data['film_slug']:
        seance.film = get_object_or_404(Oeuvre, slug=data['film_slug'])
    elif 'seance_title' in data:
        seance.seance_title = data['seance_title']
    seance.save()

@permission_required('critique.all_rights')
def add_seance(req):
    form = SeanceForm(req.POST)
    seance = Seance()
    if form.is_valid():
        update_seance(req, seance, form.cleaned_data)
        return redirect('list_seances', year=seance.date.year)

def list_seances(req, year=2020):
    form = SeanceForm(req.POST)
    if req.POST and form.is_valid():
        update_seances(req, form)

    if year > 2011:
        start = datetime(year, 1, 1)
        end = datetime(year, 12, 31)
    else:
        year = 2011
        start = datetime(1998, 1, 1)
        end = datetime(2011, 12, 31)
    seances = Seance.objects.filter(date__gte=start) \
                            .filter(date__lte=end) \
                            .order_by('date')

    seances_enhanced = []
    for seance in seances:
        seances_enhanced.append((seance, seance.film))

    return render(req, 'critique/seances.html', locals())


# Top Films

def top_films(req, year=2011):
    oeuvres = list(get_object_or_404(TopFilms, year=year).films.all())
    random.shuffle(oeuvres)
    return render(req, 'critique/top_films.html', locals())


# Top Jeux

def top_jeux(req, year=2020):
    oeuvres = list(get_object_or_404(TopJeux, year=year).jeux.all())
    random.shuffle(oeuvres)
    return render(req, 'critique/top_jeux.html', locals())
