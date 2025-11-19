from django.db import models
from axis_backend.utils import generate_cuid
from django.utils import timezone

class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted records"""
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)
    
class BaseModel(models.Model):
    """Abstract base model with common fields for all models"""
    id = models.CharField(primary_key=True, max_length=25, default=generate_cuid, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Includes soft-deleted records

    class Meta:
        abstract = True

    def soft_delete(self, using=None, keep_parents=False):
        """Soft delete the record by setting deleted_at timestamp."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    def restore(self):
        """Restore a soft-deleted record by clearing deleted_at."""
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])