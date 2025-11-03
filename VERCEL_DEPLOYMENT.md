# Vercel Deployment Guide

This guide will walk you through deploying your AI Math Tutor to Vercel with **FREE serverless functions** to securely handle OpenAI API calls.

---

## 🎯 Why Vercel?

- ✅ **100% FREE** for personal projects
- ✅ **Serverless functions** included (keeps API key secure)
- ✅ **Auto-deployment** on every git push
- ✅ **Fast global CDN**
- ✅ **Built-in environment variables** for secrets
- ✅ **No credit card required** for free tier

---

## 📋 Prerequisites

- GitHub account
- Your OpenAI API key
- Firebase project (for Auth & Firestore - already set up)

---

## 🚀 Step-by-Step Deployment

### 1. Push Your Code to GitHub

If you haven't already, initialize git and push to GitHub:

```bash
cd /Users/nat/aitutor

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add Vercel serverless functions for secure OpenAI API"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/aitutor.git
git branch -M main
git push -u origin main
```

---

### 2. Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

---

### 3. Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your `aitutor` repository in the list
3. Click **"Import"**

---

### 4. Configure Your Project

On the configuration screen:

#### Framework Preset
- **Framework**: Vite (should auto-detect)
- **Root Directory**: `.` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Environment Variables

Click **"Add Environment Variables"** and add the following:

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-proj-...` (your OpenAI API key) |

**For Firebase variables (if deploying frontend to Vercel):**

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | (from your .env) |
| `VITE_FIREBASE_AUTH_DOMAIN` | (from your .env) |
| `VITE_FIREBASE_PROJECT_ID` | (from your .env) |
| `VITE_FIREBASE_STORAGE_BUCKET` | (from your .env) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (from your .env) |
| `VITE_FIREBASE_APP_ID` | (from your .env) |

---

### 5. Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. 🎉 Your app is live!

Vercel will give you a URL like: `https://aitutor-xxx.vercel.app`

---

## 🔧 Local Development

To test locally with Vercel functions:

### Install Vercel CLI

```bash
npm install -g vercel
```

### Link Your Project

```bash
cd /Users/nat/aitutor
vercel link
```

### Pull Environment Variables

```bash
vercel env pull .env.local
```

### Run Locally

```bash
vercel dev
```

This will run your app at `http://localhost:3000` with Vercel functions working locally.

---

## 🔄 Continuous Deployment

Every time you push to GitHub, Vercel will **automatically**:
1. Build your project
2. Run tests (if configured)
3. Deploy to production
4. Give you a preview URL

```bash
# Make changes
git add .
git commit -m "Updated feature"
git push

# Vercel auto-deploys! 🚀
```

---

## 📊 Monitoring & Logs

### View Function Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Click **"Functions"** tab
4. View real-time logs for each API call

### Usage Limits (Free Tier)

- **Bandwidth**: 100GB/month
- **Function Executions**: 100K/month
- **Function Duration**: 10 seconds max
- **Build Time**: 6000 minutes/year

For a tutor app with moderate usage, you'll likely stay well within these limits!

---

## 🔐 Security Best Practices

### ✅ What's Secure Now

- ✅ OpenAI API key is **server-side only** (in Vercel environment variables)
- ✅ API routes are public but rate-limited
- ✅ CORS is configured for your frontend domain
- ✅ Firebase Auth protects user data

### 🛡️ Optional: Add Rate Limiting

To prevent abuse, you can add rate limiting to your API routes. See `api/chat.js` for where to add this.

---

## 🌍 Custom Domain (Optional)

Want to use your own domain like `tutor.yourname.com`?

1. Go to your Vercel project settings
2. Click **"Domains"**
3. Add your custom domain
4. Update your DNS settings as instructed

---

## 🐛 Troubleshooting

### API calls fail with CORS error

**Solution**: Check `vercel.json` CORS headers. Make sure your frontend domain is allowed.

### "OPENAI_API_KEY is not set" error

**Solution**: 
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Make sure `OPENAI_API_KEY` is set
3. Redeploy the project (Deployments tab → Three dots → Redeploy)

### Functions timeout

**Solution**: 
- Free tier has 10s timeout limit
- Make sure OpenAI API calls complete within this time
- Consider using streaming responses for longer responses

---

## 💰 Cost Comparison

| Platform | Free Tier | Monthly Cost (Low Traffic) |
|----------|-----------|----------------------------|
| **Vercel** | 100K function calls | **$0** |
| **Firebase (Blaze)** | Pay per use | ~$1-5 |
| **Netlify** | 125K function calls | **$0** |
| **AWS Lambda** | 1M requests | **$0** |

---

## 🎓 Next Steps

1. ✅ **Test your deployment** - Try solving a math problem!
2. 📊 **Monitor usage** - Check Vercel dashboard for analytics
3. 🔔 **Set up notifications** - Get alerts for errors
4. 🚀 **Share with students** - Your tutor is ready!

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## ❓ Need Help?

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [vercel.com/community](https://vercel.com/community)

---

**Congratulations! 🎉 Your AI Math Tutor is now securely deployed with NO monthly costs!**

