from . import crypto

def process(data, private_keys, key_setup):
    
    skey1,skey2=private_keys
    
    try:
        new_passphrase = crypto.decrypt(skey2, data['new_passphrase'])
        key1_private_encoded = crypto.export_private_key(skey1,new_passphrase)
        crypto.import_private_key(key1_private_encoded, new_passphrase )
    except:
        return {'error':"Something went wrong. Keeping the old passphrase."}
    
    key_setup.key1_private_encoded = key1_private_encoded
    key_setup.save()

    return {'success':1}

