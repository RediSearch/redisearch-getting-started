FROM python:3.10.0b4

WORKDIR /app
ADD . /app

RUN pip install -r requirements.txt

EXPOSE 8087


CMD ["python", "server.py"]
