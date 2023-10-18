from web_framework.component_handler import ComponentHandler
from web_framework import base_view

from django.shortcuts import render
from django.template import loader
from django.http import JsonResponse

import sys,shutil,tarfile

def index(request,response_dict,server_interface):
    base_view.server_interface = server_interface
    
    # render popup.html
    filepath = 'compass/addons/popup.html'

    path = server_interface.conf()['root']+server_interface.conf()['template_path']
    context = {
    }
    context["translations"] = base_view.get_translations(filepath,path,response_dict['language_code'])
    for key in response_dict:
        if not key in ["set_cookies", "remove_cookies", "status_code", 'xframe_options']:
            context[key] = response_dict[key]
    
    resp = loader.render_to_string(filepath, context=context, using=path)
    resp=resp.replace('server/','https://www.comonoid.com/compass/server/')
    resp=resp.replace('/login/','https://www.comonoid.com/login/')
    rendered_html = ''

    script_index = 0

    while len(resp) != 0:
        i = resp.find('<script>')
        if i == -1:
            rendered_html += resp
            resp = ''
            break
        rendered_html += resp[:i] + '<script src="popup'+str(script_index)+'.js"></script>'
        
        resp = resp[i+len('<script>'):]

        i = resp.find('</script>')
        script = resp[:i]
        open(path+'compass/addons/firefox/popup_build/popup'+str(script_index)+'.js','w').write(script)
        resp = resp[i+len('</script>'):]
        script_index += 1

    open(path+'compass/addons/firefox/popup_build/popup.html','w').write(rendered_html)

    shutil.make_archive(path+'compass/addons/build_firefox', 'zip', path+'compass/addons/firefox')
    
    #EXCLUDE_FILES = ['__pycache__']
    #tar = tarfile.open(path+'compass/addons/build_firefox.tar.gz', "w:gz")
    #tar.add(path+'compass/addons/firefox', filter=lambda x: None if x.name in EXCLUDE_FILES else x)
    #tar.close()

    return JsonResponse({'msg': 'success' })

    # create file for each <script> tag, replace everything inside
