# Product Requirements Document: Phase 2 - Mastery-Based Progression System

**Version:** 2.0  
**Date:** November 4, 2025  
**Timeline:** 7-9 days (P0 + P1 features)  
**Target Users:** 8th Grade Students (Ages 13-14)  
**App Type:** Practice-Only (No Lessons)  

---

## Executive Summary

Phase 2 transforms the Socratic Math Tutor from a simple problem-solving tool into an intelligent, personalized learning system. This phase implements foundational learning science features: prerequisite-based topic gating, XP-calibrated learning pace, mastery thresholds, initial placement tests, and spaced repetition review scheduling.

The system will ensure students build foundational skills before advancing, prevent knowledge gaps, and maintain long-term retention through intelligent review scheduling.

### Success Metrics
- Students cannot skip prerequisites (gating enforced)
- Placement test successfully places 95%+ of students in correct starting topic
- Mastery defined as 85%+ accuracy with 3+ attempts per subtopic
- Review queue surfaces due topics with appropriate spacing
- XP awards calibrate learning pace (reward quality + reasonable speed)
- 100% of students see personalized "next topic" recommendation
- Dashboard shows clear learning path and mastery progress

---

## Problem Statement

**Current State (Phase 1):**
- Students can attempt any problem in any order
- No progression system: could tackle Linear Functions before One-Step Equations
- No long-term learning: once a problem is solved, it's forgotten
- No mechanism to prevent knowledge gaps
- No guidance on what to study next
- Effort/pace has no calibration system

**Phase 2 Solution:**
Implement a prerequisite-aware, mastery-based system that:
1. Gates advanced topics until prerequisites are mastered
2. Tracks mastery via 85%+ accuracy threshold
3. Calibrates XP awards to discourage rushing/guessing
4. Places students correctly at signup
5. Recommends optimal learning sequence
6. Schedules reviews to prevent forgetting

---

## Core Features Overview

### **Foundation Features (P0) - Days 1-3**
These are prerequisites for all other features.

#### P0.1: Knowledge Graph Structure
#### P0.2: Progress Tracking & Mastery Logic
#### P0.3: XP Calculation Engine

### **Intelligence Features (P1) - Days 4-6**
Prerequisite gating, placement testing, and smart recommendations.

#### P1.1: Initial Placement Test
#### P1.2: Prerequisite Gating & Topic Locking
#### P1.3: Knowledge Frontier Recommendations
#### P1.4: Progress Dashboard

### **Retention Features (P2) - Days 7-9**
Spaced repetition and review scheduling.

#### P2.1: Spaced Repetition Review Queue
#### P2.2: Review UI & Scheduling

---

## P0: Foundation Features

### **P0.1: Knowledge Graph Structure**

**Objective:** Organize curriculum with prerequisites, difficulty levels, and examples to enable algorithmic decision-making.

**Requirements:**

- Curriculum stored as hierarchical tree: Unit → Topic → Subtopic
- Each subtopic contains: ID, name, examples, prerequisites array, difficulty level (1-3)
- Prerequisite chain example:
  - Variables & Expressions (level 1, no prerequisites)
  - One-Step Equations (level 1, prerequisite: Variables & Expressions)
  - Two-Step Equations (level 2, prerequisite: One-Step Equations)
  - Multi-Step Equations (level 2, prerequisite: Two-Step Equations)

- Curriculum includes all 4 units (Algebraic Thinking, Geometry, Data/Statistics, Problem Solving) with ~25-30 subtopics total

**Acceptance Criteria:**
- Curriculum loads from TypeScript/JSON file
- All subtopics have correct prerequisites defined
- No circular dependency chains
- Difficulty levels assigned consistently
- Examples are clear and representative

**Deliverable:**
- `curriculum.ts` file with full CURRICULUM object
- Type definitions: `Unit`, `Topic`, `Subtopic` interfaces

---

### **P0.2: Progress Tracking & Mastery Logic**

**Objective:** Track student attempts and determine when mastery is achieved.

**Requirements:**

**Data Model:**
- StudentSubtopicProgress tracks: subtopicId, attemptCount, correctCount, masteryScore, lastAttemptedAt, mastered flag
- StudentProgress maps multiple subtopic progress objects per student

**Mastery Definition:**
- Mastery achieved when: correctCount / attemptCount >= 0.85 AND attemptCount >= 3
- Mastery persists once achieved (can only go up, never down)
- Example: 4 correct out of 5 attempts = 80% (NOT mastered yet)
- Example: 6 correct out of 7 attempts = 85.7% (MASTERED ✓)

**Update on Each Attempt:**
- Increment attemptCount
- If correct, increment correctCount
- Recalculate masteryScore
- Update lastAttemptedAt timestamp
- Evaluate if now mastered

**Storage in Firebase:**
Store student progress in Firestore collection with structure: students/{userId}/progress/{subtopicId}

**Acceptance Criteria:**
- Mastery logic correctly identifies when student has achieved 85%+ accuracy
- Minimum 3 attempts enforced
- Progress updates fire immediately after each attempt
- Mastered flag toggles correctly
- Firebase queries return progress in <100ms

**Deliverable:**
- `progressService.ts` with mastery calculation logic
- Firebase Firestore schema documented
- Utility function: `isMastered(progress)`

---

### **P0.3: XP Calculation Engine**

**Objective:** Award XP in a way that calibrates learning pace and discourages rushing/guessing.

**Requirements:**

**XP Formula Logic:**
- Base XP = difficulty × 10 (difficulty 1 = 10 XP, difficulty 2 = 20 XP, difficulty 3 = 30 XP)
- If incorrect: return baseXP × 0.3 (only 30% credit)
- If correct: apply multipliers for time, hints, attempt number, and whether topic already mastered

**Time Multiplier:**
- Expected time = difficulty × 30 seconds
- If actual time < 0.5× expected: multiply by 0.7 (likely guessing)
- If actual time > 2× expected: multiply by 0.9 (struggled, but full credit)
- If within range (0.5-2×): multiply by 1.1 (bonus for reasonable pacing)

**Hint Penalty:**
- 0 hints: 1.0× multiplier
- 1 hint: 0.85× multiplier
- 2 hints: 0.70× multiplier
- 3+ hints: 0.55× multiplier

**First Attempt Bonus:**
- Correct on 1st try: 1.2× multiplier
- Correct on 2nd+ try: 1.0× multiplier

**Maintenance Review Penalty:**
- If student already mastered this topic: 0.5× multiplier
- Encourages moving forward, but still rewards review

**Acceptance Criteria:**
- XP calculation is transparent and documented
- Students who rush through get noticeably less XP
- Students who get it right on first try get bonus
- Already-mastered topics give reduced XP (maintenance)
- XP scales by difficulty

**Deliverable:**
- `xpEngine.ts` with `calculateXP()` function
- Clear documentation of multiplier logic
- Test cases covering edge cases

---

## P1: Intelligence Features

### **P1.1: Initial Placement Test**

**Objective:** Correctly place students at signup by assessing current knowledge across 3-4 difficulty levels.

**Requirements:**

**Test Structure:**
- 20 questions total
- Questions span Algebraic Thinking unit (foundation for all other topics)
- Mix of levels: 5 beginner, 5 intermediate, 5 advanced, 5 mixed review
- Each question maps to a specific subtopic
- Students can skip questions without penalty ("I don't know" option)

**Question Categories:**

Beginner (Level 1):
- Variables & Expressions (2 questions)
- One-Step Equations (2 questions)
- Patterns & Relationships (1 question)

Intermediate (Level 2):
- Two-Step Equations (2 questions)
- Input/Output Table (1 question)
- Simple Inequality (2 questions)

Advanced (Level 3):
- Multi-Step Equations (2 questions)
- Multi-Step Inequality (1 question)
- Linear Functions (1 question)
- Ratio/Proportion (1 question)

Mixed Review:
- Word problems (2 questions)
- Pattern recognition (1 question)
- Multi-step problems (1 question)

**Placement Algorithm:**
- Identify mastered subtopics (score 2/3+)
- Find highest prerequisite chain where student scored well
- Assign recommended starting subtopic
- Estimate student level: beginner, intermediate, or advanced

**UI Flow:**
1. Student sees "Let's find your starting point"
2. Questions presented one at a time
3. Each question has answer field and "Skip" button
4. Progress bar shows completion
5. Results screen shows recommended starting topic
6. Redirect to home dashboard

**Acceptance Criteria:**
- All 20 questions load without errors
- "Skip" option available on every question
- Placement logic correctly identifies mastered subtopics
- Placement test only runs once per student
- Results visible on dashboard after completion

**Deliverable:**
- `placementTest.ts` with question bank and algorithm
- React components: `PlacementTestPage`, `PlacementQuestion`, `PlacementResults`
- Firebase function to save placement results

---

### **P1.2: Prerequisite Gating & Topic Locking**

**Objective:** Prevent students from attempting topics until prerequisites are mastered.

**Requirements:**

**Gating Logic:**
- Check if ALL prerequisites are mastered before allowing topic attempt
- getAvailableSubtopics() returns only subtopics student can currently attempt
- Return locked status for locked topics with prerequisite info

**UI - Topic Browser:**
Show all subtopics with status badges:
- 🟢 MASTERED - show mastery % and allow practice
- ◐ IN PROGRESS - show progress bar and allow more practice
- 🔒 LOCKED - gray out, show why it's locked, suggest prerequisite
- ❌ NOT AVAILABLE YET - show multiple blocked prerequisites

**User Behavior:**
- Click "View Problems" for mastered topic → can practice (review)
- Click "Continue Practice" for in-progress topic → more problems
- Click prerequisite link on locked topic → redirect to that topic
- Locked topics are genuinely unclickable

**API Endpoint:**
- GET /api/student/{userId}/available-subtopics - returns available subtopics
- GET /api/subtopic/{subtopicId}/status - returns status, prerequisites, progress

**Acceptance Criteria:**
- Locked topics are genuinely unclickable
- Status badges clearly show lock reason
- Prerequisite chain is visible
- Server-side validation prevents URL bypassing
- Lock status updates in real-time after reaching mastery
- Mobile responsive layout

**Deliverable:**
- `gatingService.ts` with gating logic
- React component: `TopicBrowser` with status badges
- React component: `TopicCard` with CTA buttons
- Server validation on problem request

---

### **P1.3: Knowledge Frontier - Next Topic Recommendation**

**Objective:** Surface the optimal next subtopic to study based on mastery and prerequisites.

**Requirements:**

**Algorithm:**
- Prefer unattempted subtopics (new learning over review)
- Sort by difficulty (easier first for new topics)
- If all available topics attempted, suggest topic closest to mastery
- Filter out topics that aren't yet available (prerequisites not met)

**UI - Home Dashboard:**
Show "Recommended Next" card with:
- Topic name and brief description
- Current mastery % if in-progress
- Progress bar with "X of Y correct to mastery"
- Primary CTA: "[Continue Practice]" or "[Start Practice]"

**Dashboard Updates:**
- Recommendation updates in real-time after each attempt
- Mobile responsive (card full-width on small screens)

**Acceptance Criteria:**
- Algorithm always returns valid next subtopic when available
- New subtopics prioritized over reviews
- In-progress subtopics shown with mastery progress
- UI updates real-time after each attempt
- Mobile responsive

**Deliverable:**
- `recommendationEngine.ts` with algorithm
- React component: `KnowledgeFrontier`
- Integration on home dashboard

---

### **P1.4: Progress Dashboard**

**Objective:** Show students their overall learning progress, mastery per topic, and engagement metrics.

**Requirements:**

**Dashboard Sections:**

**A. Learning Stats Header**
- Total XP earned (all-time)
- Weekly XP and monthly XP
- Daily average XP
- Current streak (consecutive days with activity)
- Pace rating (excellent/good/fair)

**B. Topics Mastered**
- Overall completion % (topics mastered / total topics)
- List of mastered topics with dates
- In-progress topics with mastery score
- Locked topics grayed out
- Sort: mastered first, then in-progress, then locked

**C. Unit Breakdown (Optional)**
- Progress per unit (% complete)
- Visual bars for each unit

**D. Recent Activity**
- Last 5 attempts shown in reverse chronological order
- Show action, score, XP earned, timestamp
- Link to "View All Activity"

**Data Requirements:**
- totalXP: sum of all XP earned
- weeklyXP, monthlyXP: computed from attempt timestamps
- dailyAverage: weeklyXP / 7
- currentStreak: count consecutive days with attempts
- masteryPercentage: count(mastered) / count(all subtopics)
- recentActivity: last 5 attempts

**Acceptance Criteria:**
- Dashboard loads in <1 second
- Stats update in real-time after each attempt
- Mobile responsive (no horizontal scroll)
- Streak counter updates at midnight
- XP calculations transparent

**Deliverable:**
- React component: `ProgressDashboard` (main container)
- Sub-components: `StatsHeader`, `MasteryProgress`, `UnitBreakdown`, `RecentActivity`
- `dashboardService.ts` for data aggregation

---

## P2: Retention Features (Optional - Days 7-9)

### **P2.1: Spaced Repetition Review Queue**

**Objective:** Schedule reviews of mastered topics to prevent forgetting, using evidence-based spacing intervals.

**Requirements:**

**Spaced Repetition Schedule:**
Using the Leitner system adapted for 8th grade:
- Day 1 (same day): First review
- Day 3: Second review
- Week 1 (day 7): Third review
- Week 2 (day 14): Fourth review
- Then monthly reviews

**Review Item Data:**
- subtopicId, dueAt timestamp, priority level (high/medium/low)
- lastReviewedAt, reviewCount, nextDueAt

**Priority Logic:**
- High: 0-3 days past due or due today
- Medium: Due in 3-7 days
- Low: Due in 7+ days

**Sorting:**
- Sort by priority first, then by due date
- High priority items appear at top of review queue

**Acceptance Criteria:**
- Review items generated correctly based on mastery date
- Priority levels accurate
- Reviews sorted by priority
- Next due date calculated correctly
- Only mastered topics appear in queue

**Deliverable:**
- `reviewScheduler.ts` with `generateReviewQueue()` function
- Review scheduling logic documented
- Test cases covering different time scenarios

---

### **P2.2: Review UI & Scheduling**

**Objective:** Surface due review items and integrate them into the practice flow.

**Requirements:**

**Home Dashboard - Review Section:**
- Show "Due for Review" count at top
- Display high-priority items
- Display medium-priority items
- "[Start Review]" button

**Review Flow:**
1. Student clicks "[Start Review]"
2. Redirected to practice page filtered to review items only
3. Problem appears same format as normal practice
4. After solving: XP awarded at 0.5× multiplier (maintenance)
5. Next review date updated in database
6. Dashboard updated in real-time

**API Endpoints:**
- GET /api/student/{userId}/review-queue - returns ReviewItem[]
- GET /api/student/{userId}/next-review-problem - returns PracticeProblem
- POST /api/student/{userId}/review/{reviewItemId}/complete - updates schedule

**Optional: Review Streak Badge**
- Show days reviewed consecutively
- Show count of topics reviewed this week
- Motivational message

**Acceptance Criteria:**
- Review items display with priority color coding
- High-priority items listed first
- Student can start review session with one click
- Review problems randomly sampled from due topics
- XP calculations apply 0.5× maintenance multiplier
- Next review dates update after completion
- Dashboard refreshes in real-time

**Deliverable:**
- React component: `ReviewQueue` / `ReviewSection` on dashboard
- React component: `ReviewMode` (filtered practice view)
- `reviewService.ts` for review data fetching/updating
- Firebase functions to update review schedules

---

## Technical Architecture

### **Firebase Firestore Schema**

**Collection: students/{userId}**
- userId, email, createdAt, lastActiveAt, totalXP, placementTestCompleted, estimatedLevel, placementTestScore

**Subcollection: students/{userId}/progress**
- subtopicId, attemptCount, correctCount, masteryScore, mastered, lastAttemptedAt, averageResponseTime, firstAttemptDate, masteryDate

**Subcollection: students/{userId}/attempts**
- attemptId, subtopicId, problemText, studentResponse, isCorrect, timeSpent, hintsUsed, xpEarned, attemptedAt, conversationHistory

**Subcollection: students/{userId}/reviews**
- reviewId, subtopicId, dueAt, priority, lastReviewedAt, nextDueAt, reviewCount, completed

### **File Structure**

```
src/
├── components/
│   ├── Dashboard/ (ProgressDashboard, StatsHeader, MasteryProgress, etc.)
│   ├── Placement/ (PlacementTestPage, PlacementQuestion, PlacementResults)
│   ├── Topics/ (TopicBrowser, TopicCard, TopicDetail)
│   └── Practice/ (PracticeMode, ReviewMode, ProblemCard)
│
├── services/
│   ├── curriculum.ts
│   ├── progressService.ts
│   ├── xpEngine.ts
│   ├── gatingService.ts
│   ├── placementService.ts
│   ├── recommendationEngine.ts
│   ├── reviewScheduler.ts
│   ├── dashboardService.ts
│   └── firebaseService.ts
│
├── types/
│   ├── curriculum.ts
│   ├── progress.ts
│   ├── attempt.ts
│   └── xp.ts
│
├── utils/
│   ├── formatting.ts
│   ├── validators.ts
│   └── calculations.ts
│
└── hooks/
    ├── useProgress.ts
    ├── useReviewQueue.ts
    └── useXPTracking.ts
```

---

## Development Timeline

### **Day 0: Prep (1-2 hours)**
- Review Phase 1 codebase
- Set up new branches for P0, P1, P2 features
- Update Firebase Firestore schema
- Create TypeScript type definitions

### **Days 1-3: P0 Foundation**

**Day 1:**
- Implement `curriculum.ts` with full CURRICULUM object
- Create type definitions for Subtopic, Topic, Unit
- Build `progressService.ts` with mastery calculation
- Write unit tests for mastery logic

**Day 2:**
- Implement `xpEngine.ts` with all multiplier logic
- Create Firebase schema for student progress
- Wire up progress tracking on each attempt
- Add XP calculation to existing Socratic tutor

**Day 3:**
- Test P0 features end-to-end
- Fix any bugs in mastery/XP calculations
- Prepare for P1 integration

### **Days 4-6: P1 Intelligence**

**Day 4:**
- Implement placement test question bank
- Build React components: PlacementTestPage, PlacementQuestion
- Integrate with Firestore
- Test placement algorithm

**Day 5:**
- Implement `gatingService.ts` with prerequisite checking
- Build TopicBrowser and TopicCard components
- Add lock/unlock UI states
- Test gating with various prerequisites

**Day 6:**
- Implement `recommendationEngine.ts`
- Build KnowledgeFrontier component
- Build ProgressDashboard with sub-components
- Integrate with real student data

### **Days 7-9: P2 Retention (Optional)**

**Day 7:**
- Implement `reviewScheduler.ts` with spaced repetition logic
- Generate test review schedules
- Unit test scheduling algorithm

**Day 8:**
- Build ReviewQueue component
- Build ReviewMode filtered practice view
- Wire up review completion and next due date updates

**Day 9:**
- Polish and bug fixes
- Full end-to-end testing
- Demo and documentation

---

## Feature Rollout & Testing Plan

### **Testing Strategy**

**Unit Tests (P0):**
- Test mastery calculation returns true at 85%+
- Test XP calculation applies time multiplier correctly
- Test gating blocks if prerequisite not mastered
- Test placement algorithm with edge cases

**Integration Tests (P1):**
- Placement test → student gets placed → topics unlock correctly
- Student attempts problem → progress updates → mastery status changes
- Mastery unlocks next topic → gating allows new topic → dashboard updates

**Manual Testing (QA):**
- Test all topic lock/unlock states
- Verify XP calculations with various inputs
- Test placement algorithm edge cases
- Verify review scheduling dates
- Test dashboard on mobile

### **Gradual Rollout**
1. **Internal Testing**: Developers + 5-10 test accounts
2. **Beta (Day 8)**: 20-30 students for 24 hours
3. **Full Release (Day 9)**: All new signups use Phase 2

---

## Success Metrics & KPIs

### **Functional Success**
- 100% of new students complete placement test
- Placement accuracy: 95%+ placed in correct difficulty level
- Prerequisite gating: 0 students able to bypass locked topics
- Mastery rate: average of 85%+ accuracy across all subtopics
- XP calibration: students avoid rushing (>50% at 60-120% of expected time)

### **Learning Outcomes**
- Students master 2-3 subtopics in first 2 weeks
- Review queue engagement: 60%+ of students attempt due reviews
- Retention: 80%+ accuracy on review attempts (demonstrates learning stick)

### **Engagement Metrics**
- Average session length: 15-20 minutes
- Daily active users: 40%+
- Weekly retention: 60%+
- XP earned per day: 40-100 XP (healthy pace)

### **User Satisfaction**
- NPS score: 40+
- Feedback: "Clear what I need to learn next"
- Feedback: "Feels fair that I have to master basics first"

---

## Risk Mitigation

### **Technical Risks**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Prerequisite chains too strict | High | Allow "skip" prerequisites after 5 failed attempts (opt-in) |
| XP feels too easy to farm | High | Anti-gaming penalties implemented; monitor for exploits |
| Placement test inaccurate | High | Allow manual level adjustment from dashboard |
| Review queue overwhelming | Medium | Show only 3 highest-priority items; others in "later" section |
| Firebase rate limiting | Low | Cache progress data; batch updates |

### **Product Risks**

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Students frustrated by locks | High | Clear messaging, friendly prerequisites guide |
| Mastery too hard to achieve | Medium | Lower to 80% if <10% ever master after week 1 |
| Students overwhelmed by dashboard | Medium | MVP: simpler dashboard, polish gradually |
| Review fatigue | Low | Optional reviews (suggested but not required) |

---

## Post-Phase 2 Roadmap (Future)

### **Phase 3: Polish & Scale (Days 10-15)**
- Teacher dashboard and classroom management
- Analytics and performance insights
- Gamification: badges, leaderboards (optional)
- Multi-language support
- Dark mode

### **Phase 4: Advanced Learning (Weeks 3-4)**
- AI-generated problem variants
- Adaptive difficulty based on performance
- Mastery-based grade prediction
- Parent progress notifications
- LMS integrations

### **Phase 5: Mobile App (Weeks 5-8)**
- React Native mobile app
- Offline mode for problems
- Push notifications for reviews
- Mobile-optimized Socratic tutor

---

## Conclusion

Phase 2 transforms the Math Tutor from a tutoring tool into a complete, personalized learning system. By implementing prerequisite gating, mastery-based progression, and intelligent review scheduling, we align with evidence-based learning science and create a sustainable path for 8th graders to build algebraic foundation.

The phased rollout (P0 → P1 → P2) allows for rapid iteration, early validation, and continuous improvement based on student data and feedback.

---

**Document Version:** 2.0  
**Last Updated:** November 4, 2025  
**Next Review:** End of Day 3 (P0 completion checkpoint)  
**Owner:** Product & Engineering  
**Status:** Ready for Development