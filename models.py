from django.db import models
from django.utils.timezone import now
   
class KeySetup(models.Model):
    user_id = models.CharField(primary_key=True,max_length=100)
    key1_private_encoded = models.CharField(max_length=4096, null=True)
    key1_public = models.CharField(max_length=2056, null=True)
    key2_private = models.CharField(max_length=4096)
    key2_public = models.CharField(max_length=2056)
    totp_key = models.CharField(max_length=2056, null=True)
    active = models.BooleanField(default=False)
    local_secret = models.CharField(max_length=685, null=True)

class Password(models.Model):
    user_id = models.CharField(max_length=100)
    name = models.CharField(max_length=328, null=True)
    url = models.CharField(max_length=328, null=True)
    username = models.CharField(max_length=1369, null=True)
    password = models.CharField(max_length=1369)
    comment = models.CharField(max_length=1000, null=True)
    date = models.DateField(default=now, null=True)

    class Meta:
        indexes = [
            models.Index(fields=["user_id", "id"]),
        ]

