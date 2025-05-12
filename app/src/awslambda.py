import json
import os
from typing import Dict

import boto3

client = boto3.client("secretsmanager")


def load_secret(name: str) -> Dict:
    secretString = client.get_secret_value(SecretId=name)["SecretString"]
    return json.loads(secretString)


def setEnv(name, value):
    os.environ.setdefault(name, str(value))


dbSecrets = load_secret(os.environ["DB_SECRET_NAME"])
setEnv("DB_HOST", dbSecrets["host"])
setEnv("DB_PORT", dbSecrets["port"])
setEnv("DB_NAME", dbSecrets["dbname"])
setEnv("DB_USERNAME", dbSecrets["username"])
setEnv("DB_PASSWORD", dbSecrets["password"])

appSecrets = load_secret(os.environ["APP_SECRET_NAME"])
setEnv("SECRET_KEY", appSecrets["secretKey"])


def manage(event, context):
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "djangodemoproject.settings")
    try:
        import django
        from django.core.management import call_command
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    django.setup()
    call_command(*event["cmd"])
    return "Done"
