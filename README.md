# Juice AI

Juice AI is an email and social contact extractor tool with a ChatGPT-like UI, designed to help you extract, manage, and engage with contacts efficiently.

## Features

- **AI-Powered Contact Extraction**: Extract emails, phone numbers, and social media profiles from text, URLs, or uploaded files
- **ChatGPT-like Interface**: Conversational UI for natural interaction with the AI system
- **Contact Management**: Organize contacts into lists for better segmentation
- **Email Campaign Capabilities**: Create, schedule, and track email campaigns
- **Analytics Dashboard**: Track deliverability, open rates, and engagement metrics
- **Modern UI**: Clean, responsive interface with intuitive navigation

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **ML Service**: Python, FastAPI, spaCy
- **Deployment**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.8+ (for local ML service development)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Lightiam/Juice-AI.git
   cd Juice-AI
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - ML Service API: http://localhost:5001/docs

### Local Development

#### Frontend

```
cd client
npm install
npm start
```

#### Backend

```
cd server
npm install
npm run dev
```

#### ML Service

```
cd ml-service
pip install -r requirements.txt
python app.py
```

## Usage

1. **Extract Contacts**: Use the chat interface to extract contacts from text, URLs, or files
2. **Manage Contact Lists**: Create and organize contact lists
3. **Create Campaigns**: Design email campaigns and schedule them
4. **Track Performance**: Monitor campaign performance through the analytics dashboard

## License

This project is proprietary and confidential.
