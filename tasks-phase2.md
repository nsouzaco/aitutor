# Phase 2 Tasks: Mastery-Based Progression System

**Timeline:** 7-9 days (P0 + P1 features, P2 optional)  
**Started:** November 4, 2025  
**Branch:** `phase-2-mastery-system`

---

## 🎯 Phase Overview

Transform the Socratic Math Tutor into an intelligent, personalized learning system with:
- **P0 (Days 1-3):** Foundation - Knowledge graph, progress tracking, XP system
- **P1 (Days 4-6):** Intelligence - Placement tests, gating, recommendations, dashboard  
- **P2 (Days 7-9):** Retention - Spaced repetition review scheduling

---

## Day 0: Preparation & Setup

### Environment Setup
- [x] Create new branch `phase-2-mastery-system`
- [x] Review Phase 2 PRD document
- [x] Document use of React Flow for knowledge graph visualization
- [ ] Review Phase 1 codebase structure
- [ ] Install React Flow: `npm install reactflow` (will be done in P1.2)
- [ ] Set up Firebase Firestore schema updates
- [ ] Create TypeScript type definitions

### Type Definitions
- [ ] Create `src/types/curriculum.ts` (Unit, Topic, Subtopic interfaces)
- [ ] Create `src/types/progress.ts` (StudentProgress, SubtopicProgress)
- [ ] Create `src/types/attempt.ts` (Attempt, AttemptResult)
- [ ] Create `src/types/xp.ts` (XPCalculation, XPMultipliers)
- [ ] Create `src/types/review.ts` (ReviewItem, ReviewSchedule)

### Firebase Schema
- [ ] Document new Firestore collections structure:
  - `students/{userId}/progress/{subtopicId}`
  - `students/{userId}/attempts/{attemptId}`
  - `students/{userId}/reviews/{reviewId}`
- [ ] Update Firestore security rules for new collections
- [ ] Create Firestore indexes if needed

---

## 📚 P0: Foundation Features (Days 1-3)

### P0.1: Knowledge Graph Structure (Day 1 - Morning)

**Objective:** Build hierarchical curriculum with prerequisites

- [ ] Create `src/data/curriculum.ts`
- [ ] Define curriculum structure (4 units, ~25-30 subtopics):
  - [ ] **Unit 1: Algebraic Thinking**
    - Variables & Expressions (level 1, no prereqs)
    - One-Step Equations (level 1, prereq: Variables)
    - Two-Step Equations (level 2, prereq: One-Step)
    - Multi-Step Equations (level 2, prereq: Two-Step)
    - Patterns & Relationships (level 1)
    - Input/Output Tables (level 2, prereq: Patterns)
    - Linear Functions (level 3, prereq: Input/Output)
    - Inequalities (level 2, prereq: Two-Step Equations)
  - [ ] **Unit 2: Geometry**
    - Angles & Lines (level 1)
    - Triangles (level 2, prereq: Angles)
    - Quadrilaterals (level 2, prereq: Angles)
    - Area & Perimeter (level 2)
    - Volume (level 3, prereq: Area)
    - Pythagorean Theorem (level 3, prereq: Triangles)
  - [ ] **Unit 3: Data & Statistics**
    - Mean, Median, Mode (level 1)
    - Range & Outliers (level 1)
    - Data Visualization (level 2, prereq: Mean/Median)
    - Probability Basics (level 2)
    - Sample Space (level 2, prereq: Probability)
  - [ ] **Unit 4: Problem Solving**
    - Ratio & Proportion (level 2)
    - Percent Problems (level 2, prereq: Ratio)
    - Rate Problems (level 2, prereq: Ratio)
    - Multi-Step Word Problems (level 3)

- [ ] Add example problems for each subtopic (2-3 examples per subtopic)
- [ ] Validate no circular dependency chains
- [ ] Write utility function: `getPrerequisiteChain(subtopicId)`
- [ ] Write utility function: `getAllSubtopics()`, `getSubtopicById()`

- [ ] **React Flow Utilities:**
  - [ ] Create `src/utils/graphLayoutUtils.ts`
  - [ ] `convertCurriculumToReactFlow(curriculum, userProgress): { nodes, edges }`
  - [ ] `calculateNodePositions(subtopics): NodePosition[]` - Auto-layout
  - [ ] `getNodeColor(status): string` - Color mapping for node states
  - [ ] `buildEdgesFromPrerequisites(subtopics): Edge[]`

**Acceptance:** Curriculum loads, all prerequisites defined, no circular deps, can be converted to React Flow format

---

### P0.2: Progress Tracking & Mastery Logic (Day 1 - Afternoon)

**Objective:** Track attempts and calculate mastery (85%+ accuracy, min 3 attempts)

- [ ] Create `src/services/progressService.ts`
- [ ] Implement data model interfaces:
  ```typescript
  interface SubtopicProgress {
    subtopicId: string;
    attemptCount: number;
    correctCount: number;
    masteryScore: number;
    mastered: boolean;
    lastAttemptedAt: Date;
    firstAttemptDate: Date;
    masteryDate?: Date;
    averageResponseTime?: number;
  }
  ```

- [ ] Implement core functions:
  - [ ] `isMastered(progress: SubtopicProgress): boolean`
  - [ ] `calculateMasteryScore(correctCount, attemptCount): number`
  - [ ] `updateProgress(userId, subtopicId, isCorrect, timeSpent): Promise<void>`
  - [ ] `getStudentProgress(userId): Promise<StudentProgress>`
  - [ ] `getSubtopicProgress(userId, subtopicId): Promise<SubtopicProgress>`

- [ ] Mastery logic:
  - [ ] Enforce: `correctCount / attemptCount >= 0.85 AND attemptCount >= 3`
  - [ ] Mastery persists once achieved (can't decrease)
  - [ ] Update `mastered` flag when threshold met

- [ ] Firebase integration:
  - [ ] Save progress to `students/{userId}/progress/{subtopicId}`
  - [ ] Update on each attempt
  - [ ] Query optimization (<100ms)

- [ ] Write unit tests for mastery calculation edge cases

**Acceptance:** Mastery correctly identified at 85%+, min 3 attempts, Firebase updates work

---

### P0.3: XP Calculation Engine (Day 2)

**Objective:** Award XP with multipliers for quality, pace, and effort

- [ ] Create `src/services/xpEngine.ts`
- [ ] Define XP calculation interface:
  ```typescript
  interface XPCalculationInput {
    subtopicDifficulty: 1 | 2 | 3;
    isCorrect: boolean;
    timeSpent: number; // seconds
    hintsUsed: number;
    attemptNumber: number;
    isAlreadyMastered: boolean;
  }
  ```

- [ ] Implement `calculateXP()` function:
  - [ ] Base XP = difficulty × 10
  - [ ] If incorrect: return baseXP × 0.3
  - [ ] If correct, apply multipliers:

- [ ] **Time Multiplier Logic:**
  - [ ] Calculate expected time: `difficulty × 30 seconds`
  - [ ] If `actualTime < 0.5 × expected`: multiply by 0.7 (rushing)
  - [ ] If `actualTime > 2 × expected`: multiply by 0.9 (struggled)
  - [ ] If within range (0.5-2×): multiply by 1.1 (optimal)

- [ ] **Hint Penalty:**
  - [ ] 0 hints: 1.0×
  - [ ] 1 hint: 0.85×
  - [ ] 2 hints: 0.70×
  - [ ] 3+ hints: 0.55×

- [ ] **First Attempt Bonus:**
  - [ ] 1st attempt correct: 1.2×
  - [ ] 2nd+ attempt correct: 1.0×

- [ ] **Maintenance Review Penalty:**
  - [ ] Already mastered: 0.5× (discourages farming)

- [ ] Write comprehensive unit tests for XP edge cases
- [ ] Document XP formula transparently for students

**Acceptance:** XP scales by difficulty, penalizes rushing, rewards first-attempt success

---

### P0 Integration & Testing (Day 3)

- [ ] Wire up progress tracking to existing problem-solving flow
- [ ] Add XP calculation after each attempt
- [ ] Save attempt data to `students/{userId}/attempts/{attemptId}`
- [ ] Test end-to-end: solve problem → progress updates → XP awarded
- [ ] Fix any bugs in mastery/XP calculations
- [ ] Verify Firebase queries are fast (<100ms)
- [ ] Write integration tests for P0 features

**Checkpoint:** P0 complete, ready for P1 intelligence features

---

## 🧠 P1: Intelligence Features (Days 4-6)

### P1.1: Initial Placement Test (Day 4)

**Objective:** Place students correctly at signup via 20-question assessment

- [ ] Create `src/data/placementTest.ts` with question bank
- [ ] Design 20 questions:
  - [ ] 5 beginner (level 1): Variables, One-Step Equations, Patterns
  - [ ] 5 intermediate (level 2): Two-Step Equations, Inequalities
  - [ ] 5 advanced (level 3): Multi-Step Equations, Linear Functions
  - [ ] 5 mixed review: Word problems, multi-step

- [ ] Map each question to specific subtopic
- [ ] Include "Skip" option for all questions

- [ ] Create React components:
  - [ ] `src/components/Placement/PlacementTestPage.tsx`
  - [ ] `src/components/Placement/PlacementQuestion.tsx`
  - [ ] `src/components/Placement/PlacementResults.tsx`
  - [ ] `src/components/Placement/index.ts`

- [ ] Implement placement algorithm in `src/services/placementService.ts`:
  - [ ] Identify mastered subtopics (2/3+ correct)
  - [ ] Find highest prerequisite chain with good performance
  - [ ] Assign recommended starting subtopic
  - [ ] Estimate student level: beginner/intermediate/advanced

- [ ] UI Flow:
  - [ ] Welcome screen: "Let's find your starting point"
  - [ ] One question at a time with progress bar
  - [ ] Skip button on every question
  - [ ] Results screen with recommended starting topic
  - [ ] Redirect to dashboard after completion

- [ ] Save placement results to Firestore:
  - [ ] `students/{userId}`: placementTestCompleted, estimatedLevel, placementTestScore
  - [ ] Ensure test only runs once per student

- [ ] Test placement algorithm with edge cases (all correct, all wrong, mix)

**Acceptance:** 20 questions load, placement logic works, results save correctly

---

### P1.2: Prerequisite Gating & Topic Locking (Day 5 - Morning)

**Objective:** Prevent attempting topics until prerequisites mastered

- [ ] Install React Flow: `npm install reactflow`
- [ ] Create `src/services/gatingService.ts`
- [ ] Implement gating functions:
  - [ ] `getAvailableSubtopics(userId): Promise<Subtopic[]>`
  - [ ] `isSubtopicUnlocked(userId, subtopicId): Promise<boolean>`
  - [ ] `getLockedReason(userId, subtopicId): Promise<string>`
  - [ ] `getPrerequisiteStatus(userId, subtopicId): Promise<PrerequisiteStatus>`

- [ ] Gating logic:
  - [ ] Check ALL prerequisites are mastered before allowing access
  - [ ] Return locked status with prerequisite info
  - [ ] Filter out locked topics from available list

- [ ] Create React components:
  - [ ] `src/components/Topics/TopicBrowser.tsx` (main view with tabs)
  - [ ] `src/components/Topics/TopicCard.tsx` (individual topic in list view)
  - [ ] `src/components/Topics/TopicDetail.tsx` (detail view)
  - [ ] `src/components/Topics/KnowledgeGraph.tsx` (React Flow visualization)
  - [ ] `src/components/Topics/index.ts`

- [ ] **React Flow Knowledge Graph Implementation:**
  - [ ] Create node types for topics (mastered, in-progress, locked, not-started)
  - [ ] Convert curriculum data to React Flow nodes and edges
  - [ ] Implement custom node styles:
    - [ ] 🟢 **MASTERED**: Green node with checkmark
    - [ ] 🟡 **IN PROGRESS**: Yellow node with progress ring
    - [ ] 🔒 **LOCKED**: Gray node with lock icon
    - [ ] ⚪ **NOT STARTED**: White/outlined node
  - [ ] Add prerequisite arrows showing dependencies
  - [ ] Implement zoom and pan controls
  - [ ] Add node click handlers (open detail modal or redirect)
  - [ ] Group nodes by unit (visual clustering)
  - [ ] Add minimap for navigation
  - [ ] Add legend explaining node states
  - [ ] Implement auto-layout algorithm (hierarchical or force-directed)

- [ ] **List View (Traditional UI):**
  - [ ] UI - Status badges:
    - [ ] 🟢 **MASTERED**: Show mastery %, allow practice (review)
    - [ ] ◐ **IN PROGRESS**: Show progress bar, "Continue Practice" button
    - [ ] 🔒 **LOCKED**: Gray out, show prerequisite link
    - [ ] ❌ **NOT AVAILABLE**: Multiple blocked prerequisites

- [ ] **Toggle between Graph View and List View:**
  - [ ] Add view switcher (Graph/List tabs or toggle button)
  - [ ] Persist user preference in localStorage
  - [ ] Both views show same data, different visualization

- [ ] Implement server-side validation:
  - [ ] Validate on problem request (prevent URL bypassing)
  - [ ] Return 403 if trying to access locked topic

- [ ] Real-time updates:
  - [ ] Lock status updates immediately after reaching mastery
  - [ ] Toast notification when new topics unlock
  - [ ] Graph nodes update colors/states in real-time

- [ ] Mobile responsive layout:
  - [ ] Graph view optimized for touch (pinch zoom)
  - [ ] List view default on mobile
  - [ ] Responsive node sizes

**Acceptance:** Locked topics genuinely unclickable, status badges clear, server-side validated, React Flow graph displays curriculum structure with real-time mastery states

---

### P1.3: Knowledge Frontier - Next Topic Recommendation (Day 5 - Afternoon)

**Objective:** Surface optimal next subtopic based on mastery and prerequisites

- [ ] Create `src/services/recommendationEngine.ts`
- [ ] Implement recommendation algorithm:
  - [ ] Prefer unattempted subtopics (new learning)
  - [ ] Sort by difficulty (easier first)
  - [ ] If all attempted, suggest closest to mastery
  - [ ] Filter out unavailable topics (prerequisites not met)

- [ ] Functions:
  - [ ] `getNextRecommendedSubtopic(userId): Promise<Subtopic | null>`
  - [ ] `getKnowledgeFrontier(userId): Promise<Subtopic[]>` (top 3-5)

- [ ] Create React component:
  - [ ] `src/components/Dashboard/KnowledgeFrontier.tsx`

- [ ] UI - "Recommended Next" card:
  - [ ] Topic name and brief description
  - [ ] Current mastery % if in-progress
  - [ ] Progress bar: "X of Y correct to mastery"
  - [ ] CTA button: "[Continue Practice]" or "[Start Practice]"

- [ ] Real-time updates:
  - [ ] Recommendation refreshes after each attempt
  - [ ] Mobile responsive (full-width on small screens)

**Acceptance:** Algorithm returns valid next subtopic, prioritizes new topics, updates real-time

---

### P1.4: Progress Dashboard (Day 6)

**Objective:** Show overall learning progress, mastery, and engagement metrics

- [ ] Create `src/services/dashboardService.ts`
- [ ] Implement data aggregation functions:
  - [ ] `getTotalXP(userId): Promise<number>`
  - [ ] `getWeeklyXP(userId): Promise<number>`
  - [ ] `getMonthlyXP(userId): Promise<number>`
  - [ ] `getCurrentStreak(userId): Promise<number>`
  - [ ] `getMasteryPercentage(userId): Promise<number>`
  - [ ] `getRecentActivity(userId, limit): Promise<Attempt[]>`

- [ ] Create React components:
  - [ ] `src/components/Dashboard/ProgressDashboard.tsx` (main container)
  - [ ] `src/components/Dashboard/StatsHeader.tsx` (XP, streak, pace)
  - [ ] `src/components/Dashboard/MasteryProgress.tsx` (topics mastered)
  - [ ] `src/components/Dashboard/UnitBreakdown.tsx` (progress per unit)
  - [ ] `src/components/Dashboard/RecentActivity.tsx` (last 5 attempts)
  - [ ] `src/components/Dashboard/index.ts`

- [ ] **StatsHeader Section:**
  - [ ] Total XP earned (all-time)
  - [ ] Weekly XP and monthly XP
  - [ ] Daily average XP (weeklyXP / 7)
  - [ ] Current streak (consecutive days with activity)
  - [ ] Pace rating badge (excellent/good/fair)

- [ ] **MasteryProgress Section:**
  - [ ] Overall completion % (mastered / total topics)
  - [ ] List of mastered topics with dates
  - [ ] In-progress topics with mastery score
  - [ ] Locked topics grayed out
  - [ ] Sort: mastered → in-progress → locked

- [ ] **UnitBreakdown Section (Optional):**
  - [ ] Progress per unit (% complete)
  - [ ] Visual progress bars

- [ ] **RecentActivity Section:**
  - [ ] Last 5 attempts (reverse chronological)
  - [ ] Show: action, score, XP earned, timestamp
  - [ ] Link to "View All Activity"

- [ ] Performance optimization:
  - [ ] Dashboard loads in <1 second
  - [ ] Cache frequently accessed data
  - [ ] Real-time updates after each attempt

- [ ] Mobile responsive design (no horizontal scroll)
- [ ] Streak counter updates at midnight

**Acceptance:** Dashboard loads fast, stats accurate, updates real-time, mobile responsive

---

### P1 Integration & Testing (End of Day 6)

- [ ] Test full user journey:
  - [ ] New user → placement test → dashboard → recommended topic
  - [ ] Solve problem → progress updates → new topics unlock
  - [ ] Master topic → unlock dependent topics → dashboard reflects
- [ ] Test gating edge cases (multiple prerequisites, chains)
- [ ] Test placement algorithm with various scores
- [ ] Verify mobile responsiveness on all screens
- [ ] Fix any bugs found in integration testing
- [ ] Performance audit (all queries <100ms)

**Checkpoint:** P1 complete, intelligent learning system functional

---

## 🔄 P2: Retention Features (Days 7-9) - OPTIONAL

### P2.1: Spaced Repetition Review Queue (Day 7)

**Objective:** Schedule reviews using Leitner system to prevent forgetting

- [ ] Create `src/services/reviewScheduler.ts`
- [ ] Implement review scheduling logic:
  - [ ] Day 1 (same day): First review
  - [ ] Day 3: Second review
  - [ ] Day 7: Third review
  - [ ] Day 14: Fourth review
  - [ ] Then monthly reviews

- [ ] Review item data model:
  ```typescript
  interface ReviewItem {
    reviewId: string;
    subtopicId: string;
    dueAt: Date;
    priority: 'high' | 'medium' | 'low';
    lastReviewedAt?: Date;
    nextDueAt: Date;
    reviewCount: number;
    completed: boolean;
  }
  ```

- [ ] Priority logic:
  - [ ] High: 0-3 days past due or due today
  - [ ] Medium: Due in 3-7 days
  - [ ] Low: Due in 7+ days

- [ ] Functions:
  - [ ] `generateReviewQueue(userId): Promise<ReviewItem[]>`
  - [ ] `getNextReviewDueDate(reviewCount): Date`
  - [ ] `updateReviewSchedule(userId, subtopicId): Promise<void>`
  - [ ] `getDueReviewCount(userId): Promise<number>`

- [ ] Save reviews to `students/{userId}/reviews/{reviewId}`
- [ ] Write unit tests for scheduling algorithm (various time scenarios)

**Acceptance:** Reviews generated correctly, priorities accurate, next due dates calculated

---

### P2.2: Review UI & Scheduling (Day 8)

**Objective:** Surface due reviews and integrate into practice flow

- [ ] Create React components:
  - [ ] `src/components/Dashboard/ReviewQueue.tsx` (review section on dashboard)
  - [ ] `src/components/Practice/ReviewMode.tsx` (filtered practice view)

- [ ] Create `src/services/reviewService.ts`:
  - [ ] `getReviewQueue(userId): Promise<ReviewItem[]>`
  - [ ] `getNextReviewProblem(userId): Promise<PracticeProblem>`
  - [ ] `completeReview(userId, reviewId): Promise<void>`

- [ ] **Dashboard - Review Section:**
  - [ ] Show "Due for Review" count badge
  - [ ] Display high-priority items (red)
  - [ ] Display medium-priority items (yellow)
  - [ ] "[Start Review]" button

- [ ] **Review Flow:**
  - [ ] Click "[Start Review]" → redirect to ReviewMode
  - [ ] Problem appears same format as normal practice
  - [ ] After solving: XP awarded at 0.5× multiplier (maintenance)
  - [ ] Next review date updated
  - [ ] Dashboard refreshes in real-time

- [ ] **Optional: Review Streak Badge**
  - [ ] Days reviewed consecutively
  - [ ] Topics reviewed this week
  - [ ] Motivational message

- [ ] Test review scheduling updates after completion
- [ ] Verify XP 0.5× maintenance multiplier applies
- [ ] Test priority color coding

**Acceptance:** Reviews display correctly, prioritized, completion updates schedule

---

### P2 Polish & Testing (Day 9)

- [ ] End-to-end testing:
  - [ ] Master topic → review scheduled → review appears in queue
  - [ ] Complete review → next review scheduled correctly
  - [ ] High-priority reviews sort to top
- [ ] Test review queue edge cases (many overdue, none due)
- [ ] Performance optimization (review queries <100ms)
- [ ] Mobile responsive testing
- [ ] Bug fixes and polish
- [ ] Documentation updates

**Checkpoint:** P2 complete, full retention system functional

---

## 🚀 Deployment & Launch

### Pre-Launch Checklist

- [ ] All P0 and P1 features tested end-to-end
- [ ] Firebase security rules updated and tested
- [ ] Performance audit passed (all queries <100ms)
- [ ] Mobile responsive on iOS and Android
- [ ] Error handling and edge cases covered
- [ ] User-facing documentation updated

### Testing Strategy

**Unit Tests:**
- [ ] Test mastery calculation (85%+ threshold)
- [ ] Test XP calculation (all multipliers)
- [ ] Test gating logic (prerequisites)
- [ ] Test placement algorithm (edge cases)
- [ ] Test review scheduling (various dates)

**Integration Tests:**
- [ ] Placement → student placed → topics unlock
- [ ] Attempt → progress updates → mastery achieved
- [ ] Mastery → unlock dependent topics → dashboard updates
- [ ] Review → completion → next review scheduled

**Manual Testing:**
- [ ] Test all topic lock/unlock states
- [ ] Verify XP calculations with various inputs
- [ ] Test placement algorithm edge cases
- [ ] Verify review scheduling dates
- [ ] Test dashboard on mobile devices

### Rollout Plan

- [ ] **Internal Testing:** Developers + 5-10 test accounts (1-2 days)
- [ ] **Beta:** 20-30 students for 24 hours (Day 8)
- [ ] **Full Release:** All new signups use Phase 2 (Day 9)

### Post-Launch Monitoring

- [ ] Monitor Firebase usage and costs
- [ ] Track placement accuracy (95%+ goal)
- [ ] Monitor mastery rates (85%+ average)
- [ ] Track engagement metrics (session length, DAU, retention)
- [ ] Gather user feedback on gating and recommendations
- [ ] Monitor for bugs and performance issues

---

## 📊 Success Metrics & KPIs

### Functional Success
- [ ] 100% of new students complete placement test
- [ ] Placement accuracy: 95%+ in correct difficulty level
- [ ] Prerequisite gating: 0 students bypass locked topics
- [ ] Mastery rate: 85%+ average across subtopics
- [ ] XP calibration: >50% at 60-120% expected time

### Learning Outcomes
- [ ] Students master 2-3 subtopics in first 2 weeks
- [ ] Review queue engagement: 60%+ attempt due reviews
- [ ] Retention: 80%+ accuracy on review attempts

### Engagement Metrics
- [ ] Average session length: 15-20 minutes
- [ ] Daily active users: 40%+
- [ ] Weekly retention: 60%+
- [ ] XP earned per day: 40-100 XP

---

## 🎯 Current Status

**Current Phase:** Day 0 - Preparation  
**Next Milestone:** Complete type definitions and Firebase schema  
**Blockers:** None

---

## 📝 Notes & Decisions

- Mastery threshold set at 85% (may adjust to 80% if too difficult)
- XP multipliers designed to discourage rushing and reward quality
- Placement test uses Algebraic Thinking as foundation (most critical unit)
- Review scheduling uses simplified Leitner system (4 intervals + monthly)
- Gating enforced server-side to prevent bypassing
- Dashboard prioritizes clarity over complexity (MVP first)
- **Using React Flow for knowledge graph visualization** - Interactive node-based curriculum map

---

**Last Updated:** November 4, 2025  
**Branch:** `phase-2-mastery-system`  
**Next Review:** End of Day 3 (P0 completion checkpoint)

