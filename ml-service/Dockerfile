FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

# Install dependencies without spaCy model
RUN pip install --no-cache-dir -r requirements.txt

# Download a smaller spaCy model to avoid compatibility issues
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 5001

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001"]
