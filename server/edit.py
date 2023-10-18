from . import crypto

def process(data, private_keys, passwords):
    skey1=private_keys[0]
    
    try:
        edit_id = crypto.decrypt(skey1,data['edit_id'])
        edit_id=int(edit_id)
        pw = passwords.get(id=edit_id)
    except:
        return {'error':"Password id invalid."}
    
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
    
    pw.name = name
    pw.url = url
    pw.username = username
    pw.comment = comment
    if password != '':
        pw.password=password
    
    pw.save()
    return {'success':edit_id}
    
