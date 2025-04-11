from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import re
import spacy
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import logging
import uvicorn
from urllib.parse import urlparse

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Juice AI ML Service")

try:
    nlp = spacy.load("en_core_web_lg")
    logger.info("Loaded spaCy model successfully")
except OSError:
    logger.warning("Downloading spaCy model...")
    os.system("python -m spacy download en_core_web_lg")
    nlp = spacy.load("en_core_web_lg")
    logger.info("Downloaded and loaded spaCy model successfully")

class ExtractionRequest(BaseModel):
    source: str
    type: str = "text"  # "text", "url", or "file"

class Contact(BaseModel):
    type: str  # "email", "phone", "social"
    value: str
    source: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_PATTERN = r'\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
SOCIAL_PATTERNS = {
    'linkedin': r'linkedin\.com\/(?:in|company)\/[a-zA-Z0-9_-]+',
    'twitter': r'twitter\.com\/[a-zA-Z0-9_]+',
    'facebook': r'facebook\.com\/[a-zA-Z0-9.]+',
    'instagram': r'instagram\.com\/[a-zA-Z0-9_.]+',
}

def extract_emails(text, source=None):
    """Extract email addresses from text."""
    emails = re.findall(EMAIL_PATTERN, text)
    return [
        Contact(
            type="email",
            value=email,
            source=source,
            tags=["auto-extracted"]
        )
        for email in emails
    ]

def extract_phones(text, source=None):
    """Extract phone numbers from text."""
    phones = re.findall(PHONE_PATTERN, text)
    return [
        Contact(
            type="phone",
            value=phone,
            source=source,
            tags=["auto-extracted"]
        )
        for phone in phones
    ]

def extract_social_profiles(text, source=None):
    """Extract social media profiles from text."""
    social_contacts = []
    
    for platform, pattern in SOCIAL_PATTERNS.items():
        profiles = re.findall(pattern, text)
        for profile in profiles:
            social_contacts.append(
                Contact(
                    type="social",
                    value=profile if profile.startswith('http') else f"https://{profile}",
                    source=source,
                    metadata={"platform": platform},
                    tags=["auto-extracted", platform]
                )
            )
    
    return social_contacts

def extract_metadata_with_nlp(text, contacts):
    """Use NLP to extract potential metadata for contacts."""
    doc = nlp(text)
    
    entities = {
        "PERSON": [],
        "ORG": [],
        "GPE": [],  # Geopolitical entity (e.g., countries, cities)
        "TITLE": []
    }
    
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].append(ent.text)
    
    for contact in contacts:
        if not contact.metadata:
            contact.metadata = {}
        
        if entities["ORG"] and not contact.metadata.get("company"):
            contact.metadata["company"] = entities["ORG"][0]
        
        if entities["PERSON"] and not contact.metadata.get("name"):
            contact.metadata["name"] = entities["PERSON"][0]
        
        if entities["GPE"] and not contact.metadata.get("location"):
            contact.metadata["location"] = entities["GPE"][0]
    
    return contacts

def fetch_url_content(url):
    """Fetch and parse content from a URL."""
    try:
        headers = {
            'User-Agent': 'JuiceAIBot/1.0 (+https://juiceai.example.com/bot)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for script in soup(["script", "style"]):
            script.extract()
        
        text = soup.get_text()
        text = re.sub(r'\s+', ' ', text).strip()
        
        return {
            'text': text,
            'html': response.text,
            'url': url
        }
    except Exception as e:
        logger.error(f"Error fetching URL {url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch URL: {str(e)}")

def respect_robots_txt(url):
    """Check if scraping is allowed by robots.txt."""
    parsed_url = urlparse(url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    
    try:
        robots_url = f"{base_url}/robots.txt"
        response = requests.get(robots_url, timeout=5)
        
        if "Disallow: /" in response.text:
            path = parsed_url.path
            if f"Disallow: {path}" in response.text:
                return False
    except:
        pass
    
    return True

@app.post("/extract", response_model=List[Contact])
async def extract_contacts(request: ExtractionRequest):
    """Extract contacts from text, URL, or file."""
    text = request.source
    source = None
    
    if request.type == "url":
        if not respect_robots_txt(request.source):
            raise HTTPException(status_code=403, detail="Scraping not allowed by robots.txt")
        
        content = fetch_url_content(request.source)
        text = content['text']
        source = request.source
    
    emails = extract_emails(text, source)
    phones = extract_phones(text, source)
    social_profiles = extract_social_profiles(text, source)
    
    all_contacts = emails + phones + social_profiles
    
    if all_contacts:
        all_contacts = extract_metadata_with_nlp(text, all_contacts)
    
    return all_contacts

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
