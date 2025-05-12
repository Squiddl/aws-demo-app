from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin


class AwsHealthCheckMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.META["PATH_INFO"] == "/health/":
            return HttpResponse("OK")
