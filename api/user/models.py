from django.db import models
from django.contrib.auth.models import AbstractUser


class CodingLanguage(models.TextChoices):
    CPP = "CPP", "C++"
    JAVA = "JAVA", "Java"
    PYTHON = "PYTHON", "Python"
    JAVASCRIPT = "JAVASCRIPT", "JavaScript"
    TYPESCRIPT = "TYPESCRIPT", "TypeScript"


class Language(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(
        max_length=50,
        unique=True,
        choices=CodingLanguage.choices,
        help_text="Language code/key (e.g. CPP, JAVA, PYTHON, JAVASCRIPT, TYPESCRIPT)",
    )
    display_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Human readable name of the language (automatically populated from choices)",
    )
    import_block = models.TextField(
        blank=True,
        null=False,
        default="",
        help_text="Standard imports for this language (common for all problems)",
    )
    judge0_language_id = models.IntegerField(
        help_text="Judge0 language ID corresponding to this language"
    )

    class Meta:
        db_table = "language"
        verbose_name = "Language"
        verbose_name_plural = "Languages"

    def save(self, *args, **kwargs):
        # Automatically set display_name from CodingLanguage choices
        if self.name:
            self.display_name = dict(CodingLanguage.choices).get(self.name, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name


class User(AbstractUser):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    # username and email are inherited from AbstractUser
    hash = models.CharField(
        max_length=255, blank=True, null=True, help_text="Additional hash field"
    )
    profile_picture = models.ImageField(
        upload_to="profile_pictures/", blank=True, null=True
    )
    default_lang = models.CharField(
        max_length=20,
        choices=CodingLanguage.choices,
        default=CodingLanguage.PYTHON,
        verbose_name="Default Coding Language",
    )

    class Meta:
        db_table = "user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.username
