# Firebase Storage CORS Fix

## Current Issue
You're getting "Preflight response is not successful. Status code: 404" errors when trying to upload audio files to Firebase Storage. This is a CORS (Cross-Origin Resource Sharing) configuration issue.

## Immediate Workaround (Already Applied)
I've temporarily disabled Firebase Storage uploads so your interviews can work without audio recordings. The system will:
- ✅ Save interview sessions to Firestore (no more size limit errors)
- ✅ Process AI feedback and scores
- ✅ Show complete interview reports
- ❌ Audio recordings won't be saved (temporarily)

## How to Fix CORS (Step by Step)

### 1. Go to Firebase Console
- Visit [console.firebase.google.com](https://console.firebase.google.com)
- Select your "admitcoach" project

### 2. Navigate to Storage
- Click "Storage" in the left sidebar
- Click on the "Rules" tab

### 3. Set CORS Rules
- Click on the "CORS" tab (next to "Rules")
- Add this CORS configuration:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-*"]
  }
]
```

### 4. Save and Wait
- Click "Save" or "Update"
- Wait 2-5 minutes for changes to propagate

### 5. Re-enable Storage Uploads
- Open `src/utils/interviewStorage.ts`
- Change line 8: `const ENABLE_STORAGE_UPLOADS = true;`

## Test the Fix
1. Complete a new interview
2. Check console for "Audio uploaded to Storage" messages
3. Verify audio playback in the interview report

## If CORS Still Doesn't Work
1. **Check Storage Bucket**: Ensure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is correct in your `.env.local`
2. **Verify Domain**: Make sure your domain is allowed in the CORS rules
3. **Clear Browser Cache**: Sometimes CORS changes need a fresh browser session
4. **Check Network Tab**: Look for any other errors in the browser's Network tab

## Alternative Solution
If CORS continues to be problematic, we can implement a different approach:
- Store audio as smaller, compressed files
- Use a different storage service
- Implement client-side audio compression

## Current Status
- ✅ Interview sessions save successfully (no size limit errors)
- ✅ AI feedback and scores work properly
- ✅ Complete interview reports are generated
- ⏳ Audio recordings temporarily disabled until CORS is fixed 