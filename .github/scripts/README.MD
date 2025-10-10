# Hat Sync Automation

## Overview
This GitHub Action automatically syncs hat data from Google Drive to the website.
Runs on a schedule (currently manual/twice daily) and updates `hats-data.json` with new/changed hats.

Images are uploaded to Cloudinary (external CDN) to minimize deploy costs and improve performance.

## External Services

### Google Cloud
- **Project:** JW Knitique Hat Sync
- **Service Account:** Read-only access to Drive folder
- **API Enabled:** Google Drive API
- **Purpose:** Automated read access to hat folders

### Cloudinary
- **Account:** JW Knitique (free tier)
- **Purpose:** Image hosting and CDN delivery
- **Folder:** `jw-knitique-hats/`
- **Dashboard:** https://cloudinary.com/console

### GitHub Secrets Required
- `GOOGLE_CREDENTIALS` - Full JSON key from service account
- `DRIVE_FOLDER_ID` - ID of the "JW Knitique Hats" folder in Drive
- `CLOUDINARY_CLOUD_NAME` - Cloudinary account cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## How It Works

### The Pipeline
1. Girls add folders to shared Drive folder (each folder = one hat)
2. Each folder contains: **1 image** + **1 Google Doc** with price/description
3. GitHub Action runs (on schedule or manual trigger)
4. Script downloads images from Drive, uploads to Cloudinary
5. Generates `hats-data.json` with hat data + Cloudinary URLs
6. Commits JSON to repo (images not in repo - external on Cloudinary)
7. Netlify auto-deploys updated site

### Hat Folder Structure in Google Drive
```
JW Knitique Hats/
├── Ruby Cuddler/
│   ├── hat-photo.jpg (exactly 1 image file)
│   └── Google Doc (exactly 1 doc with hat info)
├── Snow White/
│   ├── snow-white.png
│   └── Google Doc
```

### Google Doc Format
The doc can contain:
- Price (any line with just a number like "$25" or "30")
- Description (everything else becomes the description)
- Optional: "sold" anywhere to mark as sold
- Optional: Python-style comments with # are ignored

Example:
```
$25
KID SIZE tight and heavy woven for candy apple lovers!
# Note: Customer requested pink version
```

### Generated JSON Structure
```json
{
  "hats": [
    {
      "id": "ruby-cuddler",
      "name": "Ruby Cuddler",
      "description": "KID SIZE tight and heavy woven...",
      "price": 25,
      "status": "available",
      "image": "https://res.cloudinary.com/...",
      "folder_name": "Ruby Cuddler"
    }
  ],
  "last_sync": null
}
```

## Validation Rules
The sync script validates each hat folder:
- ✓ Exactly 1 image (.jpg, .jpeg, or .png)
- ✓ Exactly 1 Google Doc
- ✓ Doc contains a valid price (positive number)
- ✓ Doc contains a description (any text)
- ✓ Status is either "available" or "sold"

Failed hats are logged to `sync-errors.txt` but don't stop the sync.

## Cost Optimization

### Why Cloudinary?
Originally images were stored in the GitHub repo, which caused:
- Large repo size (binary files)
- Expensive Netlify deploys (~15 credits per deploy)
- Slower build times

By moving images to Cloudinary:
- Deploys cost ~2-3 credits (just JSON changes)
- Faster builds
- Better image performance (CDN + auto-optimization)
- No repo bloat

### Deploy Triggers
A Netlify deploy only happens when `hats-data.json` changes. This occurs when:
- New hats are added
- Hat descriptions/prices change
- Hats are marked sold

If the sync runs and nothing changed in Drive, no deploy happens (git detects no changes).

## Troubleshooting

### Sync stopped working
1. Check GitHub Actions tab for error logs
2. Verify service account still has Drive access
3. Check `sync-errors.txt` in repo for validation issues
4. Verify Cloudinary credentials are still valid

### Images not appearing on site
1. Check Cloudinary dashboard - are images there?
2. Verify `hats-data.json` has Cloudinary URLs (not local paths)
3. Check browser console for image loading errors

### Hat not appearing despite being in Drive
1. Check GitHub Actions log for that specific hat
2. Look in `sync-errors.txt` for validation errors
3. Common issues:
   - Multiple images in folder
   - No Google Doc or multiple docs
   - Missing price in doc
   - Invalid price (not a number)

## Manual Operations

### Trigger sync immediately
1. Go to repository → Actions tab
2. Select "Sync Hats from Google Drive" workflow
3. Click "Run workflow" → "Run workflow"

### Mark a hat as sold
1. Open the hat's Google Doc in Drive
2. Add the word "sold" anywhere in the doc
3. Wait for next scheduled sync (or trigger manually)

### Change sync frequency
Edit `.github/workflows/sync-hats.yml`:
```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 9,21 * * *'  # Twice daily (9 AM and 9 PM)
  # - cron: '0 12 * * *'  # Once daily (noon)
```

### Disable automatic syncing
Comment out the `schedule` section in the workflow. The sync can still be triggered manually.

## Service Account Access

The Google Cloud service account has read-only access to the Drive folder. If you need to regenerate credentials or change permissions:

1. Go to https://console.cloud.google.com/
2. Select "JW Knitique Hat Sync" project
3. Navigate to "APIs & Services" → "Credentials"
4. Manage the service account

**Important:** If you regenerate the service account key, you must update the `GOOGLE_CREDENTIALS` secret in GitHub.

## Future Enhancements

Potential features to consider:
- Admin page to mark hats sold without editing Google Docs
- Email notifications when new hats are added
- Automatic hat quantity tracking
- Customer review system
- Multiple photos per hat

## Emergency Contacts

- **Google Cloud Console:** https://console.cloud.google.com/
- **Cloudinary Dashboard:** https://cloudinary.com/console
- **GitHub Actions:** https://github.com/jwknitique/jwknitique-website/actions

If something breaks and you can't figure it out, the girls can always temporarily revert to manual hat management by editing `index.html` directly until the automation is fixed.