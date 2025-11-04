# Tasks: AI Math Tutor - Complete Build Plan

**Last Updated:** November 3, 2025  
**Status:** Awaiting Review & Approval

## Build Order Overview

This task list follows an optimized build order that prioritizes working software early:

1. **Day 0:** Environment Setup (2-3 hours)
2. **Day 1:** Core UI Foundation + Basic Chat (8 hours)
3. **Day 2:** LLM Integration + Socratic Logic (8 hours)
4. **Day 3:** Math Rendering + Text Input Processing (8 hours)
5. **Day 4:** Image Upload + OCR (8 hours)
6. **Day 5:** UI Polish + Comprehensive Testing (8 hours)
7. **Day 6:** User Authentication (4-6 hours) ✨ **NEW - Added to Phase 1**
8. **Day 7:** Firebase Persistence + Deployment (4-6 hours)
9. **Day 8+:** Stretch Features (Optional)

**Key Changes from PRD:**
- Building UI first, combining LLM + Socratic logic, deferring image upload slightly
- **Authentication moved to Phase 1 (was Phase 2)** - enables user accounts, conversation history, and better security from launch

---

## Day 0: Environment Setup (2-3 hours)

### 0.1 Project Initialization
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** None

**Tasks:**
- [ ] Initialize Vite + React + TypeScript project
- [ ] Verify project runs (`npm run dev`)
- [ ] Initialize Git repository
- [ ] Create `.gitignore` file
- [ ] Make initial commit

**Testing:**
- [ ] Dev server starts without errors
- [ ] Hot module replacement works
- [ ] TypeScript compilation succeeds

**Acceptance Criteria:**
- ✅ React app loads in browser at localhost:5173
- ✅ Changes trigger hot reload
- ✅ No console errors

---

### 0.2 Install Core Dependencies
**Priority:** P0 (Critical)  
**Estimated Time:** 20 minutes  
**Dependencies:** 0.1

**Tasks:**
- [ ] Install React dependencies: `react`, `react-dom`
- [ ] Install TypeScript types: `@types/react`, `@types/react-dom`
- [ ] Install OpenAI SDK: `openai@^4.20.0`
- [ ] Install Firebase: `firebase@^10.7.0`
- [ ] Install KaTeX: `katex@^0.16.9`, `react-katex@^3.0.1`
- [ ] Install Tailwind: `tailwindcss`, `autoprefixer`, `postcss`
- [ ] Install react-dropzone: `react-dropzone@^14.2.3`
- [ ] Install Lucide icons: `lucide-react@^0.263.1`
- [ ] Verify all packages install successfully

**Testing:**
- [ ] `npm install` completes without errors
- [ ] No peer dependency warnings
- [ ] Project still builds successfully

**Acceptance Criteria:**
- ✅ All dependencies listed in `package.json`
- ✅ `package-lock.json` generated
- ✅ No installation errors

---

### 0.3 Install Development Dependencies
**Priority:** P0 (Critical)  
**Estimated Time:** 15 minutes  
**Dependencies:** 0.2

**Tasks:**
- [ ] Install ESLint: `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- [ ] Install Prettier: `prettier`, `eslint-config-prettier`
- [ ] Install Vitest: `vitest@^1.0.0`, `@vitest/ui`
- [ ] Install Testing Library: `@testing-library/react@^14.0.0`, `@testing-library/jest-dom`
- [ ] Create ESLint config (`.eslintrc.json`)
- [ ] Create Prettier config (`.prettierrc`)
- [ ] Add lint and format scripts to `package.json`

**Testing:**
- [ ] Run `npm run lint` - should execute without errors
- [ ] Run `npm run format` - should format files
- [ ] Run `npm run test` - should initialize test runner

**Acceptance Criteria:**
- ✅ Linting works on TypeScript files
- ✅ Prettier formats code consistently
- ✅ Test runner initializes

---

### 0.4 Configure Tailwind CSS
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 0.2

**Tasks:**
- [ ] Run `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js` with custom theme:
  - Primary colors (indigo palette)
  - Typography scale
  - Custom spacing
  - Breakpoints
- [ ] Add Tailwind directives to `src/index.css`
- [ ] Import KaTeX CSS in `src/index.css`
- [ ] Test Tailwind classes in App.tsx

**Testing:**
- [ ] Tailwind classes apply correctly
- [ ] Custom colors work
- [ ] JIT compilation working
- [ ] Hot reload works with Tailwind changes

**Acceptance Criteria:**
- ✅ Tailwind classes render styles
- ✅ Custom theme colors available
- ✅ KaTeX CSS loaded
- ✅ No style conflicts

---

### 0.5 Firebase Project Setup
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** None (external)

**Tasks:**
- [ ] Create Firebase project in console
- [ ] Enable Firestore Database
- [ ] Enable Firebase Hosting
- [ ] Copy Firebase configuration credentials
- [ ] Create `.env.local` file
- [ ] Add Firebase environment variables
- [ ] Add OpenAI API key to `.env.local`
- [ ] Create `.env.example` template
- [ ] Add `.env.local` to `.gitignore`

**Testing:**
- [ ] Environment variables load correctly
- [ ] `import.meta.env.VITE_*` variables accessible
- [ ] No credentials committed to Git

**Acceptance Criteria:**
- ✅ Firebase project created
- ✅ Environment variables configured
- ✅ API keys not in version control

---

### 0.6 Project Structure Setup
**Priority:** P0 (Critical)  
**Estimated Time:** 20 minutes  
**Dependencies:** 0.1

**Tasks:**
- [ ] Create folder structure:
  ```
  src/
  ├── components/
  │   ├── Chat/
  │   ├── ImageUpload/
  │   ├── MathRenderer/
  │   ├── Layout/
  │   └── Hints/
  ├── contexts/
  ├── hooks/
  ├── services/
  ├── utils/
  ├── types/
  └── constants/
  ```
- [ ] Create placeholder `index.ts` files in each directory
- [ ] Set up path aliases in `tsconfig.json` (optional but recommended)

**Testing:**
- [ ] Import statements work across directories
- [ ] TypeScript resolves module paths
- [ ] No import errors

**Acceptance Criteria:**
- ✅ All directories created
- ✅ Clean folder structure
- ✅ TypeScript imports work

---

### 0.7 Firebase Service Initialization
**Priority:** P0 (Critical)  
**Estimated Time:** 20 minutes  
**Dependencies:** 0.5

**Tasks:**
- [ ] Create `src/services/firebaseService.ts`
- [ ] Initialize Firebase app with config
- [ ] Export Firestore instance
- [ ] Test Firebase connection
- [ ] Set up basic Firestore security rules

**Testing:**
- [ ] Firebase initializes without errors
- [ ] Can access Firestore instance
- [ ] No authentication warnings
- [ ] Security rules deployed

**Acceptance Criteria:**
- ✅ Firebase SDK initialized
- ✅ Firestore accessible
- ✅ Connection successful

---

### 0.8 TypeScript Configuration
**Priority:** P1 (Important)  
**Estimated Time:** 15 minutes  
**Dependencies:** 0.1

**Tasks:**
- [ ] Review and enhance `tsconfig.json`:
  - Enable strict mode
  - Configure path mappings
  - Set target to ES2020
- [ ] Create `src/types/` shared type definitions
- [ ] Test TypeScript compilation

**Testing:**
- [ ] `npm run build` compiles successfully
- [ ] No type errors in strict mode
- [ ] Type checking works in editor

**Acceptance Criteria:**
- ✅ TypeScript strict mode enabled
- ✅ No compilation errors
- ✅ Type safety enforced

---

## Day 1: Core UI Foundation + Basic Chat (8 hours)

### 1.1 Basic Layout Structure
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** Day 0 complete

**Tasks:**
- [ ] Create `src/components/Layout/Header.tsx`
- [ ] Create `src/components/Layout/EmptyState.tsx`
- [ ] Create `src/App.tsx` with basic layout
- [ ] Implement responsive container (max-width: 768px)
- [ ] Add Header with app title and "New Problem" button
- [ ] Style with Tailwind CSS

**Testing:**
- [ ] Component renders without errors
- [ ] Responsive layout works on mobile/desktop
- [ ] Header sticky positioning works
- [ ] "New Problem" button visible

**Acceptance Criteria:**
- ✅ Clean, minimal layout
- ✅ Header with branding
- ✅ Centered container
- ✅ Responsive design

---

### 1.2 Message Component
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 1.1

**Tasks:**
- [ ] Create `src/types/message.ts` interface:
  ```typescript
  interface Message {
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'hint' | 'celebration';
  }
  ```
- [ ] Create `src/components/Chat/Message.tsx`
- [ ] Implement user message styling (right-aligned, white bg, border)
- [ ] Implement tutor message styling (left-aligned, soft indigo bg)
- [ ] Add avatar icons using Lucide React
- [ ] Add timestamp display
- [ ] Test with mock data

**Testing:**
- [ ] User messages display correctly
- [ ] Tutor messages display correctly
- [ ] Avatars render
- [ ] Timestamps format properly
- [ ] Visual distinction is clear
- [ ] Write unit test for Message component

**Acceptance Criteria:**
- ✅ Messages styled per design spec
- ✅ Clear visual hierarchy
- ✅ Responsive on mobile
- ✅ Tests passing

---

### 1.3 Message List Component
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 1.2

**Tasks:**
- [ ] Create `src/components/Chat/MessageList.tsx`
- [ ] Implement scrollable message container
- [ ] Add auto-scroll to bottom on new messages
- [ ] Add smooth scroll behavior
- [ ] Handle empty state
- [ ] Add message appearance animations

**Testing:**
- [ ] Messages render in correct order
- [ ] Auto-scroll works on new message
- [ ] Scroll container handles overflow
- [ ] Empty state displays correctly
- [ ] Animations smooth (200-300ms)
- [ ] Write unit test for MessageList

**Acceptance Criteria:**
- ✅ Messages display chronologically
- ✅ Smooth scrolling behavior
- ✅ Handles long conversations
- ✅ Tests passing

---

### 1.4 Input Area Component
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 1.3

**Tasks:**
- [ ] Create `src/components/Chat/InputArea.tsx`
- [ ] Implement auto-expanding textarea
- [ ] Add send button (disabled when empty)
- [ ] Handle Enter key to send (Shift+Enter for new line)
- [ ] Add character limit (optional)
- [ ] Style with Tailwind
- [ ] Make sticky to bottom

**Testing:**
- [ ] Textarea auto-expands with content
- [ ] Send button enables/disables correctly
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Sticky positioning works
- [ ] Write unit test for InputArea

**Acceptance Criteria:**
- ✅ Smooth input experience
- ✅ Keyboard shortcuts work
- ✅ Accessible (proper ARIA labels)
- ✅ Tests passing

---

### 1.5 Typing Indicator Component
**Priority:** P1 (Important)  
**Estimated Time:** 45 minutes  
**Dependencies:** 1.2

**Tasks:**
- [ ] Create `src/components/Chat/TypingIndicator.tsx`
- [ ] Implement animated three dots
- [ ] Style to match tutor message bubble
- [ ] Add fade-in/fade-out animation

**Testing:**
- [ ] Animation is smooth
- [ ] Displays in correct position
- [ ] Matches tutor message styling
- [ ] No performance issues
- [ ] Write unit test

**Acceptance Criteria:**
- ✅ Smooth, subtle animation
- ✅ Proper visual feedback
- ✅ Tests passing

---

### 1.6 Conversation State Management
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 1.4

**Tasks:**
- [ ] Create `src/types/conversation.ts` interface
- [ ] Create `src/contexts/ConversationContext.tsx`
- [ ] Implement conversation state:
  - messages array
  - loading state
  - error state
  - add message function
  - clear conversation function
- [ ] Create `src/hooks/useConversation.ts` custom hook
- [ ] Wire up to components

**Testing:**
- [ ] Context provides state correctly
- [ ] Add message updates state
- [ ] Clear conversation resets state
- [ ] Multiple consumers work
- [ ] Write unit tests for context and hook

**Acceptance Criteria:**
- ✅ Centralized state management
- ✅ Easy to use from components
- ✅ Tests passing

---

### 1.7 Wire Up Basic Chat with Mock Data
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 1.6

**Tasks:**
- [ ] Create mock message data
- [ ] Connect InputArea to conversation context
- [ ] Display user messages immediately
- [ ] Simulate tutor response with setTimeout (mock)
- [ ] Test complete conversation flow
- [ ] Show typing indicator during mock delay

**Testing:**
- [ ] User can type and send messages
- [ ] Messages appear in MessageList
- [ ] Typing indicator shows during delay
- [ ] Mock responses appear after delay
- [ ] Conversation state persists
- [ ] Integration test for chat flow

**Acceptance Criteria:**
- ✅ Working chat interface with mock data
- ✅ Smooth user experience
- ✅ Visual feedback at all stages
- ✅ Tests passing

---

### 1.8 Day 1 Testing & Polish
**Priority:** P1 (Important)  
**Estimated Time:** 30 minutes  
**Dependencies:** 1.7

**Tasks:**
- [ ] Test on mobile device/simulator
- [ ] Test on different browsers
- [ ] Fix any visual bugs
- [ ] Ensure accessibility (keyboard navigation)
- [ ] Run all tests and ensure passing
- [ ] Code review and cleanup

**Testing:**
- [ ] Mobile responsive works
- [ ] Cross-browser compatible
- [ ] All unit tests passing
- [ ] No console errors
- [ ] Accessibility audit passes

**Acceptance Criteria:**
- ✅ Working chat UI on all devices
- ✅ Clean, polished interface
- ✅ All tests green
- ✅ Ready for LLM integration

---

## Day 2: LLM Integration + Socratic Logic (8 hours)

### 2.1 OpenAI Service Setup
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** Day 1 complete

**Tasks:**
- [ ] Create `src/services/openaiService.ts`
- [ ] Initialize OpenAI SDK with API key
- [ ] Create `sendMessage` function
- [ ] Implement error handling:
  - Rate limit errors
  - Invalid API key
  - Network errors
  - Timeout errors
- [ ] Add retry logic with exponential backoff
- [ ] Test with simple API call

**Testing:**
- [ ] API key loads from environment
- [ ] Basic API call succeeds
- [ ] Error handling works for each error type
- [ ] Retry logic functions correctly
- [ ] Write unit tests for error scenarios

**Acceptance Criteria:**
- ✅ OpenAI SDK initialized
- ✅ Can send messages to API
- ✅ Robust error handling
- ✅ Tests passing

---

### 2.2 Socratic System Prompt
**Priority:** P0 (Critical)  
**Estimated Time:** 2 hours  
**Dependencies:** 2.1

**Tasks:**
- [ ] Create `src/constants/prompts.ts`
- [ ] Write comprehensive Socratic system prompt:
  - Core rules (never give answers)
  - Conversation flow (5 stages)
  - Hint escalation levels
  - Language guidelines (encouraging, collaborative)
  - Examples of good vs. bad responses
- [ ] Document prompt design decisions
- [ ] Test prompt with various problem types
- [ ] Iterate based on testing

**Testing:**
- [ ] Test with linear equations
- [ ] Test with word problems
- [ ] Test with geometry
- [ ] Verify it doesn't give direct answers
- [ ] Verify hint escalation works
- [ ] Manual testing with 10+ problems

**Acceptance Criteria:**
- ✅ LLM follows Socratic method
- ✅ Never gives direct answers
- ✅ Provides appropriate hints when stuck
- ✅ Encouraging tone maintained

---

### 2.3 Conversation Context Builder
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 2.2

**Tasks:**
- [ ] Create `src/utils/promptBuilder.ts`
- [ ] Implement `buildConversationContext` function:
  - Add system prompt
  - Add conversation history (last 20 messages)
  - Format messages for OpenAI API
  - Handle special message types (hints, celebrations)
- [ ] Add conversation metadata:
  - Problem type detection
  - Stuck count tracking
  - Hint level tracking

**Testing:**
- [ ] Context builds correctly
- [ ] Message format matches API expectations
- [ ] History truncates at 20 messages
- [ ] Metadata tracked properly
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ Proper context structure
- ✅ Efficient token usage
- ✅ Tests passing

---

### 2.4 Integrate LLM with Chat
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 2.3

**Tasks:**
- [ ] Update conversation context to call OpenAI API
- [ ] Replace mock responses with real LLM responses
- [ ] Show typing indicator during API call
- [ ] Handle streaming responses (optional but nice)
- [ ] Update message list in real-time
- [ ] Handle API errors gracefully

**Testing:**
- [ ] Real LLM responses appear
- [ ] Typing indicator shows during request
- [ ] Errors display user-friendly messages
- [ ] Loading states work correctly
- [ ] Integration test for full flow

**Acceptance Criteria:**
- ✅ Working AI chat
- ✅ Smooth user experience
- ✅ Error handling in place
- ✅ Tests passing

---

### 2.5 Hint Detection System
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 2.4

**Tasks:**
- [ ] Create `src/utils/hintDetection.ts`
- [ ] Implement stuck detection algorithm:
  - Track uncertain responses ("I don't know", "not sure", etc.)
  - Count consecutive stuck turns
  - Determine hint level needed
- [ ] Add hint metadata to conversation context
- [ ] Update system prompt with hint escalation instructions
- [ ] Create hint message component styling

**Testing:**
- [ ] Detects uncertain responses correctly
- [ ] Stuck count increments properly
- [ ] Hint level escalates appropriately
- [ ] LLM responds with hints at right level
- [ ] Write unit tests for detection algorithm

**Acceptance Criteria:**
- ✅ Accurate stuck detection
- ✅ Appropriate hint escalation
- ✅ Clear hint UI differentiation
- ✅ Tests passing

---

### 2.6 Problem Type Detection
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** 2.4

**Tasks:**
- [ ] Create `src/utils/problemTypeDetector.ts`
- [ ] Implement detection for:
  - Linear equations
  - Quadratic equations
  - Word problems
  - Geometry
  - Systems of equations
  - Fractions
- [ ] Add problem type to conversation metadata
- [ ] Use problem type to adapt questioning

**Testing:**
- [ ] Correctly identifies linear equations
- [ ] Correctly identifies word problems
- [ ] Correctly identifies geometry
- [ ] Correctly identifies other types
- [ ] Handles ambiguous problems gracefully
- [ ] Write unit tests for each type

**Acceptance Criteria:**
- ✅ Accurate problem type detection
- ✅ Improves Socratic questioning
- ✅ Tests passing

---

### 2.7 Celebration System
**Priority:** P1 (Important)  
**Estimated Time:** 45 minutes  
**Dependencies:** 2.4

**Tasks:**
- [ ] Create celebration message detection
- [ ] Design celebration UI (gradient background, emoji)
- [ ] Trigger celebration when problem solved
- [ ] Add "Try Another Problem" button
- [ ] Implement conversation reset

**Testing:**
- [ ] Detects problem completion
- [ ] Celebration UI displays correctly
- [ ] "Try Another Problem" resets conversation
- [ ] Visual design matches spec
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ Celebratory feedback on success
- ✅ Clear and encouraging
- ✅ Easy to start new problem
- ✅ Tests passing

---

### 2.8 Day 2 Comprehensive Testing
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 2.7

**Tasks:**
- [ ] Test complete conversations for 5+ problem types:
  - Linear equation: `2x + 5 = 13`
  - Quadratic: `x² + 5x + 6 = 0`
  - Word problem: distance/rate/time
  - Geometry: perimeter problem
  - System of equations
- [ ] Verify Socratic method maintained
- [ ] Verify no direct answers given
- [ ] Verify hint system works
- [ ] Test error scenarios
- [ ] Run all automated tests

**Testing:**
- [ ] All problem types guided successfully
- [ ] No direct answers given
- [ ] Hints appropriate and helpful
- [ ] Error handling robust
- [ ] All unit and integration tests passing

**Acceptance Criteria:**
- ✅ 5+ problem types work correctly
- ✅ Socratic method consistent
- ✅ User experience smooth
- ✅ All tests green

---

## Day 3: Math Rendering + Text Input Processing (8 hours)

### 3.1 KaTeX Integration
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** Day 2 complete

**Tasks:**
- [ ] Create `src/components/MathRenderer/MathInline.tsx`
- [ ] Create `src/components/MathRenderer/MathBlock.tsx`
- [ ] Wrap KaTeX with error handling
- [ ] Test basic math rendering:
  - Inline: `$x^2 + 5$`
  - Block: `$$\frac{a}{b}$$`

**Testing:**
- [ ] Inline math renders correctly
- [ ] Block math renders correctly
- [ ] Error handling catches invalid LaTeX
- [ ] Fallback displays raw text on error
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ Math renders beautifully
- ✅ No rendering errors crash app
- ✅ Tests passing

---

### 3.2 LaTeX Detection & Parsing
**Priority:** P0 (Critical)  
**Estimated Time:** 2 hours  
**Dependencies:** 3.1

**Tasks:**
- [ ] Create `src/utils/mathParser.ts`
- [ ] Implement LaTeX detection:
  - Find `$...$` patterns (inline)
  - Find `$$...$$` patterns (block)
  - Handle escaped dollar signs
  - Split text into parts
- [ ] Create `MathRenderer` component that processes full text
- [ ] Handle edge cases (nested delimiters, malformed LaTeX)

**Testing:**
- [ ] Detects inline math correctly
- [ ] Detects block math correctly
- [ ] Handles mixed text and math
- [ ] Handles malformed input gracefully
- [ ] Performance test with long messages
- [ ] Write comprehensive unit tests

**Acceptance Criteria:**
- ✅ Accurate LaTeX detection
- ✅ Handles complex messages
- ✅ No false positives/negatives
- ✅ Tests passing

---

### 3.3 Update Message Component with Math Rendering
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 3.2

**Tasks:**
- [ ] Integrate MathRenderer into Message component
- [ ] Process all message content for math
- [ ] Test with math-heavy conversations
- [ ] Ensure styling works with rendered math

**Testing:**
- [ ] Math renders in both user and tutor messages
- [ ] Layout doesn't break with math
- [ ] Mobile responsive with math content
- [ ] Integration test with real math problems

**Acceptance Criteria:**
- ✅ Math displays in all messages
- ✅ Beautiful, professional rendering
- ✅ Works on all devices
- ✅ Tests passing

---

### 3.4 Common Math Notation Support
**Priority:** P0 (Critical)  
**Estimated Time:** 2 hours  
**Dependencies:** 3.3

**Tasks:**
- [ ] Test and document supported notation:
  - Fractions: `\frac{a}{b}`
  - Exponents: `x^2`, `x^{10}`
  - Subscripts: `x_1`, `x_{10}`
  - Radicals: `\sqrt{x}`, `\sqrt[3]{x}`
  - Greek letters: `\alpha`, `\beta`, `\theta`
  - Operators: `\cdot`, `\div`, `\times`, `\pm`
  - Equations: `=`, `\neq`, `\approx`
  - Parentheses: `\left( \right)`, `\left[ \right]`
- [ ] Create math notation reference guide
- [ ] Test each notation type
- [ ] Handle common LaTeX macros

**Testing:**
- [ ] Test each notation type individually
- [ ] Test complex expressions combining multiple types
- [ ] Verify visual quality
- [ ] Test on mobile devices
- [ ] Document any unsupported notation

**Acceptance Criteria:**
- ✅ All common K-12 math notation supported
- ✅ Professional rendering quality
- ✅ Reference guide created
- ✅ Tests passing

---

### 3.5 Text Problem Input Enhancement
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** 3.3

**Tasks:**
- [ ] Enhance input area with math input hints
- [ ] Add quick-insert buttons for common symbols (optional)
- [ ] Add example problems to empty state
- [ ] Improve placeholder text
- [ ] Add input validation

**Testing:**
- [ ] User can easily input math notation
- [ ] Example problems copy correctly
- [ ] Input validation works
- [ ] UX is intuitive

**Acceptance Criteria:**
- ✅ Easy to input math problems
- ✅ Clear guidance for users
- ✅ Tests passing

---

### 3.6 Math-Heavy Conversation Testing
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 3.4

**Tasks:**
- [ ] Test conversations with heavy math notation:
  - Quadratic formula derivation
  - Fraction simplification
  - Algebraic expression expansion
  - Geometry formulas (area, volume)
- [ ] Verify all math renders correctly throughout conversation
- [ ] Test LaTeX generation from LLM
- [ ] Fix any rendering issues

**Testing:**
- [ ] All math renders correctly in conversation
- [ ] No layout issues
- [ ] Performance is acceptable
- [ ] Mobile experience is good

**Acceptance Criteria:**
- ✅ Math-heavy conversations work flawlessly
- ✅ Beautiful rendering maintained
- ✅ No performance degradation
- ✅ Tests passing

---

### 3.7 Day 3 Testing & Refinement
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 3.6

**Tasks:**
- [ ] Run all tests (unit, integration)
- [ ] Test on multiple devices
- [ ] Fix any rendering bugs
- [ ] Performance optimization if needed
- [ ] Code review and cleanup

**Testing:**
- [ ] All automated tests passing
- [ ] Manual testing on 3+ devices
- [ ] No visual glitches
- [ ] Performance acceptable

**Acceptance Criteria:**
- ✅ Math rendering production-ready
- ✅ All tests green
- ✅ Ready for image upload feature

---

## Day 4: Image Upload + OCR (8 hours)

### 4.1 Image Upload UI Component
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** Day 3 complete

**Tasks:**
- [ ] Create `src/components/ImageUpload/DropZone.tsx`
- [ ] Integrate react-dropzone
- [ ] Style drag-and-drop area (dashed border, inviting)
- [ ] Add upload button to InputArea
- [ ] Support file picker and drag-and-drop
- [ ] Accept only image types (JPEG, PNG, WebP)

**Testing:**
- [ ] Drag and drop works
- [ ] File picker works
- [ ] Only accepts valid image types
- [ ] Visual feedback on hover/drag
- [ ] Accessible (keyboard + screen reader)
- [ ] Write component tests

**Acceptance Criteria:**
- ✅ Intuitive upload experience
- ✅ Visual feedback clear
- ✅ Works on mobile and desktop
- ✅ Tests passing

---

### 4.2 Image Preview Component
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** 4.1

**Tasks:**
- [ ] Create `src/components/ImageUpload/ImagePreview.tsx`
- [ ] Display uploaded image thumbnail
- [ ] Add remove/replace button
- [ ] Show file name and size
- [ ] Add processing indicator

**Testing:**
- [ ] Preview displays correctly
- [ ] Remove button works
- [ ] Processing state shows correctly
- [ ] Responsive on mobile
- [ ] Write component tests

**Acceptance Criteria:**
- ✅ Clear preview of uploaded image
- ✅ Easy to remove/replace
- ✅ Loading states clear
- ✅ Tests passing

---

### 4.3 Client-Side Image Compression
**Priority:** P1 (Important)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 4.2

**Tasks:**
- [ ] Create `src/utils/imageCompression.ts`
- [ ] Implement image compression:
  - Max dimensions: 1920x1080
  - Target size: <5MB
  - Quality: 0.8
  - Use Canvas API
- [ ] Validate file size before upload
- [ ] Show compression progress (optional)

**Testing:**
- [ ] Large images compressed successfully
- [ ] Quality remains acceptable
- [ ] Target size achieved
- [ ] Various image formats work
- [ ] Write unit tests

**Acceptance Criteria:**
- ✅ Images compressed to <5MB
- ✅ Visual quality maintained
- ✅ Fast compression
- ✅ Tests passing

---

### 4.4 OpenAI Vision API Integration
**Priority:** P0 (Critical)  
**Estimated Time:** 2 hours  
**Dependencies:** 4.3

**Tasks:**
- [ ] Create `src/services/imageService.ts`
- [ ] Implement `extractTextFromImage` function:
  - Convert image to base64
  - Call OpenAI Vision API
  - Parse response
  - Handle errors (poor quality, no text, etc.)
- [ ] Create extraction prompt:
  - "Extract the math problem from this image"
  - "Preserve all mathematical notation"
  - "If unclear, indicate what needs clarification"
- [ ] Test with various image types:
  - Printed text
  - Handwritten (clear)
  - Handwritten (messy)
  - Photographs of textbooks
  - Screenshots

**Testing:**
- [ ] Extracts text from printed images (>95% accuracy)
- [ ] Extracts text from clear handwriting (>85% accuracy)
- [ ] Handles poor quality images gracefully
- [ ] Error messages are helpful
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ Good OCR accuracy for clear images
- ✅ Handles various image types
- ✅ Error handling robust
- ✅ Tests passing

---

### 4.5 Image Upload Flow Integration
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 4.4

**Tasks:**
- [ ] Wire up complete image upload flow:
  1. User uploads image
  2. Client-side compression
  3. Show preview
  4. Send to Vision API
  5. Show processing indicator
  6. Display extracted text for user confirmation
  7. User confirms or edits text
  8. Start conversation with extracted problem
- [ ] Add state management for image upload
- [ ] Handle errors at each step

**Testing:**
- [ ] Complete flow works end-to-end
- [ ] User can confirm extracted text
- [ ] User can edit if needed
- [ ] Errors handled gracefully
- [ ] Integration test for full flow

**Acceptance Criteria:**
- ✅ Smooth upload experience
- ✅ Clear feedback at all stages
- ✅ User maintains control
- ✅ Tests passing

---

### 4.6 Image Upload Error Handling
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 4.5

**Tasks:**
- [ ] Implement comprehensive error handling:
  - File too large
  - Invalid file type
  - Network error during upload
  - Vision API error
  - Poor extraction quality
  - No text detected
- [ ] Create user-friendly error messages
- [ ] Provide recovery options (retry, manual entry)

**Testing:**
- [ ] Test each error scenario
- [ ] Verify error messages are helpful
- [ ] Verify recovery options work
- [ ] No crashes on errors
- [ ] Write tests for error cases

**Acceptance Criteria:**
- ✅ All errors handled gracefully
- ✅ User always has path forward
- ✅ Clear error messages
- ✅ Tests passing

---

### 4.7 Day 4 Comprehensive Testing
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 4.6

**Tasks:**
- [ ] Test image upload with 10+ different images
- [ ] Test on mobile devices (camera upload)
- [ ] Test error scenarios
- [ ] Verify complete flow from image to conversation
- [ ] Run all automated tests
- [ ] Performance testing

**Testing:**
- [ ] Various image types work
- [ ] Mobile camera upload works
- [ ] Performance is acceptable
- [ ] All tests passing
- [ ] No memory leaks

**Acceptance Criteria:**
- ✅ Image upload production-ready
- ✅ Works on all devices
- ✅ All tests green
- ✅ Ready for polish phase

---

## Day 5: UI Polish + Comprehensive Testing (8 hours)

### 5.1 Tailwind Styling Polish
**Priority:** P1 (Important)  
**Estimated Time:** 2 hours  
**Dependencies:** Day 4 complete

**Tasks:**
- [ ] Apply design system consistently:
  - Color palette (soft indigo, warm grays)
  - Typography scale
  - Spacing system
  - Border radius (rounded-2xl)
- [ ] Polish all components:
  - Header
  - Messages
  - Input area
  - Buttons
  - Empty state
  - Loading states
- [ ] Add micro-interactions:
  - Button hover effects (2px lift)
  - Input focus rings
  - Message appearance animations
  - Smooth transitions (200-300ms)
- [ ] Ensure design consistency

**Testing:**
- [ ] Visual review on multiple devices
- [ ] All animations smooth
- [ ] Design system consistently applied
- [ ] Cross-browser testing

**Acceptance Criteria:**
- ✅ Beautiful, polished UI
- ✅ Consistent design language
- ✅ Delightful micro-interactions
- ✅ Professional appearance

---

### 5.2 Responsive Design Refinement
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 5.1

**Tasks:**
- [ ] Test on multiple screen sizes:
  - Mobile (320px - 640px)
  - Tablet (640px - 1024px)
  - Desktop (1024px+)
- [ ] Adjust layouts for optimal experience:
  - Reduce padding on mobile
  - Adjust font sizes
  - Optimize touch targets (44x44px minimum)
  - Adjust message widths
- [ ] Test landscape orientation on mobile
- [ ] Test on real devices

**Testing:**
- [ ] Works on iPhone/Android phones
- [ ] Works on tablets
- [ ] Works on desktop browsers
- [ ] Touch interactions smooth
- [ ] No horizontal scrolling

**Acceptance Criteria:**
- ✅ Perfect responsive experience
- ✅ Works on all device sizes
- ✅ Touch-friendly on mobile
- ✅ No layout issues

---

### 5.3 Accessibility Improvements
**Priority:** P0 (Critical)  
**Estimated Time:** 1.5 hours  
**Dependencies:** 5.1

**Tasks:**
- [ ] Add proper ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works:
  - Tab through all controls
  - Enter/Space activate buttons
  - Escape closes modals/dropdowns
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Check color contrast ratios (WCAG AA: 4.5:1)
- [ ] Add focus indicators
- [ ] Add skip to main content link
- [ ] Test with keyboard only (no mouse)

**Testing:**
- [ ] Lighthouse accessibility audit (>90)
- [ ] Screen reader testing
- [ ] Keyboard-only navigation testing
- [ ] Color contrast testing
- [ ] axe DevTools audit

**Acceptance Criteria:**
- ✅ WCAG AA compliant
- ✅ Keyboard navigation works perfectly
- ✅ Screen reader compatible
- ✅ Accessible to all users

---

### 5.4 Loading States & Error Messages
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 5.2

**Tasks:**
- [ ] Review all loading states:
  - Typing indicator
  - Image processing
  - API calls
  - Page load
- [ ] Review all error messages:
  - API errors
  - Upload errors
  - Network errors
  - Validation errors
- [ ] Ensure all loading states have spinners/indicators
- [ ] Ensure all errors have helpful messages
- [ ] Add retry buttons where appropriate

**Testing:**
- [ ] Simulate slow network
- [ ] Trigger all error scenarios
- [ ] Verify loading indicators appear
- [ ] Verify error messages are helpful
- [ ] Test recovery flows

**Acceptance Criteria:**
- ✅ Clear feedback at all times
- ✅ Helpful error messages
- ✅ No confusion about app state
- ✅ Users know what to do next

---

### 5.5 Problem Type Testing - Linear Equations
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 5.4

**Tasks:**
- [ ] Test 5+ linear equation problems:
  - `2x + 5 = 13`
  - `3x - 7 = 11`
  - `5(x + 2) = 25`
  - `-2x + 8 = 4`
  - `x/3 + 2 = 5`
- [ ] Verify Socratic guidance quality
- [ ] Verify no direct answers
- [ ] Verify hint system works
- [ ] Document any issues

**Testing:**
- [ ] All problems guided successfully
- [ ] Conversation quality high
- [ ] Hints appropriate
- [ ] Students can reach solution

**Acceptance Criteria:**
- ✅ Linear equations work perfectly
- ✅ Socratic method maintained
- ✅ User experience positive

---

### 5.6 Problem Type Testing - Quadratic Equations
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 5.5

**Tasks:**
- [ ] Test 3+ quadratic problems:
  - `x² + 5x + 6 = 0` (factoring)
  - `x² - 4 = 0` (difference of squares)
  - `2x² + 7x + 3 = 0` (quadratic formula)
- [ ] Verify factoring guidance
- [ ] Verify formula application guidance
- [ ] Document any issues

**Testing:**
- [ ] Factoring guidance clear
- [ ] Quadratic formula explained well
- [ ] Math rendering perfect
- [ ] Hints helpful

**Acceptance Criteria:**
- ✅ Quadratic equations work well
- ✅ Multiple methods supported
- ✅ Complex notation renders correctly

---

### 5.7 Problem Type Testing - Word Problems
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 5.6

**Tasks:**
- [ ] Test 3+ word problems:
  - Distance/rate/time problem
  - Age problem
  - Cost/price problem
- [ ] Verify problem comprehension guidance
- [ ] Verify variable definition guidance
- [ ] Verify equation setup guidance

**Testing:**
- [ ] Helps extract information
- [ ] Guides variable definition
- [ ] Guides equation formulation
- [ ] Problem-solving logical

**Acceptance Criteria:**
- ✅ Word problems guided effectively
- ✅ Comprehension focus first
- ✅ Logical progression

---

### 5.8 Problem Type Testing - Geometry
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 5.7

**Tasks:**
- [ ] Test 3+ geometry problems:
  - Rectangle perimeter/area
  - Triangle area
  - Circle circumference/area
- [ ] Verify formula guidance
- [ ] Verify diagram interpretation (if uploaded)
- [ ] Test formula rendering

**Testing:**
- [ ] Guides formula selection
- [ ] Explains formula components
- [ ] Math notation clear
- [ ] Visual problems work

**Acceptance Criteria:**
- ✅ Geometry problems work well
- ✅ Formulas render beautifully
- ✅ Conceptual understanding emphasized

---

### 5.9 Problem Type Testing - Systems & Fractions
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 5.8

**Tasks:**
- [ ] Test 2 systems of equations:
  - Substitution method
  - Elimination method
- [ ] Test 2 fraction problems:
  - Addition/subtraction
  - Multiplication/division
- [ ] Verify method selection guidance
- [ ] Verify step-by-step guidance

**Testing:**
- [ ] Multiple methods explained
- [ ] Step-by-step clear
- [ ] Fraction rendering correct
- [ ] Complex expressions handled

**Acceptance Criteria:**
- ✅ Systems of equations work
- ✅ Fraction operations clear
- ✅ All problem types covered

---

### 5.10 End-to-End Testing & Bug Fixes
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 5.9

**Tasks:**
- [ ] Complete end-to-end user journeys:
  - New user arrives → solves problem → celebrates
  - Upload image → extract → conversation → solution
  - Get stuck → receive hints → continue → solve
  - Make mistakes → get redirected → solve correctly
- [ ] Document all bugs found
- [ ] Fix critical bugs
- [ ] Retest after fixes
- [ ] Run full test suite

**Testing:**
- [ ] All user journeys smooth
- [ ] No critical bugs
- [ ] All automated tests passing
- [ ] Performance acceptable

**Acceptance Criteria:**
- ✅ Complete user journeys work flawlessly
- ✅ No critical bugs
- ✅ All tests green
- ✅ Production-ready

---

## Day 6: User Authentication (4-6 hours)

### 6.1 Firebase Authentication Setup
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** Day 5 complete

**Tasks:**
- [ ] Enable Firebase Authentication in Firebase Console
- [ ] Enable authentication providers:
  - Email/Password
  - Google Sign-In
  - (Optional) GitHub, Apple
- [ ] Configure OAuth consent screen
- [ ] Test authentication in Firebase Console

**Testing:**
- [ ] Authentication enabled successfully
- [ ] Providers configured correctly
- [ ] No configuration errors

**Acceptance Criteria:**
- ✅ Firebase Auth enabled
- ✅ Multiple sign-in methods available
- ✅ Ready for integration

---

### 6.2 Authentication Service Layer
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 6.1

**Tasks:**
- [ ] Create `src/services/authService.ts`
- [ ] Implement authentication functions:
  - `signUpWithEmail(email, password)`
  - `signInWithEmail(email, password)`
  - `signInWithGoogle()`
  - `signOut()`
  - `resetPassword(email)`
  - `getCurrentUser()`
  - `onAuthStateChanged(callback)`
- [ ] Add error handling for:
  - Invalid credentials
  - Email already in use
  - Weak password
  - Network errors
- [ ] Add user profile creation in Firestore on sign-up

**Testing:**
- [ ] Sign up creates new user
- [ ] Sign in authenticates existing user
- [ ] Google sign-in works
- [ ] Sign out clears session
- [ ] Password reset sends email
- [ ] Error handling works for each scenario
- [ ] Write unit tests for auth service

**Acceptance Criteria:**
- ✅ Complete auth service
- ✅ All methods working
- ✅ Robust error handling
- ✅ Tests passing

---

### 6.3 Authentication Context & Hook
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 6.2

**Tasks:**
- [ ] Create `src/contexts/AuthContext.tsx`
- [ ] Implement authentication state:
  - `user` - current user object
  - `loading` - auth initialization loading
  - `error` - auth errors
- [ ] Create `src/hooks/useAuth.ts` custom hook
- [ ] Implement `onAuthStateChanged` listener
- [ ] Persist auth state across page reloads
- [ ] Create `src/types/user.ts` interface:
  ```typescript
  interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date;
  }
  ```

**Testing:**
- [ ] Auth state updates on login/logout
- [ ] Auth state persists on reload
- [ ] Loading states handled correctly
- [ ] Context accessible from components
- [ ] Write unit tests for context

**Acceptance Criteria:**
- ✅ Centralized auth state
- ✅ Easy to use from components
- ✅ Persistent sessions
- ✅ Tests passing

---

### 6.4 Sign Up / Sign In UI Components
**Priority:** P0 (Critical)  
**Estimated Time:** 2 hours  
**Dependencies:** 6.3

**Tasks:**
- [ ] Create `src/components/Auth/AuthModal.tsx`
- [ ] Create `src/components/Auth/SignUpForm.tsx`
- [ ] Create `src/components/Auth/SignInForm.tsx`
- [ ] Create `src/components/Auth/PasswordResetForm.tsx`
- [ ] Implement form validation:
  - Email format validation
  - Password strength (min 8 chars)
  - Confirm password matching
- [ ] Add social sign-in buttons (Google)
- [ ] Style with Tailwind (matches app design)
- [ ] Add loading states during auth operations
- [ ] Display auth errors to users

**Testing:**
- [ ] Forms render correctly
- [ ] Validation works before submission
- [ ] Email/password sign-up works
- [ ] Email/password sign-in works
- [ ] Google sign-in works
- [ ] Error messages display
- [ ] Loading states show correctly
- [ ] Responsive on mobile
- [ ] Write component tests

**Acceptance Criteria:**
- ✅ Beautiful auth UI
- ✅ All sign-in methods work
- ✅ Form validation robust
- ✅ User-friendly error messages
- ✅ Tests passing

---

### 6.5 Protected Routes & Navigation
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 6.4

**Tasks:**
- [ ] Update Header component with auth state:
  - Show "Sign In" button when logged out
  - Show user avatar/name when logged in
  - Add dropdown menu (Profile, Sign Out)
- [ ] Create `src/components/Auth/ProtectedRoute.tsx` (optional)
- [ ] Implement auth gating:
  - Anonymous users can use app (for now)
  - Show "Sign in to save history" prompt
  - Logged-in users auto-save conversations
- [ ] Add user profile dropdown menu
- [ ] Handle sign-out flow

**Testing:**
- [ ] Header updates on auth state change
- [ ] Sign-in modal opens from header
- [ ] User menu displays correctly
- [ ] Sign-out works
- [ ] Anonymous usage still works
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ Seamless auth integration
- ✅ Clear visual feedback
- ✅ Anonymous users not blocked
- ✅ Tests passing

---

### 6.6 User Profile in Firestore
**Priority:** P1 (Important)  
**Estimated Time:** 45 minutes  
**Dependencies:** 6.2

**Tasks:**
- [ ] Create `users` collection in Firestore
- [ ] Create user profile document on sign-up:
  ```typescript
  users/{userId}/
    - uid: string
    - email: string
    - displayName: string
    - photoURL: string
    - createdAt: Timestamp
    - lastLoginAt: Timestamp
    - conversationCount: number
    - problemsSolved: number
  ```
- [ ] Update profile on sign-in (lastLoginAt)
- [ ] Create `src/services/userService.ts`
- [ ] Implement profile CRUD operations

**Testing:**
- [ ] Profile created on sign-up
- [ ] Profile updated on sign-in
- [ ] Can read user profile
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ User profiles stored
- ✅ Profile data accurate
- ✅ Tests passing

---

### 6.7 Associate Conversations with Users
**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** 6.6

**Tasks:**
- [ ] Update conversation schema to include `userId`:
  ```typescript
  conversations/{conversationId}/
    - userId: string | null  // null for anonymous
    - createdAt: Timestamp
    - ...existing fields
  ```
- [ ] Update conversation save logic:
  - If logged in: save with userId
  - If anonymous: save with userId = null
- [ ] Add query to fetch user's conversations
- [ ] Update Firestore indexes for userId queries

**Testing:**
- [ ] Logged-in user conversations have userId
- [ ] Anonymous conversations have null userId
- [ ] Can query user's conversations
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ Conversations linked to users
- ✅ Anonymous usage still works
- ✅ Can retrieve user history
- ✅ Tests passing

---

### 6.8 Firestore Security Rules (Authentication)
**Priority:** P0 (Critical)  
**Estimated Time:** 45 minutes  
**Dependencies:** 6.7

**Tasks:**
- [ ] Update Firestore security rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // User profiles
      match /users/{userId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Conversations
      match /conversations/{conversationId} {
        // Anyone can read/write their own conversations
        allow read, write: if request.auth != null 
                             && resource.data.userId == request.auth.uid;
        
        // Anonymous users can write (for MVP - tighten later)
        allow write: if request.auth == null 
                     && request.resource.data.userId == null;
        
        // Messages subcollection
        match /messages/{messageId} {
          allow read, write: if get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId == request.auth.uid
                             || get(/databases/$(database)/documents/conversations/$(conversationId)).data.userId == null;
        }
      }
    }
  }
  ```
- [ ] Deploy security rules
- [ ] Test rules with authenticated user
- [ ] Test rules with anonymous user

**Testing:**
- [ ] Authenticated users can access their data
- [ ] Users cannot access others' data
- [ ] Anonymous users can still use app
- [ ] Security rules enforce correctly
- [ ] Write security rule tests (Firebase emulator)

**Acceptance Criteria:**
- ✅ Data properly secured
- ✅ Users isolated from each other
- ✅ Anonymous access still works
- ✅ Rules tested and deployed

---

### 6.9 Conversation History UI (Future Feature Prep)
**Priority:** P2 (Nice to have)  
**Estimated Time:** 30 minutes  
**Dependencies:** 6.7

**Tasks:**
- [ ] Create `src/components/History/ConversationHistory.tsx`
- [ ] Add "History" button to header (for logged-in users)
- [ ] Display list of past conversations:
  - Problem preview
  - Date/time
  - Status (completed/abandoned)
  - Click to view (future feature)
- [ ] Style with Tailwind

**Testing:**
- [ ] History displays user's conversations
- [ ] List updates on new conversation
- [ ] Responsive design
- [ ] Write component tests

**Acceptance Criteria:**
- ✅ Basic history view working
- ✅ Shows user's conversations
- ✅ Prepared for future enhancement
- ✅ Tests passing

---

### 6.10 Day 6 Testing & Polish
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 6.9

**Tasks:**
- [ ] Complete authentication flow testing:
  - Sign up → use app → conversations saved
  - Sign in → see conversation history
  - Sign out → clear session
  - Anonymous use → no history
  - Google sign-in → seamless integration
- [ ] Test security rules thoroughly
- [ ] Test on multiple devices
- [ ] Fix any auth-related bugs
- [ ] Run all automated tests

**Testing:**
- [ ] All auth flows work end-to-end
- [ ] Security properly enforced
- [ ] No auth bugs
- [ ] All tests passing

**Acceptance Criteria:**
- ✅ Authentication production-ready
- ✅ Secure and reliable
- ✅ Smooth user experience
- ✅ All tests green

---

## Day 7: Firebase Persistence + Deployment (4-6 hours)

### 7.1 Firestore Schema Implementation
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** Day 6 complete (Authentication)

**Tasks:**
- [ ] Create `src/services/firestoreService.ts`
- [ ] Implement conversation save function:
  - Generate conversation ID
  - Save conversation metadata
  - Save messages in subcollection
- [ ] Implement conversation load function
- [ ] Implement conversation list function (for future)
- [ ] Test Firestore operations

**Testing:**
- [ ] Can save conversations
- [ ] Can load conversations
- [ ] Data structure matches schema
- [ ] No data loss
- [ ] Write integration tests

**Acceptance Criteria:**
- ✅ Conversations persist to Firestore
- ✅ Data structure clean
- ✅ Tests passing

---

### 7.2 Integrate Persistence with Conversation Flow
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** 7.1

**Tasks:**
- [ ] Auto-save conversation on each message
- [ ] Save conversation metadata (problem text, timestamp, status)
- [ ] Handle save errors gracefully
- [ ] Add offline detection (optional)
- [ ] Test save reliability

**Testing:**
- [ ] Conversations save automatically
- [ ] Can survive page refresh (future feature)
- [ ] Error handling works
- [ ] No performance impact

**Acceptance Criteria:**
- ✅ Automatic persistence
- ✅ Reliable saves
- ✅ No UX interruption

---

### 7.3 Production Build Configuration
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 7.2

**Tasks:**
- [ ] Create production environment variables
- [ ] Update `vite.config.ts` for optimization
- [ ] Configure build output
- [ ] Test production build locally
- [ ] Verify bundle size (<500KB target)

**Testing:**
- [ ] Production build succeeds
- [ ] No build errors or warnings
- [ ] Bundle size acceptable
- [ ] App works in production mode

**Acceptance Criteria:**
- ✅ Production build optimized
- ✅ Bundle size reasonable
- ✅ Works in production mode

---

### 7.4 Firebase Hosting Setup
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 7.3

**Tasks:**
- [ ] Initialize Firebase Hosting: `firebase init hosting`
- [ ] Configure `firebase.json`:
  - Set public directory to `dist`
  - Configure SPA rewrites
  - Set cache headers
- [ ] Test deployment to Firebase preview
- [ ] Verify all routes work

**Testing:**
- [ ] Preview deployment works
- [ ] All routes accessible
- [ ] Static assets load
- [ ] API calls work in production

**Acceptance Criteria:**
- ✅ Firebase Hosting configured
- ✅ Preview deployment successful
- ✅ App fully functional

---

### 7.5 Production Deployment
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 7.4

**Tasks:**
- [ ] Deploy to production: `firebase deploy`
- [ ] Verify production URL works
- [ ] Test on production domain
- [ ] Set up custom domain (optional)
- [ ] Configure SSL (automatic with Firebase)

**Testing:**
- [ ] Production site loads
- [ ] All features work in production
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Performance acceptable

**Acceptance Criteria:**
- ✅ App live on public URL
- ✅ HTTPS enabled
- ✅ All features working
- ✅ Production-ready

---

### 7.6 Documentation
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** 7.5

**Tasks:**
- [ ] Create comprehensive README.md:
  - Project description
  - Features list
  - Tech stack
  - Setup instructions
  - Environment variables
  - Deployment instructions
- [ ] Create CONTRIBUTING.md (if open source)
- [ ] Document API key setup
- [ ] Document known limitations
- [ ] Create troubleshooting guide

**Testing:**
- [ ] Follow README to set up project fresh
- [ ] Verify all instructions work
- [ ] Check for missing steps

**Acceptance Criteria:**
- ✅ Complete documentation
- ✅ Easy for others to set up
- ✅ All instructions accurate

---

### 7.7 Demo & Showcase Preparation
**Priority:** P2 (Nice to have)  
**Estimated Time:** 30 minutes  
**Dependencies:** 7.6

**Tasks:**
- [ ] Record demo video (optional):
  - Show problem input (text and image)
  - Show Socratic dialogue
  - Show hint system
  - Show celebration
  - Show multiple problem types
- [ ] Create screenshots for README
- [ ] Prepare demo problems
- [ ] Test demo flow

**Acceptance Criteria:**
- ✅ Demo materials ready
- ✅ Easy to showcase project
- ✅ Highlights key features

---

### 7.8 Final Testing & Launch Checklist
**Priority:** P0 (Critical)  
**Estimated Time:** 30 minutes  
**Dependencies:** 7.7

**Tasks:**
- [ ] Complete pre-launch checklist:
  - [ ] All core features work
  - [ ] 5+ problem types tested
  - [ ] Mobile responsive
  - [ ] Error handling complete
  - [ ] Loading states implemented
  - [ ] Accessibility tested
  - [ ] Documentation complete
  - [ ] Environment variables secured
  - [ ] Production build tested
  - [ ] Firebase deployed
  - [ ] SSL enabled
  - [ ] Performance acceptable
- [ ] Final smoke test in production
- [ ] Announce launch 🎉

**Testing:**
- [ ] Complete final user journey
- [ ] Test on 3+ devices
- [ ] Test on 3+ browsers
- [ ] No critical issues

**Acceptance Criteria:**
- ✅ All checklist items complete
- ✅ Production site fully functional
- ✅ Ready for users
- ✅ MVP COMPLETE! 🚀

---

## Day 8+: Stretch Features (Optional)

### 8.1 Interactive Whiteboard (Optional)
**Priority:** P2  
**Estimated Time:** 8-16 hours  
**Dependencies:** MVP complete

**Tasks:**
- [ ] Research canvas libraries (fabric.js, konva)
- [ ] Implement drawing canvas
- [ ] Add drawing tools (pen, shapes, text)
- [ ] Add annotation capabilities
- [ ] Enable drawing over uploaded images
- [ ] Implement save/export
- [ ] Test on touch devices

**Testing:**
- [ ] Drawing smooth on all devices
- [ ] Tools work correctly
- [ ] Save/export functional
- [ ] Performance acceptable

**Acceptance Criteria:**
- ✅ Working whiteboard
- ✅ Enhances learning experience
- ✅ Tests passing

---

## Phase 2: Whiteboard Evaluation Integration

### P2.1 Add Evaluate Button to Whiteboard
**Priority:** P1 (Important)  
**Estimated Time:** 30 minutes  
**Dependencies:** Whiteboard component exists

**Tasks:**
- [x] Add "Evaluate" button to whiteboard toolbar (left of Undo button)
- [x] Use CheckCircle icon from Lucide React
- [x] Style consistent with existing toolbar buttons
- [x] Add loading state with spinner
- [x] Position button in actions section

**Testing:**
- [x] Button renders correctly
- [x] Button positioned correctly
- [x] Loading state displays during processing
- [x] Styling matches existing buttons

**Acceptance Criteria:**
- ✅ Evaluate button visible in toolbar
- ✅ Button positioned left of Undo button
- ✅ Loading spinner shows during evaluation
- ✅ Button disabled when canvas is empty

---

### P2.2 Canvas Capture Functionality
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** P2.1

**Tasks:**
- [x] Create `captureCanvasImage()` function
- [x] Combine grid background and drawing foreground layers
- [x] Create temporary canvas to merge layers
- [x] Convert to base64 data URL
- [x] Handle empty canvas detection
- [x] Add error handling for capture failures

**Testing:**
- [x] Canvas capture combines both layers correctly
- [x] Empty canvas detection works
- [x] Error handling for capture failures
- [x] Image quality is acceptable

**Acceptance Criteria:**
- ✅ Canvas image captures both layers
- ✅ Image format is base64 data URL
- ✅ Empty canvas is detected
- ✅ Error handling robust

---

### P2.3 Integration with Conversation Flow
**Priority:** P1 (Important)  
**Estimated Time:** 1.5 hours  
**Dependencies:** P2.2

**Tasks:**
- [x] Create `onEvaluate` callback prop in Whiteboard component
- [x] Create `handleWhiteboardEvaluate` in App.tsx
- [x] Integrate with existing `handleSendMessage` flow
- [x] Add context message for whiteboard evaluation
- [x] Reuse existing image processing logic
- [x] Pass image data to conversation flow

**Testing:**
- [x] Evaluate button triggers callback
- [x] Image sent to Vision API correctly
- [x] Message appears in conversation
- [x] AI receives and processes drawing

**Acceptance Criteria:**
- ✅ Evaluation integrates with conversation
- ✅ Image sent to Vision API
- ✅ User message appears in chat
- ✅ AI provides feedback on drawing

---

### P2.4 API Enhancement for Whiteboard Evaluation
**Priority:** P1 (Important)  
**Estimated Time:** 30 minutes  
**Dependencies:** P2.3

**Tasks:**
- [x] Update `extractTextFromImage` to accept evaluation mode
- [x] Update API endpoint to handle evaluation mode
- [x] Create enhanced prompt for whiteboard analysis
- [x] Increase max_tokens for evaluation responses
- [x] Update frontend to pass evaluation flag

**Testing:**
- [x] Evaluation mode triggers different prompt
- [x] API returns detailed analysis
- [x] Prompt tailored for whiteboard drawings
- [x] Token limit appropriate for evaluation

**Acceptance Criteria:**
- ✅ API handles evaluation mode
- ✅ Enhanced prompt for whiteboard analysis
- ✅ Detailed feedback provided
- ✅ Works with existing image extraction

---

### P2.5 Error Handling & UX Polish
**Priority:** P1 (Important)  
**Estimated Time:** 30 minutes  
**Dependencies:** P2.3

**Tasks:**
- [x] Disable Evaluate button when canvas is empty
- [x] Show loading spinner during evaluation
- [x] Handle API errors gracefully
- [x] Add user-friendly error messages
- [x] Prevent multiple simultaneous evaluations

**Testing:**
- [x] Empty canvas disables button
- [x] Loading states work correctly
- [x] Error messages are helpful
- [x] No duplicate evaluations

**Acceptance Criteria:**
- ✅ Button disabled when appropriate
- ✅ Clear loading feedback
- ✅ Helpful error messages
- ✅ No duplicate API calls

---

### P2.6 Documentation Updates
**Priority:** P1 (Important)  
**Estimated Time:** 1 hour  
**Dependencies:** P2.5 complete

**Tasks:**
- [x] Update PRD with Phase 2 whiteboard evaluation
- [x] Add Phase 2 tasks to tasks.md
- [x] Update progress.md with Phase 2 status
- [x] Update activeContext.md with Phase 2 work
- [x] Document whiteboard evaluation pattern in systemPatterns.md

**Testing:**
- [x] Documentation is accurate
- [x] All features documented
- [x] Memory bank updated

**Acceptance Criteria:**
- ✅ PRD updated with Phase 2
- ✅ Tasks.md includes Phase 2 tasks
- ✅ Memory bank reflects current state
- ✅ Documentation complete

---

## Phase 2 Summary

**Status:** ✅ Complete  
**Total Time:** ~5 hours  
**Features Added:**
- Evaluate button in whiteboard toolbar
- Canvas capture (combines grid + drawing)
- Integration with conversation flow
- Enhanced API prompts for whiteboard analysis
- Error handling and UX polish

**Testing Status:**
- ✅ Manual testing complete
- ✅ Integration tested
- ✅ Error scenarios handled

**Next Steps:**
- User testing and feedback
- Potential enhancements based on usage

---

### 8.2 Step Visualization (Optional)
**Priority:** P2  
**Estimated Time:** 4-8 hours  
**Dependencies:** MVP complete

**Tasks:**
- [ ] Design step-by-step UI
- [ ] Implement progressive reveal
- [ ] Add rewind/forward controls
- [ ] Highlight active step
- [ ] Animate transitions

**Testing:**
- [ ] Animations smooth
- [ ] Controls intuitive
- [ ] Enhances understanding

**Acceptance Criteria:**
- ✅ Clear step visualization
- ✅ Easy to navigate
- ✅ Tests passing

---

### 8.3 Voice Interface (Optional)
**Priority:** P2  
**Estimated Time:** 8-12 hours  
**Dependencies:** MVP complete

**Tasks:**
- [ ] Integrate Web Speech API or external service
- [ ] Implement text-to-speech for responses
- [ ] Implement speech-to-text for input
- [ ] Add voice activity detection
- [ ] Add toggle between modes

**Testing:**
- [ ] Voice recognition accurate
- [ ] Speech synthesis clear
- [ ] Mode switching works
- [ ] Accessibility maintained

**Acceptance Criteria:**
- ✅ Functional voice interface
- ✅ Accurate recognition
- ✅ Tests passing

---

## Testing Summary

### Test Coverage by Category

**Unit Tests:**
- Utility functions (math parsing, validation, hint detection)
- Service functions (API calls, error handling)
- Custom hooks
- Type guards and validators

**Component Tests:**
- All React components render without errors
- User interactions work correctly
- Props handled properly
- Edge cases covered

**Integration Tests:**
- Complete conversation flow
- Image upload → OCR → conversation
- Math rendering pipeline
- Error recovery flows
- Hint escalation system

**E2E Tests (Future):**
- Complete user journeys
- Cross-browser testing
- Performance testing
- Accessibility testing

### Test Quality Standards

- **Coverage Target:** 70% for core logic, 50% for UI components
- **Test Types:** Unit, component, integration
- **Naming:** `describe('ComponentName')` and `it('should do something')`
- **Assertions:** Clear, specific, meaningful
- **Mocking:** Mock external APIs, use real logic
- **Performance:** Tests should run quickly (<5s for full suite)

### Testing Tools

- **Framework:** Vitest
- **React Testing:** React Testing Library
- **Assertions:** Vitest assertions + Testing Library queries
- **Mocking:** Vitest mocks
- **Coverage:** Vitest coverage (c8)
- **E2E (Future):** Playwright

---

## Risk Mitigation

### High-Risk Areas

1. **LLM Behavior:**
   - Risk: Gives direct answers
   - Mitigation: Extensive prompt testing, iterative refinement
   - Testing: Manual testing with 20+ problems

2. **OCR Accuracy:**
   - Risk: Poor text extraction
   - Mitigation: User confirmation step, manual entry fallback
   - Testing: Test with 20+ varied images

3. **Math Rendering:**
   - Risk: LaTeX rendering failures
   - Mitigation: Comprehensive error handling, fallback display
   - Testing: Test all common notation types

4. **User Frustration:**
   - Risk: Students want answers, not guidance
   - Mitigation: Clear messaging, celebration system, strategic hints
   - Testing: User testing with real students

5. **API Costs:**
   - Risk: Usage exceeds budget
   - Mitigation: Monitor usage, implement rate limiting
   - Testing: Calculate token usage per conversation

---

## Definition of Done

### For Each Task:
- [ ] Code written and working
- [ ] Tests written and passing
- [ ] Code reviewed (self-review minimum)
- [ ] Documentation updated
- [ ] No linter errors
- [ ] Acceptance criteria met

### For Each Day:
- [ ] All tasks complete
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] No critical bugs
- [ ] Ready for next day's work

### For MVP:
- [ ] All core features complete (Days 0-6)
- [ ] 5+ problem types work correctly
- [ ] Tests passing (70%+ coverage on core logic)
- [ ] Deployed to production
- [ ] Documentation complete
- [ ] Demo materials ready
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Accessible (WCAG AA)
- [ ] Mobile responsive

---

## Notes

**Tech Stack Clarification:**
- Using **OpenAI API** (GPT-4 + Vision) instead of Claude as originally specified in PRD
- This aligns with user requirements

**Build Order Rationale:**
- UI first provides visual feedback and validates patterns early
- LLM + Socratic logic are tightly coupled, better built together
- Math rendering needed before extensive problem testing
- Image upload deferred slightly as text input covers most use cases
- Persistence separated as it's not critical for initial testing

**Timeline Flexibility:**
- Timeline is aggressive but achievable
- Some tasks may take longer/shorter than estimated
- Prioritize core features over polish if needed
- Stretch features are truly optional

**Testing Philosophy:**
- Test-driven where practical
- Focus on core logic and critical paths
- Integration tests for user flows
- Manual testing for UX and Socratic quality

---

**Ready for Review!** Please provide feedback on:
1. Task breakdown - too detailed or not enough?
2. Build order - does the adjusted sequence make sense?
3. Testing requirements - appropriate level?
4. Timeline estimates - realistic?
5. Any tasks missing or unnecessary?

