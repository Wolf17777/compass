from django.db import models
from django.utils.timezone import now
   
class KeySetup(models.Model):
    user_id = models.CharField(primary_key=True,max_length=100)
    key1_private_encoded = models.CharField(max_length=4096)
    key1_public = models.CharField(max_length=2056)
    key2_private = models.CharField(max_length=4096)
    key2_public = models.CharField(max_length=2056)
    totp_key = models.CharField(max_length=2056)
    active = models.BooleanField(default=False)
    local_secret = models.CharField(max_length=685)

class Password(models.Model):
    user_id = models.CharField(max_length=100)
    name = models.CharField(max_length=328)
    url = models.CharField(max_length=328)
    username = models.CharField(max_length=1369)
    password = models.CharField(max_length=1369)
    comment = models.CharField(max_length=1000)
    date = models.DateField(default=now)

    class Meta:
        indexes = [
            models.Index(fields=["user_id", "id"]),
        ]

