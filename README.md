# Sparkie - AI Math Tutor

An AI-powered math tutor that uses the Socratic method to guide students through problem-solving without giving direct answers.

## Features

- 🎓 **Socratic Method**: Guides students through discovery learning
- 📸 **Image Upload**: Upload photos of math problems (handwritten or printed)
- ✨ **Beautiful Math Rendering**: Professional LaTeX equation display
- 💬 **Interactive Chat**: Clean, distraction-free conversation interface
- 🔐 **User Authentication**: Save conversation history with Firebase Auth
- 🎯 **Adaptive Hints**: Escalating hint system when students get stuck

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Math Rendering**: KaTeX
- **Backend**: 
  - Firebase (Firestore + Auth)
  - Vercel Serverless Functions (OpenAI API proxy)
- **AI**: OpenAI API (GPT-4o + Vision)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel (FREE tier)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- OpenAI API key
- Firebase project

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd aitutor
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your OpenAI API key
   - Add your Firebase configuration

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be running at `http://localhost:5173`

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (Email/Password + Google)
5. Enable Firebase Hosting
6. Copy your Firebase configuration to `.env.local`

### OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Save it for Vercel deployment (see deployment guide)

> **Note**: For local development, you'll need to run the Vercel dev server to use the serverless functions. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for details.

## Available Scripts

- `npm run dev` - Start development server (Vite only, no API)
- `vercel dev` - Start with Vercel serverless functions (recommended)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## Deployment

This project uses **Vercel's FREE tier** for hosting and serverless functions to securely handle OpenAI API calls.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables (Firebase + OpenAI API key)
4. Deploy! 🚀

**Full deployment guide**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### Why Vercel?

- ✅ **FREE** hosting & serverless functions
- ✅ **Secure** API key storage (server-side only)
- ✅ **Auto-deployment** on git push
- ✅ **No credit card** required

## Project Structure

\`\`\`
src/
├── components/       # React components
│   ├── Auth/        # Authentication components
│   ├── Chat/        # Chat interface
│   ├── ImageUpload/ # Image upload UI
│   ├── Layout/      # Layout components
│   └── MathRenderer/# Math display
├── contexts/        # React Context
├── hooks/           # Custom React hooks
├── services/        # API integrations
├── utils/           # Helper functions
├── types/           # TypeScript types
└── constants/       # Constants and prompts
\`\`\`

## Development Timeline

- ✅ **Day 0**: Environment Setup
- ⏳ **Day 1**: Core UI Foundation
- ⏳ **Day 2**: LLM Integration
- ⏳ **Day 3**: Math Rendering
- ⏳ **Day 4**: Image Upload
- ⏳ **Day 5**: UI Polish & Testing
- ⏳ **Day 6**: Authentication
- ⏳ **Day 7**: Deployment

## License

MIT

## Acknowledgments

- Inspired by the OpenAI x Khan Academy demo
- Built with modern React and TypeScript best practices

