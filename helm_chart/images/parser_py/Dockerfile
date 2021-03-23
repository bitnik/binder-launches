FROM python:3.9.2-slim-buster

ENV PYTHONUNBUFFERED=1

# prerequisites for psycopg2
RUN apt-get update -y && \
    apt-get install -yq \
    gcc \
    python3-dev \
    libpq-dev  && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY ./parser_py /parser_py
COPY ./requirements.txt /parser_py/requirements.txt

RUN pip install --no-cache-dir -r /parser_py/requirements.txt

ENTRYPOINT ["python", "-m", "parser_py"]
