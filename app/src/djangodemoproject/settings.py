"""
Django settings for djangodemoproject project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

import random
import string
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
PROJECT_DIR = Path(__file__).resolve().parent
BASE_DIR = PROJECT_DIR.parent


env = environ.FileAwareEnv(
    # https://django-environ.readthedocs.io/en/latest/tips.html#proxy-value
    interpolate=True,
    # set casting, default value
    DEBUG=(bool, False),
    COLLECT_STATIC=(bool, False),
    # SECURE_SSL_REDIRECT=(bool, "$DEBUG"),
    ALLOWED_HOSTS=(list, ["127.0.0.1", "localhost"]),
    AWS_REGION=(str, None),
    DJANGO_LOG_LEVEL=(str, "WARN"),
)
env.read_env(BASE_DIR.parent.parent / ".env")

DEBUG = env("DEBUG")
COLLECT_STATIC = env("COLLECT_STATIC")

SECRET_KEY = (
    "".join(random.choices(string.ascii_letters, k=24))
    if COLLECT_STATIC and env.str("SECRET_KEY", None) is None
    else env.str("SECRET_KEY")
)
ALLOWED_HOSTS = env("ALLOWED_HOSTS")
CSRF_TRUSTED_ORIGINS = [f"https://{domain}" for domain in ALLOWED_HOSTS]


# Application definition

INSTALLED_APPS = [
    "polls.apps.PollsConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

MIDDLEWARE = [
    "awshelper.middleware.AwsHealthCheckMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "djangodemoproject.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [PROJECT_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases


if env.str("DB_HOST", None):
    DATABASES = {
        "default": {
            "ENGINE": env.str("DB_ENGINE", "django.db.backends.postgresql"),
            "HOST": env.str("DB_HOST"),
            "PORT": env.str("DB_PORT"),
            "NAME": env.str("DB_NAME"),
            "USER": env.str("DB_USERNAME"),
            "PASSWORD": env.str("DB_PASSWORD"),
        }
    }
elif COLLECT_STATIC and env.str("SECRET_KEY", None) is None:
    DATABASES = {"default": env.db(default="sqlite://:memory:")}
else:
    DATABASES = {"default": env.db()}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Europe/Berlin"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR.parent / "dist" / "static"
STATICFILES_DIRS = [PROJECT_DIR / "static"]

STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)
MEDIA_ROOT = BASE_DIR.parent / "media"
MEDIA_URL = "/media/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


DJANGO_LOG_LEVEL = env("DJANGO_LOG_LEVEL")
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "verbose": {
            "format": "{levelname} [{name} - {module}] {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
        "json": {
            "format": "{levelname} {processName} {name} {message}",
            "style": "{",
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.StreamHandler",
            "formatter": "verbose" if DEBUG else "json",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": DJANGO_LOG_LEVEL,
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
    },
}
