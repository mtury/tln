pip install pip-review
pip review --local --interactive

pip uninstall -y `pip freeze`
pip install -r requirements.txt

makemigrations / migrate admin, auth, photologue

rm -rf critique/migrations/ ; ./manage.py makemigrations critique ; ./manage.py migrate critique
echo 'import sql_migrate' | ./manage.py shell

remove django<3 commands from zinnia & tagging



add PNG support
