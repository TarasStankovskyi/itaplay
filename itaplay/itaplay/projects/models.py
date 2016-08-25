from __future__ import unicode_literals

from django.db import models

from company.models import Company


class AdviserProject(models.Model):
    """
    Model, that represent marketing projects
    """
    id_company = models.ForeignKey(Company, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    description = models.TextField()
    id_template = models.IntegerField(default=1)  # TODO make foreign key to template
