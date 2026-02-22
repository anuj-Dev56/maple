# 🔐 Maple - Environment Setup Guide

## Firebase Credentials Configuration

This guide explains how to properly configure Firebase credentials for the Maple project without exposing secrets in version control.

### ✅ What Has Been Done

1. **Removed credentials from Git** - The Firebase JSON credentials file has been removed from version control
2. **Added `.gitignore`** - Environment variables and credentials are now protected from accidental commits
3. **Created `.env.example`** - Template file showing all required environment variables
4. **Updated `.env` file** - Your local environment variables are configured (NOT committed to git)

---

## 📋 Setup Instructions

### 1. Backend Setup

#### Step 1: Copy Environment Template (First Time Only)
```bash
cd backend
cp .env.example .env
```

#### Step 2: Add Your Firebase Credentials to `.env`

Open `backend/.env` and fill in your Firebase service account credentials:

```dotenv
# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_cert_url
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

#### Step 3: How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (maple-94509)
3. Click **Project Settings** ⚙️
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Copy all fields from the downloaded JSON file to your `.env` file

---

## 🔒 Security Best Practices

### ✅ DO:
- ✓ Store credentials in `.env` file (local only)
- ✓ Use environment variables in your code
- ✓ Keep `.env` in `.gitignore`
- ✓ Rotate keys regularly
- ✓ Use different keys for development and production
- ✓ Never commit `.env` files to git

### ❌ DON'T:
- ✗ Commit `.env` files to git
- ✗ Hardcode credentials in source code
- ✗ Share credentials in messages or emails
- ✗ Store credentials in JSON files in the repository
- ✗ Use production credentials for development

---

## 📁 File Structure

```
maple/
├── .gitignore                    # Ignores .env and credentials/
├── .env.example                  # Template (safe to commit)
├── backend/
│   ├── .env                      # Your actual secrets (NOT committed)
│   ├── .env.example              # Template
│   ├── credentials/              # Ignored by git
│   │   └── maple-94509-firebase-adminsdk-fbsvc-7d0050367c.json
│   └── src/
│       └── utils/
│           └── firebase.js       # Already configured for .env variables
└── ...
```

---

## 🚀 Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
```

The app will automatically load credentials from your `.env` file using `dotenv`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Troubleshooting

### Error: "Unable to detect a Project Id"
- **Cause**: Firebase credentials not loaded from `.env`
- **Solution**: Verify your `.env` file has `FIREBASE_PROJECT_ID` set correctly

### Error: "Cannot read property 'cert' of undefined"
- **Cause**: `.env` variables not being parsed
- **Solution**: Ensure `dotenv.config()` is called in your `index.js` before initializing Firebase

### Credentials Still Exposed?
- **Solution**: Run `git rm --cached backend/credentials/ && git commit -m "Remove credentials"`
- Then visit: https://github.com/your-repo/security/secret-scanning/unblock-secret

---

## 📚 References

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [12-Factor App - Config](https://12factor.net/config)
- [GitHub - Protecting Secrets](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

## ✅ Verification Checklist

Before pushing to production:

- [ ] `.env` file exists locally with all credentials
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` is committed (without real values)
- [ ] Firebase service account key is secure
- [ ] Different keys for dev/staging/production
- [ ] No hardcoded secrets in source files
- [ ] GitHub secret scanning enabled
- [ ] Team members have their own `.env` files

---

**Last Updated**: February 2026
**Status**: ✅ Secure Configuration Implemented
