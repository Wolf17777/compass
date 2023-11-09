
from . import crypto

def process(data, private_keys, local_public_key, passwords):

    if not 'search_string' in data:
        return {'error':"Invalid request."}
    
    skey1 = private_keys[0]

    search_string = crypto.decrypt(skey1,data['search_string'])
    pws = passwords.filter(url__icontains=search_string) | passwords.filter(name__icontains=search_string) 
    # WHERE url LIKE CONCAT('%', search_string, '%') OR name LIKE CONCAT('%', search_string, '%');
    found_passwords=[]
    for pw in pws:
        found_passwords.append({
            'id': crypto.encrypt(local_public_key,str(pw.id)),
            'name': crypto.encrypt(local_public_key,pw.name) if pw.name != None else None,
            'url': crypto.encrypt(local_public_key,pw.url) if pw.url != None else None,
            'comment': crypto.encrypt(local_public_key,pw.comment) if pw.comment != None else None,
            'username': crypto.decrypt(skey1,pw.username), #already encrypted with local key
        })
    d = { 'passwords' : found_passwords}
    return d

    

