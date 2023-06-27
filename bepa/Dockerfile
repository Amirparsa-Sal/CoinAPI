FROM python:3.11-slim AS builder
RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential gcc libpq-dev

RUN python -m venv /opt/venv
# Make sure we use the virtualenv:
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /code
COPY setup.py /code/setup.py
COPY bepa_cronjob/ /code/bepa_cronjob
RUN pip3 install .

FROM python:3.11-slim AS target
COPY --from=builder /opt/venv /opt/venv

RUN apt-get update
RUN apt-get install -y --no-install-recommends libpq-dev

# Make sure we use the virtualenv:
ENV PATH="/opt/venv/bin:$PATH"
CMD ["bepa"]

