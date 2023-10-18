# compass
A password manager developed with a paranoid security approach.


# Installing
Compass is intended to run in a <a href="https://github.com/django/django" target="_blank">Django</a> backend, utilizing also its model database system. 

Inside your Django environment, make sure to include this app in your settings.py INSTALLED_APPS variable, the path to Compass' root folder to the TEMPLATES variable, and don't forget to run `python3 manage.py migrate` afterwards. You might need to edit the name in `apps.py` accordingly. Also, make sure that the following packages are installed in your Python environment.

```
pip install django-ratelimit cryptography bcrypt
```

You must configure Django such that when a browser requests a path that points to compass, the file `index.html` inside Compass's root folder is rendered and sent as an HTTP response. In the context for rendering, you must specify the path to the base template as well as a user info object containing a user id. For example, if on your web server the path `/your_compass_path/` should open the editor, then your Django function to handle that request should look something like the following.

```python
from django.shortcuts import render
def index(request, path):
    context = {
        'user_info': {
            'user_id': 'I123'
        },
        'base_template': 'components/base_template.html' # replace with your own base template if needed
    }
    response = render(request, 'index.html', context)
    return response
```

Moreover, it is important that a post request for `/your_compass_path/server/` returns as a response the one that the function `handle_request(...)` inside the file `server/index.py` of the Colide root folder returns. This function take only the request as a parameter. The code for this can look something like this.
```python
from compass.server import index # change the path accordingly
def index(request, path):
    return index.handle_request(request)
```

