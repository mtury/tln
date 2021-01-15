Les chunks cinemas et seances (pour les années avant 2021) sont mis en cache indéfiniment.
Les modifs dans la base de données ne seront donc pas directement répercutées sur le site.
Il faut d'abord vider le cache :

$ vtln
$ ./manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()

Un nouveau cache sera créé au prochain chargement des pages concernées.
