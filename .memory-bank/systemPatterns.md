# System Patterns: AI Math Tutor

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐
│   User Input    │
│  (Text/Image)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Image Parser   │◄──── OpenAI Vision API
│  (OCR Service)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Conversation    │
│   Context       │◄──── React State/Context
│   Manager       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Socratic        │◄──── OpenAI API (GPT-4)
│ Dialogue Engine │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Math Renderer  │◄──── KaTeX
│  (LaTeX → UI)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore     │
│  (Persistence)  │
└─────────────────┘
```

### Project Structure

```
aitutor/
├── .memory-bank/              # Memory Bank files
├── .cursor/
│   └── rules/                 # Project-specific rules
├── src/
│   ├── components/            # React components
│   │   ├── Chat/             # Chat interface
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── InputArea.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── ImageUpload/      # Image upload
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   └── DropZone.tsx
│   │   ├── MathRenderer/     # Math display
│   │   │   ├── MathBlock.tsx
│   │   │   └── MathInline.tsx
│   │   ├── Layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingState.tsx
│   │   └── Hints/            # Hint display
│   │       └── HintCard.tsx
│   ├── contexts/             # React Context
│   │   ├── ConversationContext.tsx
│   │   └── AppContext.tsx
│   ├── hooks/                # Custom hooks
│   │   ├── useConversation.ts
│   │   ├── useImageUpload.ts
│   │   └── useMathRenderer.ts
│   ├── services/             # API integrations
│   │   ├── openaiService.ts  # OpenAI API wrapper
│   │   ├── firebaseService.ts
│   │   └── imageService.ts
│   ├── utils/                # Helper functions
│   │   ├── mathParser.ts
│   │   ├── promptBuilder.ts
│   │   └── validators.ts
│   ├── types/                # TypeScript types
│   │   ├── conversation.ts
│   │   ├── message.ts
│   │   └── api.ts
│   ├── constants/            # Constants
│   │   └── prompts.ts
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/
├── tests/                    # Test files
├── .env.local                # Environment variables
├── .gitignore
├── firebase.json             # Firebase config
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Core Design Patterns

### 1. Conversation State Management

**Pattern:** Centralized conversation state with Context API

```typescript
interface ConversationState {
  conversationId: string;
  messages: Message[];
  problemText: string;
  problemImageUrl?: string;
  status: 'idle' | 'thinking' | 'processing_image' | 'completed';
  stuckCount: number; // Track hint escalation
}
```

**Why:**
- Single source of truth for conversation state
- Easy to persist to Firestore
- Accessible from any component
- Supports conversation history

### 2. Message Flow Pattern

**Pattern:** Unidirectional data flow

```
User Input → Validation → Add to State → Send to API → Add Response → Render
```

**Implementation:**
1. User submits message
2. Validate input (not empty, appropriate format)
3. Add user message to state immediately (optimistic UI)
4. Send to OpenAI API with full conversation context
5. Stream or receive response
6. Add AI response to state
7. Persist to Firestore
8. Render with math formatting

### 3. Socratic Prompt Engineering

**Pattern:** Structured system prompt with conversation context

```typescript
const systemPrompt = `
You are a patient, encouraging math tutor using the Socratic method.

CORE RULES:
1. NEVER solve problems directly or give direct answers
2. Guide through structured questions
3. Validate student reasoning
4. Provide hints when stuck (detected by uncertain responses)
5. Use warm, encouraging language
6. Celebrate progress and correct thinking

CONVERSATION FLOW:
1. Inventory Phase: "What information do we have?"
2. Goal Phase: "What are we trying to find?"
3. Strategy Phase: "What approach might work?"
4. Execution Phase: Guide through each step
5. Validation Phase: "Does this make sense?"

HINT ESCALATION:
- Level 1: Socratic question (always start here)
- Level 2: Multiple choice or narrowing question
- Level 3: Concrete hint with direction
- Level 4: Similar worked example
- NEVER: Complete solution

LANGUAGE:
- Use "we" not "you" (collaborative)
- Celebrate small wins
- Never express frustration
- Keep questions focused and clear
`;
```

**Context Building:**
```typescript
const messages = [
  { role: 'system', content: systemPrompt },
  ...conversationHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }))
];
```

### 4. Image Processing Pattern

**Pattern:** OCR with validation and fallback

```
Image Upload → Compress → Send to Vision API → Extract Text → Validate → Use or Re-prompt
```

**Steps:**
1. User uploads image
2. Client-side compression (<5MB)
3. Send to OpenAI Vision API with prompt:
   ```
   "Extract the math problem from this image. 
    Return only the problem text, preserving all mathematical notation.
    If unclear, indicate what needs clarification."
   ```
4. Validate extraction quality
5. Show preview to user for confirmation
6. If poor quality, allow text re-entry

### 5. Math Rendering Pattern

**Pattern:** Detect and render LaTeX notation

```typescript
// Inline math: $x^2 + 5x + 6 = 0$
// Block math: $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$

const renderMathContent = (text: string) => {
  // Split text by math delimiters
  // Render text parts as normal text
  // Render math parts with KaTeX
  return <MathRenderer content={text} />;
};
```

**Implementation:**
- Detect `$...$` for inline math
- Detect `$$...$$` for block math
- Parse and render with KaTeX
- Graceful fallback for rendering errors

### 6. Hint Detection Pattern

**Pattern:** Track conversation state to determine when hints needed

```typescript
interface HintState {
  stuckCount: number;
  lastQuestionType: 'socratic' | 'hint_l1' | 'hint_l2' | 'hint_l3';
}

const detectNeedsHint = (response: string): boolean => {
  const uncertainPhrases = [
    'i don\'t know',
    'not sure',
    'confused',
    'don\'t understand',
    '??' // Multiple question marks
  ];
  
  return uncertainPhrases.some(phrase => 
    response.toLowerCase().includes(phrase)
  );
};
```

### 7. Firestore Data Pattern

**Pattern:** Document-per-conversation with subcollections

```typescript
// Collection: conversations/{conversationId}
interface ConversationDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  problemText: string;
  problemImageUrl?: string;
  status: 'active' | 'completed' | 'abandoned';
  messageCount: number;
  hintsGiven: number;
}

// Subcollection: conversations/{conversationId}/messages/{messageId}
interface MessageDocument {
  id: string;
  timestamp: Timestamp;
  sender: 'user' | 'assistant';
  content: string;
  type: 'text' | 'hint' | 'celebration';
}
```

## Key Technical Decisions

### 1. Why React Context over Redux?

**Decision:** Use React Context API + hooks for state management

**Reasoning:**
- App is small/medium scale
- State is primarily conversation-focused
- Context API is sufficient for our needs
- Reduces dependency count and bundle size
- Easier to understand for contributors

**Trade-off:** If app grows significantly, may need to refactor to Redux/Zustand

### 2. Why Vite over Create React App?

**Decision:** Use Vite as build tool

**Reasoning:**
- Faster development server (instant HMR)
- Faster production builds
- Better TypeScript support out of box
- Smaller bundle sizes
- Modern, actively maintained

### 3. Why Firebase over Custom Backend?

**Decision:** Use Firebase (Firestore + Hosting)

**Reasoning:**
- Rapid development (no backend code needed)
- Real-time database (bonus for future features)
- Free tier covers MVP
- Built-in authentication for Phase 2
- Easy deployment

**Trade-off:** Vendor lock-in, but acceptable for MVP

### 4. Why OpenAI over Claude?

**Decision:** Use OpenAI API (GPT-4) instead of Claude

**Reasoning:**
- User requirement
- GPT-4 has strong reasoning capabilities
- OpenAI Vision API for image processing
- Well-documented API
- Good prompt adherence

**Note:** Original PRD specified Claude, but user requested OpenAI

### 5. Why KaTeX over MathJax?

**Decision:** Use KaTeX for math rendering

**Reasoning:**
- Faster rendering (synchronous, no layout shifts)
- Lighter weight (~115KB minified)
- Simpler API
- Good enough coverage for K-12 math

**Trade-off:** MathJax has more complete LaTeX support, but KaTeX is faster

## Error Handling Patterns

### 1. API Errors

```typescript
try {
  const response = await openaiService.sendMessage(messages);
  return response;
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    return { error: 'Too many requests. Please try again in a moment.' };
  } else if (error.code === 'invalid_api_key') {
    return { error: 'Configuration error. Please contact support.' };
  } else {
    return { error: 'Something went wrong. Please try again.' };
  }
}
```

### 2. Image Upload Errors

```typescript
const validateImage = (file: File) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > MAX_SIZE) {
    throw new Error('Image must be less than 10MB');
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image');
  }
};
```

### 3. Math Rendering Errors

```typescript
const SafeMathRenderer = ({ content }) => {
  try {
    return <KaTeX math={content} />;
  } catch (error) {
    console.error('Math rendering error:', error);
    return <pre>{content}</pre>; // Fallback to plain text
  }
};
```

## Performance Patterns

### 1. Image Compression

```typescript
const compressImage = async (file: File): Promise<Blob> => {
  const maxWidth = 1920;
  const maxHeight = 1080;
  const quality = 0.8;
  
  // Use canvas to resize and compress
  // Return compressed blob
};
```

### 2. Debounced Input

```typescript
// Don't send every keystroke to API
const debouncedSend = useMemo(
  () => debounce((message: string) => sendMessage(message), 300),
  []
);
```

### 3. Lazy Loading Components

```typescript
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
```

## Security Patterns

### 1. API Key Protection

```typescript
// NEVER expose API keys in frontend code
// Use environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// For production, call API through Firebase Cloud Functions
```

### 2. Input Sanitization

```typescript
const sanitizeUserInput = (input: string): string => {
  // Remove potential XSS vectors
  return DOMPurify.sanitize(input);
};
```

### 3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Read-only for conversations (no auth in Phase 1)
    match /conversations/{conversationId} {
      allow read: if true;
      allow write: if true; // Tighten in Phase 2 with auth
    }
  }
}
```

## Testing Patterns

### 1. Component Testing

```typescript
describe('Message Component', () => {
  it('renders user messages with correct styling', () => {
    render(<Message sender="user" content="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
```

### 2. Service Testing

```typescript
describe('OpenAI Service', () => {
  it('builds correct prompt structure', () => {
    const messages = buildPrompt(conversationHistory);
    expect(messages[0].role).toBe('system');
  });
});
```

### 3. Integration Testing

```typescript
describe('Chat Flow', () => {
  it('completes a full conversation', async () => {
    // 1. User enters problem
    // 2. AI responds with question
    // 3. User answers
    // 4. Conversation continues
    // 5. Problem solved
  });
});
```

