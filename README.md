# Sparkie - AI Math Tutor

Sparkie is an intelligent, AI-powered math tutor designed to guide students through problem-solving using the Socratic method. Instead of simply providing answers, Sparkie encourages discovery learning by asking guiding questions, helping students build true understanding.

## ✨ Key Features

- **🧠 Socratic Guidance**: AI tutor that guides rather than tells, fostering critical thinking.
- **📸 Visual Problem Solving**: Upload images of handwritten or printed math problems for instant analysis.
- **🔢 Professional Math Rendering**: Beautiful LaTeX rendering for complex equations and expressions.
- **💬 Interactive Interface**: Clean, distraction-free chat experience tailored for learning.
- **📊 Progress Tracking**: Detailed mastery tracking and knowledge visualization.
- **🔐 Secure Architecture**: Serverless integration ensuring API keys remain protected.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Math Engine**: KaTeX, React-KaTeX
- **Backend/Serverless**: Vercel Serverless Functions (Node.js)
- **Database & Auth**: Firebase Firestore & Authentication
- **AI Model**: OpenAI GPT-4o with Vision capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- OpenAI API Key
- Firebase Project (Firestore & Auth enabled)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aitutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following configuration:

   ```env
   # OpenAI (Required for Tutor Intelligence)
   OPENAI_API_KEY=your_openai_api_key_here

   # Firebase (Required for Auth & Database)
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server**
   To fully enable the serverless API functions locally, use Vercel CLI (recommended):

   ```bash
   npm i -g vercel
   vercel dev
   ```
   
   Alternatively, for UI-only development:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000` (Vercel) or `http://localhost:5173` (Vite).

## 📦 Deployment

This project is optimized for **Vercel** deployment, utilizing their zero-config serverless functions to securely proxy OpenAI API requests.

1. **Push to GitHub**: Ensure your repository is up to date.
2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com).
   - Import your repository.
   - Framework preset should auto-detect as **Vite**.
3. **Configure Environment Variables**:
   - Add all variables from your `.env.local` to the Vercel project settings.
   - **Critical**: Ensure `OPENAI_API_KEY` is added to the Environment Variables in Vercel to enable the AI features.
4. **Deploy**: Click deploy and your tutor is live!

## 📂 Project Structure

```
src/
├── api/               # Vercel Serverless Functions
├── components/        # React UI Components
│   ├── Auth/          # Authentication Screens
│   ├── Chat/          # Conversation Interface
│   ├── Dashboard/     # Progress & Stats
│   └── MathRenderer/  # KaTeX Wrappers
├── contexts/          # Global State (Auth, Practice)
├── services/          # Firebase & API Services
├── types/             # TypeScript Definitions
└── utils/             # Helper Functions & Logic
```

## 📄 License

This project is licensed under the MIT License.
