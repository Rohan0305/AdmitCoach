# Stripe Integration Setup

## Prerequisites
- Stripe account
- Firebase project with Firestore enabled
- Next.js application

## Environment Variables
Add these to your `.env.local` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase (if not already added)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Firebase Storage Setup
Since we're now storing audio files in Firebase Storage instead of embedding them in Firestore (to avoid the 1MB document limit), you need to:

1. **Enable Firebase Storage** in your Firebase Console
2. **Set Storage Rules** to allow authenticated users to upload/read audio files:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /interview-audio/{audioFile} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **Set CORS Rules** to allow uploads from your domain. In Firebase Console:
   - Go to Storage → Rules
   - Click on "CORS" tab
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

4. **Ensure your Firebase config includes the storage bucket** (it should be auto-generated)

## Troubleshooting CORS Issues
If you get "Preflight response is not successful. Status code: 404" errors:

1. **Check CORS Rules**: Make sure the CORS configuration above is set in Firebase Storage
2. **Verify Storage Bucket**: Ensure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is correct
3. **Wait for Propagation**: CORS changes can take a few minutes to take effect
4. **Check Domain**: Make sure your domain is allowed in the CORS rules

## Testing
1. Start a mock interview
2. Record responses
3. Complete the interview
4. Check that audio files are uploaded to Firebase Storage
5. Verify the interview session is saved to Firestore (should be under 1MB now)

## Troubleshooting
- If you get "storage bucket not found" errors, check that `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set correctly
- If audio uploads fail, the system will fall back to saving the session without audio
- Check the browser console for detailed logging of the upload process 