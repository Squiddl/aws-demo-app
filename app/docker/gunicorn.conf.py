import multiprocessing

bind = ":8000"
preload_app = True
workers = multiprocessing.cpu_count() * 2 + 1

# import json
# access_log_format = json.dumps(
#     {
#         "remote_address": r"%(h)s",
#         "user_name": r"%(u)s",
#         "date": r"%(t)s",
#         "status": r"%(s)s",
#         "method": r"%(m)s",
#         "url_path": r"%(U)s",
#         "query_string": r"%(q)s",
#         "protocol": r"%(H)s",
#         "response_length": r"%(B)s",
#         "referer": r"%(f)s",
#         "user_agent": r"%(a)s",
#         "request_time_seconds": r"%(L)s",
#     }
# )

logconfig_dict = {
    "version": 1,
    "disable_existing_loggers": False,
    "root": {"level": "INFO", "handlers": ["error_console"]},
    "loggers": {
        "gunicorn.error": {
            "level": "INFO",
            "handlers": ["error_console"],
            "propagate": True,
            "qualname": "gunicorn.error",
        },
        "gunicorn.access": {
            "level": "INFO",
            "handlers": ["access_console"],
            "propagate": True,
            "qualname": "gunicorn.access",
        },
    },
    "handlers": {
        "access_console": {
            "class": "logging.StreamHandler",
            "formatter": "generic",
            "stream": "ext://sys.stdout",
        },
        "error_console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "stream": "ext://sys.stderr",
        },
    },
    "formatters": {
        "generic": {
            "format": "%(asctime)s [%(process)d] [%(levelname)s] %(message)s",
            "datefmt": "[%Y-%m-%d %H:%M:%S %z]",
            "class": "logging.Formatter",
        },
        "json": {
            "format": "{levelname} {processName} {name} {message}",
            "style": "{",
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
        },
    },
}
