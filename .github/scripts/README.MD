# Hat Sync Automation

## Overview
This GitHub Action automatically syncs hat data from Google Drive to the website.
Runs every hour and updates `hats-data.json` with new/changed hats.

## Google Cloud Setup
- **Project:** JW Knitique Hat Sync (or whatever you named it)
- **Service Account:** hat-sync-bot@[project-id].iam.gserviceaccount.com
- **API Enabled:** Google Drive API (read-only access)

## GitHub Secrets Required
- `GOOGLE_CREDENTIALS` - Full JSON key from service account
- `DRIVE_FOLDER_ID` - ID of the "JW Knitique Hats" folder in Drive

## How It Works
1. Girls add folders to shared Drive folder (each folder = one hat)
2. Each folder contains: 1 image + 1 Google Doc with price/description
3. GitHub Action runs hourly, downloads images, generates hats-data.json
4. Website automatically displays updated hats

## If Something Breaks
- Check GitHub Actions tab for error logs
- Verify service account still has access to Drive folder
- Check sync-errors.txt in repo for validation issues

## Google Cloud Console
https://console.cloud.google.com/
(Only needed if credentials expire or permissions change)
