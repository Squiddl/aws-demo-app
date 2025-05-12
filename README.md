# CCS WS24/25

## Build steps

This project requires:

* Docker
* Python 3.12
  * Pipenv
* Node 20
  * npm


### CDK

```bash
cd cdk
npm install
npx cdk synth
```

## Start APP locally

### Develop mode

Create a `.env` file in `./app` based on the `.env.example`

```bash
cd app/src
pipenv run ./manage.py migrate
pipenv run ./manage.py createsuperuser
# Alternative:
pipenv run ./manage.py loaddata ./djangodemoproject/fixtures/intial_data.json
pipenv run ./manage.py runserver
```

App should be runing on: http://localhost:8000/

### Docker

```bash
cd app/docker
source ../.env
docker compose up --build
docker compose exec django ./manage.py migrate
docker compose exec django ./manage.py loaddata ./djangodemoproject/fixtures/intial_data.json
```
App should be runing on: http://localhost:8080/

