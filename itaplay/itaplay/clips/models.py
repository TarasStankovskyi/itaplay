# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
import boto
from storages.backends.s3boto import S3BotoStorage
from boto.s3.connection import S3Connection
from django.conf import settings
from itaplay import local_settings
from django.core.exceptions import ValidationError

VALID_VIDEO_EXTENSIONS = [".mp4", ".avi", ".wmv", ".ogg", ]
VALID_IMAGE_EXTENSIONS = [".jpeg", ".jpg", ".png", ".svg", ".tiff", ".gif", ]


class Clip(models.Model):

    """
    Model of clip.
    """

    name = models.CharField(max_length=128, null=True, blank=False)
    description = models.CharField(max_length=512, null=True, blank=False)
    url = models.CharField(max_length=256, null=True, blank=False)
    mimetype = models.CharField(max_length=64, null=True, blank=True)

    @classmethod
    def get_clip(self, clip_id):
        """
        Method for getting current clip from database.
        :param pk: primary key for searched clip.
        """
        return Clip.objects.filter(id=clip_id)

    @classmethod
    def get_all_clips(self):
        """
        Method for getting all clips from database.
        :param pk: primary key for searched clip.
        """
        return Clip.objects.all()

    def generate_mimetype(self, url):
        """
        Method for generating clip mimetype.
        """

        if url.endswith(tuple(VALID_VIDEO_EXTENSIONS)):
            mimetype = "video/mp4"
        elif url.endswith(tuple(VALID_IMAGE_EXTENSIONS)):
            mimetype = "image/jpeg"
        else:
            raise ValidationError("Please enter valid file")
        return mimetype
