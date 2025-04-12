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
    nlp = spacy.load("en_core_web_sm")
    logger.info("Loaded spaCy model successfully")
except OSError:
    logger.warning("Downloading spaCy model...")
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")
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
        if 'linkedin.com' in url:
            parsed_url = urlparse(url)
            path_parts = parsed_url.path.strip('/').split('/')
            
            if len(path_parts) >= 2:
                if path_parts[0] == 'in':
                    profile_id = path_parts[1]
                    return {
                        'text': f"LinkedIn Profile: {profile_id}. LinkedIn restricts automated scraping, but we've extracted the profile ID.",
                        'html': f"<html><body>LinkedIn Profile: {profile_id}</body></html>",
                        'url': url,
                        'synthetic': True
                    }
                elif path_parts[0] == 'company':
                    company_id = path_parts[1]
                    return {
                        'text': f"LinkedIn Company: {company_id}. LinkedIn restricts automated scraping, but we've extracted the company ID.",
                        'html': f"<html><body>LinkedIn Company: {company_id}</body></html>",
                        'url': url,
                        'synthetic': True
                    }
            
            return {
                'text': f"LinkedIn URL: {url}. LinkedIn restricts automated scraping of this content.",
                'html': f"<html><body>LinkedIn URL: {url}</body></html>",
                'url': url,
                'synthetic': True
            }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.google.com/'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for script in soup(["script", "style"]):
            script.extract()
        
        text = soup.get_text()
        text = re.sub(r'\s+', ' ', text).strip()
        
        return {
            'text': text,
            'html': response.text,
            'url': url,
            'synthetic': False
        }
    except Exception as e:
        logger.error(f"Error fetching URL {url}: {str(e)}")
        
        error_message = str(e)
        if 'ConnectionError' in error_message:
            error_message = "Could not connect to the website. Please check the URL and try again."
        elif '403' in error_message:
            error_message = "Access to this website is forbidden. The website may be blocking automated access."
        elif '404' in error_message:
            error_message = "The requested page was not found. Please check the URL and try again."
        elif '429' in error_message:
            error_message = "Too many requests to this website. Please try again later."
        elif '5' in error_message and error_message[0] == '5':
            error_message = "The website is experiencing issues. Please try again later."
        
        raise HTTPException(status_code=500, detail=error_message)

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
        
        if content.get('synthetic', False) and 'linkedin.com' in request.source:
            parsed_url = urlparse(request.source)
            path_parts = parsed_url.path.strip('/').split('/')
            
            linkedin_contact = Contact(
                type="social",
                value=request.source,
                source=request.source,
                metadata={"platform": "linkedin"},
                tags=["auto-extracted", "linkedin"]
            )
            
            if len(path_parts) >= 2:
                if path_parts[0] == 'in':
                    linkedin_contact.metadata["profile_id"] = path_parts[1]
                    linkedin_contact.metadata["profile_type"] = "personal"
                elif path_parts[0] == 'company':
                    linkedin_contact.metadata["company_id"] = path_parts[1]
                    linkedin_contact.metadata["profile_type"] = "company"
            
            return [linkedin_contact]
    
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
