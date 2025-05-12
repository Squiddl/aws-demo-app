FROM python:3.12-slim AS requirements
WORKDIR /opt/django
RUN pip install pipenv
COPY Pipfile .
COPY Pipfile.lock .
RUN pipenv requirements --categories prod,default > requirements.txt

#
# Prepare django project
#
FROM python:3.12-slim AS django
COPY --from=requirements /opt/django/requirements.txt .
RUN pip install --compile -r requirements.txt
COPY src /opt/django/src
WORKDIR /opt/django/src

#
# Build static
#
FROM django AS static
ENV COLLECT_STATIC=1
RUN ./manage.py collectstatic --noinput

#
# NGINX-Image
#
FROM nginx:latest AS nginx
RUN mkdir /usr/share/nginx/html/media
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=static /opt/django/dist/static /usr/share/nginx/html/static

#
# GUNICORN-Image
#
FROM django AS gunicorn

RUN useradd -r -s /bin/bash -d /opt/django django
RUN install -d -o django -g django /opt/django/media
COPY docker/gunicorn.conf.py .
USER django
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
CMD ["gunicorn", "wsgi"]
EXPOSE 8000/tcp
