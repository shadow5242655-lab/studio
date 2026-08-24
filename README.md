# AYUMUSIC - Premium Sound Discovery

High-fidelity music resonance for the modern listener.

## How to Host for Free

### Option 1: Firebase App Hosting (Recommended)
Firebase App Hosting is designed specifically for Next.js apps.

1.  **Push to GitHub**: Create a repository on GitHub and push your code there.
2.  **Firebase Console**: Go to the [Firebase Console](https://console.firebase.google.com/).
3.  **Add Project**: Create a new Firebase project (if not already created).
4.  **App Hosting**: In the left sidebar, click **Build** > **App Hosting**.
5.  **Get Started**: Connect your GitHub account and select your repository.
6.  **Configuration**: 
    *   Set the **Root Directory** to `/`.
    *   The build command will automatically be detected as `npm run build`.
7.  **Environment Variables**: If you are using Genkit or other API keys, add them in the "Environment Variables" section of the App Hosting setup.
8.  **Deploy**: Firebase will build and deploy your app. It will stay in the free tier as long as your traffic is low.

### Option 2: Vercel
Since this is a Next.js app, Vercel is the easiest "zero-config" free hosting option.

1.  Push your code to GitHub.
2.  Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
3.  Import your GitHub repository.
4.  Vercel will automatically detect Next.js settings.
5.  Click **Deploy**.

## Environment Variables
Ensure you set your `GOOGLE_GENAI_API_KEY` (if using Genkit) in your hosting provider's dashboard to enable the AI features.

---
Built with Next.js, Tailwind, and Firebase.
