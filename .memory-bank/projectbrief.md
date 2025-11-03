# Project Brief: AI Math Tutor - Socratic Learning Assistant

## Project Overview

**Name:** AI Math Tutor - Socratic Learning Assistant  
**Version:** 1.0  
**Start Date:** November 3, 2025  
**Timeline:** 5-7 days (MVP + potential stretch features)

## Vision

Create an AI-powered math tutor that empowers students to discover solutions independently through Socratic questioning, inspired by the OpenAI x Khan Academy demo. The system will **never provide direct answers**, instead guiding students through reasoning and problem-solving processes.

## Core Objectives

1. **Socratic Method First**: Never give direct answers; guide through structured questioning
2. **Problem Input Flexibility**: Accept both text and image inputs (handwritten/printed)
3. **Beautiful Math Rendering**: Professional display of mathematical notation
4. **Accessible Learning**: Simple, inviting interface that reduces math anxiety
5. **Context Maintenance**: Remember conversation flow across multiple turns

## Problem Statement

Students often struggle with math homework and seek quick answers rather than understanding. Traditional tutoring is expensive and not always available. Existing AI math tools frequently provide direct solutions, undermining the learning process.

**Our Solution:** An AI tutor that uses the Socratic method to develop critical thinking skills, helping students learn **how to solve** problems rather than just obtaining answers.

## Success Metrics

- Successfully guides students through 5+ distinct math problem types
- Maintains conversation context across multi-turn dialogues (5+ turns)
- Adapts questioning complexity to student understanding level
- Students reach correct solutions with minimal direct hints
- 90%+ of users successfully complete at least one problem
- Average session duration >5 minutes (indicates engagement)
- Positive user feedback on learning experience

## Technical Stack (Revised)

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Math Rendering:** KaTeX
- **State Management:** React Context API + hooks
- **Image Upload:** react-dropzone

### Backend/Services
- **Database:** Firebase Firestore
- **Hosting:** Firebase Hosting
- **LLM Provider:** OpenAI API (GPT-4 or GPT-4 Turbo)
- **Image Processing:** OpenAI Vision API

### Development Tools
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Testing:** Vitest + React Testing Library

## Core Features (MVP)

1. **Problem Input System** - Text and image upload with OCR
2. **Socratic Dialogue Engine** - Guided questioning without direct answers
3. **Math Rendering** - KaTeX for beautiful equation display
4. **Web Interface** - Clean, distraction-free chat interface
5. **User Authentication** - Firebase Auth with email/password and Google sign-in ✨ **Phase 1**
6. **Conversation Persistence** - Store conversations in Firestore with user association

## Stretch Features

1. Interactive Whiteboard
2. Step Visualization
3. Voice Interface
4. Animated Avatar
5. Difficulty Modes
6. Problem Generation

## Budget & Cost

- **Firebase:** Free tier should cover MVP
- **OpenAI API:** ~$30-50/month for moderate usage (100 conversations/day)
- **Total MVP Cost:** ~$30-50/month

## Key Constraints

1. **No Direct Answers:** The AI must never solve problems directly
2. **Mobile-First:** Must work excellently on mobile devices
3. **Fast Response Times:** LLM responses should feel snappy
4. **Accessibility:** WCAG AA compliance required
5. **Budget:** Stay within free tiers where possible

## Out of Scope (Phase 1)

- ~~User authentication/accounts~~ ✅ **Moved to Phase 1**
- Advanced progress tracking and analytics
- Multi-subject support beyond math
- Teacher dashboard
- Mobile native app
- Collaborative learning features

## Risk Areas

1. **LLM Behavior:** Ensuring it never gives direct answers (requires careful prompting)
2. **OCR Accuracy:** Handling poor quality images or complex notation
3. **User Frustration:** Students may get frustrated without direct answers
4. **API Costs:** Usage could exceed budget projections

## Definition of Done

MVP is complete when:
- Users can input problems via text or image
- AI guides through 5+ problem types without giving answers
- Math notation renders beautifully
- Interface works seamlessly on mobile and desktop
- App is deployed and accessible via public URL
- Documentation is complete

