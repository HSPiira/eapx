from django.db import models

class BusinessStatusChoices(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    INACTIVE = "INACTIVE", "Inactive"
    SUSPENDED = "SUSPENDED", "Suspended"


class GenderChoices(models.TextChoices):
    MALE = "MALE", "Male"
    FEMALE = "FEMALE", "Female"

class ContactMethodChoices(models.TextChoices):
    EMAIL = 'EMAIL', 'Email'
    PHONE = 'PHONE', 'Phone'
    SMS = 'SMS', 'SMS'
    WHATSAPP = 'WHATSAPP', 'WhatsApp'
    OTHER = 'OTHER', 'Other'