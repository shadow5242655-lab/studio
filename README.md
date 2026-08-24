# AYUMUSIC - Premium Sound Discovery

High-fidelity music resonance for the modern listener.

## How to Host for Free

### Option 1: Vercel (Recommended for Next.js)
Vercel is the creator of Next.js and provides the smoothest free hosting experience.

1.  **Push to GitHub**: Create a new repository on [GitHub](https://github.com/) and push your code there.
2.  **Sign in to Vercel**: Go to [Vercel.com](https://vercel.com/) and sign in with your GitHub account.
3.  **Import Project**: Click **"Add New"** > **"Project"**.
4.  **Select Repo**: Find your repository in the list and click **"Import"**.
5.  **Configure Environment Variables**:
    *   If you are using Genkit or AI features, go to the **Environment Variables** section.
    *   Add `GOOGLE_GENAI_API_KEY` with your Gemini API key.
6.  **Deploy**: Click **"Deploy"**. Vercel will automatically detect Next.js, build your app, and give you a public URL (e.g., `ayumusics.vercel.app`).

### Option 2: Firebase App Hosting
Firebase App Hosting is designed specifically for Next.js apps within the Google ecosystem.

1.  **Firebase Console**: Go to the [Firebase Console](https://console.firebase.google.com/).
2.  **App Hosting**: In the left sidebar, click **Build** > **App Hosting**.
3.  **Connect GitHub**: Select your repository.
4.  **Settings**: The default settings in `apphosting.yaml` are already optimized to keep you within the free tier (scaling to zero when idle).
5.  **Environment Variables**: Add your `GOOGLE_GENAI_API_KEY` in the Firebase dashboard if prompted.

---
Built with Next.js, Tailwind, and Firebase.
