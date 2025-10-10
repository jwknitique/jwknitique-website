#!/usr/bin/env python3
"""
Sync hat data from Google Drive to GitHub repository.
Validates hat folders, uploads images to Cloudinary, and generates hat data JSON.
"""

import os
import json
import sys
import re
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import cloudinary
import cloudinary.uploader

# Configuration
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
CREDENTIALS_FILE = 'credentials.json'
DRIVE_FOLDER_ID = os.environ.get('DRIVE_FOLDER_ID')
OUTPUT_FILE = 'hats-data.json'

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

# Validation
VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']

class HatValidationError(Exception):
    """Custom exception for hat validation errors"""
    pass

def get_drive_service():
    """Initialize and return Google Drive service"""
    credentials = service_account.Credentials.from_service_account_file(
        CREDENTIALS_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=credentials)

def list_hat_folders(service, parent_folder_id):
    """List all folders in the parent hat folder"""
    query = f"'{parent_folder_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields='files(id, name)').execute()
    return results.get('files', [])

def list_folder_contents(service, folder_id):
    """List all files in a folder"""
    query = f"'{folder_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields='files(id, name, mimeType)').execute()
    return results.get('files', [])

def download_file(service, file_id, destination_path):
    """Download a file from Google Drive to memory"""
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    fh.seek(0)  # Reset to beginning for reading
    return fh

def upload_to_cloudinary(file_data, public_id, folder='jw-knitique-hats'):
    """Upload image to Cloudinary and return URL"""
    try:
        result = cloudinary.uploader.upload(
            file_data,
            public_id=public_id,
            folder=folder,
            overwrite=True,  # Overwrite if exists (for updates)
            resource_type='image'
        )
        return result['secure_url']
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")

def export_google_doc(service, file_id):
    """Export Google Doc as plain text"""
    request = service.files().export_media(fileId=file_id, mimeType='text/plain')
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    return fh.getvalue().decode('utf-8')

def parse_hat_info(content, folder_name):
    """
    Smart parser - only needs price and description (can be multiple lines).
    Adding "sold" anywhere marks it as sold.
    Uses folder name as hat name.
    Supports Python-style comments with # (both standalone and end-of-line).
    Comments are stripped before any processing.
    
    Price must be on its own line (just a number with optional $ and punctuation).
    Everything else becomes the description.
    """
    hat_data = {
        'name': folder_name,
        'status': 'available'  # default
    }
    
    # First pass: strip all comments
    lines_without_comments = []
    for line in content.split('\n'):
        if '#' in line:
            line = line.split('#')[0]
        lines_without_comments.append(line)
    
    clean_content = '\n'.join(lines_without_comments)
    
    # Check if "sold" appears in the cleaned content
    if re.search(r'\bsold\b', clean_content.lower()):
        hat_data['status'] = 'sold'
    
    # Second pass: parse lines for price and description
    description_lines = []
    
    for line in lines_without_comments:
        line = line.strip()
        
        # Skip empty lines
        if not line:
            continue
        
        # Skip lines that are just "sold"
        if line.lower() == 'sold':
            continue
            
        # Check if line is ONLY a price (not part of other text)
        # Remove all non-digit/non-decimal characters
        clean_line = re.sub(r'[^\d.]', '', line)
        
        # Line must be mostly just a number (max 2-3 words like "$25" or "25 dollars")
        word_count = len(line.split())
        is_price_line = (
            clean_line and 
            clean_line.replace('.', '').isdigit() and 
            word_count <= 3 and
            'price' not in hat_data
        )
        
        if is_price_line:
            # Extract the number and skip this line from description
            price_match = re.search(r'\d+', line)
            hat_data['price'] = price_match.group()
            continue
        
        # Everything else goes into description
        description_lines.append(line)
    
    # Join all description lines with space
    if description_lines:
        hat_data['description'] = ' '.join(description_lines)
    
    return hat_data

def validate_hat_folder(service, folder_name, folder_id):
    """
    Validate a hat folder and return hat data.
    Raises HatValidationError if validation fails.
    """
    errors = []
    
    # Get folder contents
    files = list_folder_contents(service, folder_id)
    
    # Separate images and Google Docs
    images = [f for f in files if any(f['name'].lower().endswith(ext) for ext in VALID_IMAGE_EXTENSIONS)]
    docs = [f for f in files if f['mimeType'] == 'application/vnd.google-apps.document']
    
    # Validation: Exactly one image
    if len(images) == 0:
        errors.append("No image file found")
    elif len(images) > 1:
        image_names = ', '.join([f['name'] for f in images])
        errors.append(f"Multiple images found: {image_names}")
    
    # Validation: Exactly one Google Doc
    if len(docs) == 0:
        errors.append("No Google Doc found (should contain hat info)")
    elif len(docs) > 1:
        doc_names = ', '.join([f['name'] for f in docs])
        errors.append(f"Multiple Google Docs found: {doc_names}")
    
    if errors:
        raise HatValidationError('; '.join(errors))
    
    # Export and parse Google Doc
    doc_file = docs[0]
    content = export_google_doc(service, doc_file['id'])
    hat_data = parse_hat_info(content, folder_name)
    
    # Validation: Required fields (name comes from folder, so just check these two)
    required_fields = ['description', 'price']
    missing_fields = [field for field in required_fields if field not in hat_data]
    if missing_fields:
        raise HatValidationError(f"Missing required fields: {', '.join(missing_fields)}")
    
    # Validation: Valid price
    try:
        price = int(hat_data['price'])
        if price <= 0:
            raise ValueError()
    except ValueError:
        raise HatValidationError(f"Invalid price '{hat_data['price']}'. Must be a positive number")
    
    # Download image to memory and upload to Cloudinary
    image_file = images[0]
    image_extension = Path(image_file['name']).suffix
    
    # Create safe filename from hat name for Cloudinary public_id
    safe_name = hat_data['name'].lower().replace(' ', '-').replace('_', '-')
    safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '-')
    
    # Download image from Drive
    print(f"  Downloading image from Drive...")
    image_data = download_file(service, image_file['id'], None)
    
    # Upload to Cloudinary
    print(f"  Uploading to Cloudinary...")
    cloudinary_url = upload_to_cloudinary(image_data, safe_name)
    print(f"  Cloudinary URL: {cloudinary_url}")
    
    # Return validated hat data with Cloudinary URL
    return {
        'id': safe_name,
        'name': hat_data['name'],
        'description': hat_data['description'],
        'price': int(hat_data['price']),
        'status': hat_data['status'].lower(),
        'image': cloudinary_url,  # Cloudinary URL instead of local path
        'folder_name': folder_name
    }

def main():
    """Main sync process"""
    if not DRIVE_FOLDER_ID:
        print("ERROR: DRIVE_FOLDER_ID environment variable not set")
        sys.exit(1)
    
    print("Initializing Google Drive service...")
    service = get_drive_service()
    
    print(f"Scanning Drive folder: {DRIVE_FOLDER_ID}")
    hat_folders = list_hat_folders(service, DRIVE_FOLDER_ID)
    print(f"Found {len(hat_folders)} hat folders")
    
    hats = []
    errors = []
    
    for folder in hat_folders:
        folder_name = folder['name']
        folder_id = folder['id']
        
        try:
            print(f"Processing: {folder_name}...", end=' ')
            hat_data = validate_hat_folder(service, folder_name, folder_id)
            hats.append(hat_data)
            print("✓")
        except HatValidationError as e:
            error_msg = f"{folder_name} - ERROR: {str(e)}"
            errors.append(error_msg)
            print(f"✗\n  {error_msg}")
        except Exception as e:
            error_msg = f"{folder_name} - UNEXPECTED ERROR: {str(e)}"
            errors.append(error_msg)
            print(f"✗\n  {error_msg}")
    
    # Write results
    print(f"\nSuccessfully processed: {len(hats)} hats")
    print(f"Errors: {len(errors)}")
    
    if errors:
        print("\nError Summary:")
        for error in errors:
            print(f"  ✗ {error}")
        
        # Write errors to file
        with open('sync-errors.txt', 'w') as f:
            f.write("Hat Sync Errors\n")
            f.write("=" * 50 + "\n\n")
            for error in errors:
                f.write(f"✗ {error}\n")
    
    # Write hats data JSON
    with open(OUTPUT_FILE, 'w') as f:
        json.dump({
            'hats': sorted(hats, key=lambda x: x['id']),  # Sort by ID for consistent ordering
            'last_sync': None  # Could add timestamp here
        }, f, indent=2)
    
    print(f"\nHat data written to: {OUTPUT_FILE}")
    print("Sync complete!")

if __name__ == '__main__':
    main()