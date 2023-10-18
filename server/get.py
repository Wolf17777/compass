
from . import crypto

def process(data, private_keys, local_public_key, passwords):
    skey1 = private_keys[0]
    
    try:
        pid = int(crypto.decrypt(skey1,data['get_id']))
        pw = passwords.get(id=pid)
    except:
        return {'error':"Password id invalid."}
    
    d={}
    d['password']={
        'id': crypto.encrypt(local_public_key,str(pid)),
        'name': crypto.encrypt(local_public_key,pw.name) if pw.name != None else None,
        'url': crypto.encrypt(local_public_key,pw.url) if pw.url != None else None,
        'comment': crypto.encrypt(local_public_key,pw.comment) if pw.comment != None else None,
        'username': crypto.decrypt(skey1,pw.username), #already encrypted with local key
        'password': crypto.decrypt(skey1,pw.password), #already encrypted with local key
    }
    return d


