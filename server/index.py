from django.http import JsonResponse
from django_ratelimit.core import is_ratelimited

from . import crypto, setup, add, search, get, edit, delete, change_passphrase

import importlib
from ..apps import CompassConfig
models = importlib.import_module(CompassConfig.name+'.models')

# The backend must return either index(request) or handle_request(request) when a POST request with path '/server/' is made
def index(request,response_context=None,server_interface=None):
    return handle_request(request)

def handle_request(request):
    if is_ratelimited(request, group='auth', key='post:passphrase', rate='20/m', increment=True) or is_ratelimited(request, group='auth', key='post:totp_pin', rate='20/m', increment=True) or is_ratelimited(request, group='auth', key='ip', rate='20/m', increment=True):
        return JsonResponse({'error':"Too many attempts. Try again later."})
    
    data = request.POST
    try:
        user_id = data['user_id']
        path = data['path']
    except:
        return JsonResponse({'error':"Invalid request."})
    
    try:
        local_public_key = crypto.import_public_key( data['local_public_key'] )
    except:
        local_public_key = None

    try:
        key_setup = models.KeySetup.objects.get(user_id=user_id)
    except models.KeySetup.DoesNotExist:
        key_setup = None

    # passphrase check
    try:
    #if key_setup != None and key_setup.key1_private_encoded != None:
        skey2 = crypto.import_private_key(key_setup.key2_private)
        passphrase = crypto.decrypt(skey2, data['passphrase'])
        skey1 = crypto.import_private_key(key_setup.key1_private_encoded, passphrase )
        private_keys = (skey1,skey2)
    except:
    #else:
        private_keys = None

    # totp check
    try:
        totp_pin = crypto.decrypt(skey1,data['totp_pin'])
        totp_check = crypto.totp_check(totp_pin,key_setup.totp_key)
    except:
        totp_check = False
    
    # Handle some special cases where the function must return early
    if key_setup == None or key_setup.active != True:
        # This should only happen in two cases: 
        #   path=='get_public_keys', i.e. the server just probes for the public keys
        #   or 
        #   path=='setup'
        if path=='get_public_keys':
            if 'check_setup' in data:
                if private_keys == None:
                    response_data = {'passphrase_invalid':1}
                else:
                    response_data = {
                        'key1_pub':key_setup.key1_public,
                        'key2_pub':key_setup.key2_public,
                        'local_secret': key_setup.local_secret,
                    }
            else:
                response_data = {'key1_pub':None,'key2_pub':None}
        elif path=='setup':
            if key_setup==None:
                key_setup = models.KeySetup(user_id=user_id)
            response_data = setup.process(data, key_setup, private_keys, totp_check, local_public_key)
        else:
            response_data = {'error':"Broken key setup. Please contact support."}
        return JsonResponse(response_data)

    if private_keys==None:
        # Passphrase was invalid
        return JsonResponse({'passphrase_invalid':1, 'key2_pub':key_setup.key2_public})

    # Note that past this point user_id is verified by the passphrase, i.e. sensitive data is never returned otherwise
    # make sure the rest of the script only uses password objects belonging to the correct user_id
    passwords = models.Password.objects.filter(user_id=user_id)

    if totp_check != True:
        # only allowed for path in ['get_public_keys','add','search']
        match path:
            case "get_public_keys":
                response_data = {
                    'local_secret': key_setup.local_secret,
                    'key1_pub': key_setup.key1_public,
                    'key2_pub': key_setup.key2_public,
                }
            case 'add':
                response_data = add.process(data, private_keys, models.Password(user_id=user_id))
            case 'search':
                response_data = search.process(data, private_keys, local_public_key, passwords)
            case _:
                response_data = {'error':"Incorect or used one time password."}
    else:
        match path:
            case "get":
                response_data = get.process(data, private_keys, local_public_key, passwords)
            case "edit":
                response_data = edit.process(data, private_keys, passwords)
            case "delete":
                response_data = delete.process(data, private_keys, passwords)
            case "change_passphrase":
                response_data = change_passphrase.process(data, private_keys, key_setup)
            case _:
                response_data = { 'error': 'Invalid request.'}
    
    return JsonResponse(response_data)
    
