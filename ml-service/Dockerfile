FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt .

# Install build dependencies and cleanup
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ && \
    pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm && \
    apt-get purge -y --auto-remove gcc g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 5001

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
