from . import crypto

def process(data, key_setup, private_keys, totp_check, local_public_key):
    
    step = data['step']
    data_response = {}
    
    match step:
        case "generate_key2":
            # generate new key2 priv and pub
            new_key = crypto.generate_key()

            key2_private = crypto.export_private_key(new_key)
            key2_public = crypto.export_public_key(new_key.public_key())

            key_setup.key2_private = key2_private
            key_setup.key2_public = key2_public
            key_setup.save()

            data_response['key2_pub']= key2_public
        case "generate_key1":
            if key_setup.key2_private == None:
                return {'error':"Broken key setup. Please restart the setup process."}
            
            # decrypt passphrase using key2
            passphrase = crypto.decrypt(crypto.import_private_key(key_setup.key2_private),data['new_passphrase']) 
            # generate new key1 priv and pub
            # encrypt key1 priv by passphrase
            new_key = crypto.generate_key()
            key1_private_encoded = crypto.export_private_key(new_key,passphrase)
            key1_public = crypto.export_public_key(new_key.public_key())

            local_secret = data['local_secret']

            totp_key = crypto.generate_totp_key(3) # generate totp 
            
            key_setup.key1_private_encoded = key1_private_encoded
            key_setup.key1_public = key1_public
            key_setup.totp_key = totp_key
            key_setup.local_secret = local_secret
            key_setup.save()
            
            # include encrypted totp in return to client using local_public_key
            data_response['totp_key'] = crypto.encrypt(local_public_key,totp_key)
            data_response['key1_pub']= key1_public
            data_response['key2_pub']= key_setup.key2_public
        case "set_active":
            if key_setup.key2_private == None or key_setup.key1_public == None or key_setup.totp_key==None:
                return {'error':"Broken key setup. Please contact support."}
            if private_keys == None:
                return {'passphrase_invalid':1}
            if not totp_check:
                return {'error':"Incorect or used one time password."}
            
            key_setup.active = True
            key_setup.save()
            
            data_response['key1_pub']= key_setup.key1_public
            data_response['key2_pub']= key_setup.key2_public
        case _:
            data_response = { 'error': 'Invalid request.'}

    return data_response
