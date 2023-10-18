from . import crypto

def process(data, private_keys, passwords):
    
    skey1=private_keys[0]
    
    try:
        pid = int(crypto.decrypt(skey1,data['delete_id']))
        pw = passwords.get(id=pid)
    except:
        return {'error':"Password id invalid."}

    pw.delete()

    return {'success':1}


