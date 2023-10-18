
from . import crypto

def process(data, private_keys, new_password):

    skey1 = private_keys[0]

    name = crypto.decrypt(skey1,data['name']) if 'name' in data else None
    url = crypto.decrypt(skey1,data['url']) if 'url' in data else None
    comment = crypto.decrypt(skey1,data['comment']) if 'comment' in data else None
    try:
        crypto.decrypt(skey1,data['username'])
        crypto.decrypt(skey1,data['password'])
    except:
        return {'error':"Password is encrypted incorrectly."}
    # save encrypted data
    username = data['username']
    password = data['password']
    
    new_password.name = name
    new_password.url = url
    new_password.username = username
    new_password.password = password
    new_password.comment = comment
    new_password.save()
    
    return {'success':new_password.id}
    
