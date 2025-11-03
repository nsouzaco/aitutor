# Deployment Guide

This guide will help you deploy the AI Math Tutor to Firebase Hosting.

## Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project created**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Your project should already be set up with Authentication and Firestore

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Link to Your Firebase Project

Open `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

Or use the Firebase CLI to set it:

```bash
firebase use --add
```

### 3. Deploy Firestore Security Rules

First, deploy just the security rules to protect your database:

```bash
npm run deploy:rules
```

This will deploy the `firestore.rules` file which ensures:
- Users can only read/write their own conversations
- All data is properly authenticated
- No unauthorized access

### 4. Build the Production Bundle

```bash
npm run build
```

This will:
- Type-check the TypeScript code
- Build an optimized production bundle
- Output to the `dist/` directory

### 5. Deploy to Firebase Hosting

Deploy everything (hosting + rules):

```bash
npm run deploy
```

Or deploy just the hosting (if rules are already deployed):

```bash
npm run deploy:hosting
```

### 6. Verify Deployment

After deployment completes, Firebase CLI will show you your hosting URL:

```
✔  Deploy complete!

Hosting URL: https://your-project-id.web.app
```

Visit the URL to verify your app is working correctly.

## Environment Variables

Make sure all required environment variables are set in your `.env` file:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note:** Vite embeds environment variables at build time, so make sure they're set before running `npm run build`.

## Troubleshooting

### Build Errors

If you encounter TypeScript errors during build:
```bash
npm run lint
```

Fix any issues and try again.

### Authentication Not Working

1. Check that Firebase Authentication is enabled in the Firebase Console
2. Add your hosting domain to authorized domains:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add your Firebase hosting domain (e.g., `your-project-id.web.app`)

### Firestore Permission Denied

1. Verify security rules are deployed:
   ```bash
   npm run deploy:rules
   ```

2. Check that users are authenticated before accessing Firestore

3. Verify the `firestore.rules` file matches your requirements

### API Keys Not Working

Remember that Vite environment variables must:
- Be prefixed with `VITE_`
- Be present in `.env` file at build time
- Be rebuilt after any changes: `npm run build`

## Updating the Deployment

To deploy updates:

```bash
npm run deploy
```

This will:
1. Build a fresh production bundle
2. Deploy to Firebase Hosting
3. Deploy any rule changes

## Rollback

To rollback to a previous version:

```bash
firebase hosting:rollback
```

## Custom Domain (Optional)

To use a custom domain:

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Monitoring

Monitor your app's performance:

1. **Firebase Console > Hosting**: View hosting metrics
2. **Firebase Console > Firestore**: Monitor database usage
3. **Firebase Console > Authentication**: Track user signups

## Cost Considerations

### Free Tier Limits
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Hosting**: 10 GB storage, 360 MB/day transfer
- **Authentication**: Unlimited for most providers

### Monitoring Costs
Keep an eye on:
- OpenAI API usage (most significant cost)
- Firestore read/write operations
- Hosting bandwidth

## Security Best Practices

1. ✅ Firestore security rules deployed
2. ✅ Environment variables not committed to Git
3. ✅ Authentication required for all features
4. ⚠️ OpenAI API key is client-side (consider moving to backend for production)

### Recommendation for Production

For a production app, consider:
1. Creating a backend API (Firebase Functions or similar)
2. Moving the OpenAI API key to the backend
3. Implementing rate limiting
4. Adding request validation

## Next Steps

After deployment:

1. ✅ Test all features on the production URL
2. ✅ Verify authentication works
3. ✅ Test conversation saving/loading
4. ✅ Check mobile responsiveness
5. ✅ Monitor Firebase usage in the console

## Support

If you encounter issues:
- Check Firebase Console logs
- Review browser console for errors
- Verify environment variables
- Test locally first with `npm run dev`

