# Active Context: AI Math Tutor

## Current Status

**Date:** November 3, 2025  
**Phase:** Memory Bank Creation & Planning  
**Sprint:** Pre-Development (Day 0)

## What We Just Did

1. ✅ Read and analyzed the comprehensive PRD (math_tutor_prd.txt)
2. ✅ Created Memory Bank structure with all core files:
   - projectbrief.md
   - productContext.md
   - systemPatterns.md
   - techContext.md
   - activeContext.md (this file)
   - progress.md (next)

## Current Focus

**Creating comprehensive project documentation and task breakdown**

We are setting up the foundation for the AI Math Tutor project by:
1. ✅ Establishing the Memory Bank for project context
2. ✅ Creating a detailed task list (tasks.md) with testing requirements
3. ✅ Reviewing and adjusting the build order from the PRD
4. ✅ Addressing tech stack considerations
5. ✅ **Added user authentication to Phase 1** (user requested)

## Tech Stack Decision Point

**Important Note:** There's a discrepancy between the PRD and user requirements:
- **PRD Specifies:** Claude API (Anthropic Sonnet 4.5)
- **User Requested:** OpenAI API (GPT-4)

**Decision Made:** Using **OpenAI API** per user preference
- GPT-4 or GPT-4 Turbo for Socratic dialogue
- GPT-4 Vision for image OCR
- Well-documented, reliable API
- Strong reasoning capabilities suitable for Socratic method

## Build Order Analysis

### Original PRD Timeline

**Day 0:** Environment Setup (2-3 hours)
**Day 1:** Problem Input Foundation
**Day 2:** LLM Integration
**Day 3:** Socratic Logic
**Day 4:** UI Polish & Math Rendering
**Day 5:** Testing & Deployment
**Days 6-7:** (Optional) Stretch Features

### Recommended Adjustments

The original build order is generally sound, but here are suggested refinements:

**Better Approach:**

1. **Day 0: Environment Setup** ✅ (Keep as-is)
   - Project initialization
   - Dependencies installation
   - Firebase configuration
   - Basic project structure

2. **Day 1: Core UI Foundation + Basic Chat** (Adjusted)
   - Build basic chat interface first
   - Implement message display and input
   - Test with hardcoded responses
   - Reason: Gives immediate visual feedback and validates UI patterns early

3. **Day 2: LLM Integration + Socratic Logic** (Combined)
   - Integrate OpenAI API
   - Implement Socratic prompt engineering
   - Test multi-turn conversations
   - Reason: These are tightly coupled - better to build together

4. **Day 3: Math Rendering + Problem Input** (Adjusted Order)
   - Integrate KaTeX for math display
   - Add text input processing
   - Test with math-heavy conversations
   - Reason: Need math rendering working before testing with real problems

5. **Day 4: Image Upload + OCR** (Moved Later)
   - Implement image upload UI
   - Integrate OpenAI Vision API
   - Test text extraction
   - Reason: Text input is more critical; images can come later

6. **Day 5: UI Polish + Testing** (Expanded)
   - Tailwind styling improvements
   - Responsive design
   - Comprehensive testing with 5+ problem types
   - Loading states and error handling

7. **Day 6: Firebase Persistence + Deployment**
   - Integrate Firestore for conversation storage
   - Deploy to Firebase Hosting
   - Production configuration

8. **Day 7+: Stretch Features** (Optional)

### Why These Changes?

1. **UI First:** Building the chat UI early provides a working interface to test everything else
2. **Combine Related Work:** LLM + Socratic logic are interdependent; build together
3. **Defer Image Upload:** Text input is simpler and covers 80% of use cases; add images after core works
4. **Separate Persistence:** Persistence isn't critical for initial testing; can add later
5. **More Testing Time:** Complex Socratic behavior needs thorough testing

## Key Decisions Made

### 1. Technology Stack
- ✅ React 18 + TypeScript
- ✅ Vite build tool
- ✅ Tailwind CSS
- ✅ KaTeX for math rendering
- ✅ Firebase (Firestore + Hosting)
- ✅ OpenAI API (GPT-4 + Vision)
- ✅ react-dropzone for image uploads

### 2. Project Structure
- Component-based architecture
- React Context for state management
- Service layer for API integrations
- Utility functions for parsing and validation
- TypeScript for type safety

### 3. Development Approach
- Test-driven development where possible
- Mobile-first responsive design
- Accessibility as a priority (WCAG AA)
- Continuous deployment via Firebase

## Immediate Next Steps

1. **Create tasks.md** with comprehensive task breakdown including:
   - Detailed tasks for each phase
   - Testing requirements for every task
   - Acceptance criteria
   - Time estimates
   - Dependencies

2. **User Review** of tasks.md
   - Wait for user feedback
   - Adjust tasks based on user input
   - Confirm build order

3. **Day 0 Execution** (Once approved)
   - Initialize project
   - Install dependencies
   - Configure Firebase
   - Set up basic structure

## Questions & Considerations

### Open Questions

1. **API Key Security:** For MVP, API key will be in browser. Acceptable?
   - Recommendation: Yes for MVP, move to backend later

2. **Conversation Length:** How many messages to keep in context?
   - Recommendation: Last 20 messages (balances context vs. token cost)

3. **Hint Threshold:** After how many uncertain responses to escalate hints?
   - Recommendation: 2 uncertain responses

4. **Deployment Domain:** Use Firebase subdomain or custom domain?
   - Recommendation: Firebase subdomain for MVP

5. **Testing Coverage:** What percentage of code coverage target?
   - Recommendation: 70% for core logic, less for UI

### Risks & Mitigations

**Risk 1: LLM Gives Direct Answers**
- Mitigation: Careful prompt engineering, extensive testing
- Fallback: Add post-processing to detect and filter direct answers

**Risk 2: OCR Poor Quality**
- Mitigation: Allow manual text entry as fallback
- Show extracted text for user confirmation

**Risk 3: User Frustration**
- Mitigation: Clear messaging about learning approach
- Celebration moments for progress

**Risk 4: API Costs**
- Mitigation: Monitor usage, implement rate limiting
- Free tier should cover initial testing

## Context for Next Session

When returning to this project:

1. **Check progress.md** for current status
2. **Review tasks.md** for next task to tackle
3. **Check activeContext.md** (this file) for recent decisions
4. **Refer to systemPatterns.md** for technical patterns

## Recent Changes

### November 3, 2025
- ✅ Created Memory Bank structure
- ✅ Analyzed PRD thoroughly
- ✅ Resolved tech stack question (using OpenAI)
- ✅ Proposed adjusted build order
- ✅ Documented all technical patterns and decisions
- ✅ **Added Firebase Authentication to Phase 1 (Day 6)**
  - User requested authentication now instead of Phase 2
  - Enables user accounts, conversation history from launch
  - Better security with proper data isolation
  - Added 10 comprehensive authentication tasks with testing
  - Timeline extended by 1 day (now 7 days + deployment)

## Notes

- PRD is comprehensive and well-structured
- Design philosophy is clear: minimal, inviting, learning-focused
- Success metrics are measurable and reasonable
- Timeline is aggressive but achievable for MVP (now 7-8 days)
- Stretch features are nice-to-have, not critical
- Authentication in Phase 1 provides better user experience and security from day 1

