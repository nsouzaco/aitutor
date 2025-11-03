# Tech Context: AI Math Tutor

## Technology Stack

### Frontend Framework

**React 18 with TypeScript**
- **Why React:** Component-based, large ecosystem, team familiarity
- **Why TypeScript:** Type safety reduces bugs, better IDE support, self-documenting code
- **Version:** 18.2+ (uses concurrent features)

### Build Tool

**Vite**
- **Why:** Fast HMR, optimized builds, modern ESM-based
- **Config:** Standard React + TypeScript template
- **Dev Server:** Lightning-fast startup and reloads

### Styling

**Tailwind CSS**
- **Why:** Rapid UI development, consistent design system, small bundle size
- **Config:** Custom color palette for education/learning theme
- **Utilities:** Custom spacing, typography scale for math content

### Math Rendering

**KaTeX**
- **Why:** Fast synchronous rendering, lightweight, good LaTeX coverage
- **Alternatives Considered:** MathJax (too heavy), custom renderer (too complex)
- **Package:** `react-katex` for React integration
- **Usage:** Inline `$x^2$` and block `$$...$$` notation

### State Management

**React Context API + Hooks**
- **Why:** Built-in, sufficient for app scale, no extra dependencies
- **Structure:** 
  - `ConversationContext` - manages chat state
  - `AppContext` - global app state
- **Alternative:** Could upgrade to Zustand/Redux if app grows

### Backend Services

**Firebase**
- **Firestore:** NoSQL database for conversations
- **Hosting:** Static site hosting with CDN
- **Storage:** (Future) Store uploaded images
- **Auth:** (Phase 2) User authentication

**OpenAI API**
- **Model:** GPT-4 or GPT-4 Turbo
- **Vision API:** OCR for uploaded images
- **Endpoints:** 
  - `/v1/chat/completions` - Socratic dialogue
  - `/v1/vision` - Image processing

### Image Handling

**react-dropzone**
- **Why:** Drag-and-drop support, mobile-friendly, accessible
- **File Types:** JPEG, PNG, WebP
- **Max Size:** 10MB (compressed client-side to ~5MB)

### Development Tools

**Version Control:** Git + GitHub
**Package Manager:** npm (could use pnpm for speed)
**Linting:** ESLint with React + TypeScript rules
**Formatting:** Prettier for code consistency
**Testing:** Vitest + React Testing Library
**CI/CD:** GitHub Actions → Firebase Hosting

## Development Setup

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0

# Optional but recommended
git
VS Code with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
```

### Environment Variables

```bash
# .env.local (never commit this)
VITE_OPENAI_API_KEY=sk-...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Installation

```bash
# Clone repo
git clone <repo-url>
cd aitutor

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Available Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "deploy": "npm run build && firebase deploy"
  }
}
```

## Key Dependencies

### Production Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "firebase": "^10.7.0",
  "openai": "^4.20.0",
  "katex": "^0.16.9",
  "react-katex": "^3.0.1",
  "react-dropzone": "^14.2.3",
  "lucide-react": "^0.263.1"
}
```

### Development Dependencies

```json
{
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.14",
  "postcss": "^8.4.24",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0"
}
```

## Technical Constraints

### Browser Support

**Target Browsers:**
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 14+
- Chrome Android: Last 2 versions

**Not Supporting:** IE11 (end of life)

### Performance Targets

- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **API Response Time:** <3s for LLM responses
- **Image Processing:** <5s for OCR

### API Rate Limits

**OpenAI API:**
- GPT-4: 10,000 TPM (tokens per minute)
- Vision API: 100 images/minute
- Implement client-side rate limiting

**Firebase:**
- Reads: 50,000/day (free tier)
- Writes: 20,000/day (free tier)
- Should be sufficient for MVP

### File Size Constraints

- **Image Upload:** Max 10MB
- **Bundle Size Target:** <500KB (initial JS)
- **Conversation History:** Store last 20 messages max

## Development Workflow

### Git Workflow

```bash
main (protected)
  └── develop (default branch)
       ├── feature/problem-input
       ├── feature/socratic-engine
       ├── feature/math-rendering
       └── feature/ui-polish
```

**Branch Naming:**
- `feature/` - new features
- `fix/` - bug fixes
- `refactor/` - code improvements
- `test/` - test additions

**Commit Messages:**
```
feat: add image upload with compression
fix: correct KaTeX rendering for fractions
refactor: extract conversation logic to hook
test: add tests for hint detection
```

### Code Quality Standards

**TypeScript:**
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Interfaces over types for objects

**React:**
- Functional components only
- Custom hooks for reusable logic
- Prop types defined with TypeScript
- Meaningful component names

**Tailwind:**
- Use design system (colors, spacing)
- Extract repeated patterns to components
- Mobile-first responsive design

### Testing Strategy

**Unit Tests:**
- Utility functions (math parsing, validation)
- Custom hooks
- Service layer functions

**Component Tests:**
- Render without errors
- Handle user interactions
- Display correct content

**Integration Tests:**
- Complete conversation flow
- Image upload → OCR → chat
- Math rendering pipeline

**E2E Tests (Future):**
- Playwright for critical user journeys

### Deployment Process

**Development:**
```bash
npm run dev
# Runs at http://localhost:5173
```

**Preview Build:**
```bash
npm run build
npm run preview
# Test production build locally
```

**Production Deploy:**
```bash
npm run build
firebase deploy
# Deployed to Firebase Hosting
```

## Firebase Configuration

### Firestore Structure

```
conversations/
  {conversationId}/
    - id: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - problemText: string
    - problemImageUrl?: string
    - status: 'active' | 'completed' | 'abandoned'
    - messageCount: number
    - hintsGiven: number
    
    messages/ (subcollection)
      {messageId}/
        - id: string
        - timestamp: timestamp
        - sender: 'user' | 'assistant'
        - content: string
        - type: 'text' | 'hint' | 'celebration'
```

### Firestore Indexes

```javascript
// Composite indexes needed:
// 1. conversations: createdAt (desc)
// 2. messages: timestamp (asc)
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      // Phase 1: Open for testing
      allow read, write: if true;
      
      // Phase 2: Auth required
      // allow read, write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read, write: if true;
      }
    }
  }
}
```

## API Integration Patterns

### OpenAI Chat API

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for MVP - move to backend for production
});

const sendMessage = async (messages: Message[]) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: messages,
    temperature: 0.7,
    max_tokens: 500,
  });
  
  return response.choices[0].message.content;
};
```

### OpenAI Vision API

```typescript
const extractTextFromImage = async (imageBase64: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract the math problem from this image. Return only the problem text.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    max_tokens: 300
  });
  
  return response.choices[0].message.content;
};
```

## Known Technical Limitations

### Phase 1 Limitations

1. **API Key Security:** API key exposed in browser (acceptable for MVP, needs backend for production)
2. **No Authentication:** Anyone can use the app (Phase 2 will add Firebase Auth)
3. **No Conversation History:** Can't resume past conversations (Phase 2 feature)
4. **Limited OCR:** Complex notation may not extract perfectly
5. **No Offline Support:** Requires internet connection

### Future Improvements

1. **Backend API:** Move OpenAI calls to Firebase Cloud Functions
2. **Streaming Responses:** Stream LLM responses for faster perceived speed
3. **Conversation Persistence:** Save and resume conversations across sessions
4. **Advanced Math:** Support more complex notation (calculus, matrices)
5. **Mobile App:** React Native version for better mobile experience

## Troubleshooting Common Issues

### Development Issues

**Issue:** Vite dev server won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue:** TypeScript errors after dependency update
```bash
# Rebuild TypeScript cache
npx tsc --build --clean
npx tsc --build
```

**Issue:** Tailwind styles not applying
```bash
# Check tailwind.config.js content paths
# Restart dev server
```

### Build Issues

**Issue:** Build fails with type errors
```bash
# Run type check
npm run tsc --noEmit
```

**Issue:** Bundle size too large
```bash
# Analyze bundle
npm run build -- --mode analyze
```

### Runtime Issues

**Issue:** CORS errors with OpenAI API
```
# Move API calls to backend (Firebase Functions)
```

**Issue:** Firebase quota exceeded
```
# Check Firebase console for usage
# Optimize queries, add caching
```

## Resources & Documentation

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Firebase Docs](https://firebase.google.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [KaTeX Documentation](https://katex.org/docs/)

