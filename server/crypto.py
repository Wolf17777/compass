from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
import base64, uuid, hmac, time

from django.core.cache import cache

default_padding=padding.OAEP(
    mgf=padding.MGF1(algorithm=hashes.SHA256()),
    algorithm=hashes.SHA256(),
    label=None
)

def generate_key():
    return rsa.generate_private_key(public_exponent=65537,key_size=4096)

def generate_totp_key(k=1):
    ret = "".encode()
    for _ in range(k):
        ret += uuid.uuid4().bytes
    return base64.b32encode(ret).decode()

def export_private_key(pk,passphrase=None):
    if passphrase==None:
        return pk.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.NoEncryption() ).decode()
    return pk.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.BestAvailableEncryption(passphrase.encode()) ).decode()

def export_public_key(pk):
    return pk.public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo).decode()
        
def import_private_key(key_priv_exp,passphrase=None):
    if passphrase==None:
        return serialization.load_pem_private_key( key_priv_exp.encode(), password=None )
    return serialization.load_pem_private_key( key_priv_exp.encode(), password=passphrase.encode() )

def import_public_key(key_pub_exp):
    return serialization.load_pem_public_key( key_pub_exp.encode() )

def decrypt(pk, message):
    menc_rem=base64.b64decode(message)
    ret = b''
    while len(menc_rem) > 0:
        ret += pk.decrypt(menc_rem[:512],default_padding)
        menc_rem = menc_rem[512:]
    return ret.decode()

def encrypt(pubk,message):
    menc_rem=message.encode()
    ret = b''
    while len(menc_rem) > 0:
        ret += pubk.encrypt(menc_rem[:446],default_padding)
        menc_rem = menc_rem[446:]
    return base64.b64encode(ret).decode()
 

def totp(now,secret,b32=False):
    if b32:
        key = secret.encode()
    else:
        key = base64.b32decode(secret, True)
    
    # Calculate TOTP using time and key
    msg = now.to_bytes(8, "big")
    digest = hmac.new(key, msg, "sha1").digest()
    offset = digest[19] & 0xF
    code = digest[offset : offset + 4]
    code = int.from_bytes(code, "big") & 0x7FFFFFFF
    code = code % 1000000
    
    return "{:06d}".format(code)

def totp_check(pin,secret,b32=False,one_time_only=True):
    now = int(time.time() // 30)
    if "{:06d}".format(int(pin)) == totp(now,secret):
        if not one_time_only:
            return True
        # forbid otp twice for the same now and secret
        last = cache.get('security/last_totp/'+secret)
        if last == None or int(last)!=now:
            cache.set('security/last_totp/'+secret,now)
            return True
    return False
