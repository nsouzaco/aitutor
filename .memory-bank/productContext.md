# Product Context: AI Math Tutor

## Why This Project Exists

### The Problem

**Students struggle with math but don't develop real understanding:**
- They seek quick answers instead of learning problem-solving processes
- Traditional tutoring is expensive ($40-100/hour) and not always available
- Existing AI math tools (PhotoMath, Symbolab) provide direct solutions
- Getting answers without understanding undermines long-term learning

### The Gap

There's a missing middle ground between:
- **Left:** Struggling alone with homework
- **Right:** Getting instant answers that don't teach

We need a solution that **guides without solving** - helping students develop critical thinking skills.

### The Inspiration

The OpenAI x Khan Academy demo showcased an AI tutor using the Socratic method:
- Never gives direct answers
- Asks guiding questions
- Celebrates small victories
- Adapts to student understanding
- Builds genuine problem-solving skills

## What We're Building

### Core Experience

A conversational AI math tutor that:

1. **Accepts Problem Input**
   - Type it in or upload a photo
   - Handles handwritten and printed math notation
   - Extracts the problem using OCR

2. **Guides Through Socratic Questioning**
   - "What information do we have?"
   - "What are we trying to find?"
   - "What approach might work here?"
   - "Walk me through that step"

3. **Provides Strategic Hints**
   - Detects when student is stuck (2+ uncertain responses)
   - Offers increasingly specific guidance
   - Never solves directly, but narrows the search space

4. **Celebrates Progress**
   - Acknowledges correct steps
   - Uses encouraging language
   - Builds confidence through discovery

### User Journey

**First-Time User:**
```
1. Lands on clean, inviting interface
2. Sees clear prompt: "Let's solve a problem together!"
3. Uploads photo of math problem or types it in
4. AI responds with opening question about the problem
5. Conversation begins
```

**Active Learning Session:**
```
1. Student responds to tutor's questions
2. Tutor validates thinking, asks next guiding question
3. If stuck, tutor provides hint
4. Process continues until student reaches solution
5. Celebration of achievement
6. Option to try another problem
```

**Repeat User:**
```
1. Returns to interface
2. Sees "New Problem" button
3. Immediately ready to start another session
```

## Target Problem Types

### Phase 1 (MVP)

1. **Linear Equations**
   - Example: `2x + 5 = 13`
   - Single variable, straightforward solving

2. **Quadratic Equations**
   - Example: `x² + 5x + 6 = 0`
   - Factoring, quadratic formula

3. **Word Problems**
   - Rate/time/distance
   - Age problems
   - Cost calculations

4. **Geometry**
   - Area and perimeter
   - Volume calculations
   - Angle relationships

5. **Systems of Equations**
   - Two variables
   - Substitution and elimination methods

6. **Fraction Operations**
   - Addition, subtraction, multiplication, division
   - Simplification

### Phase 2 (Future)

- Trigonometry
- Calculus basics (derivatives, integrals)
- Statistics and probability
- Matrices
- Complex numbers

## How It Should Work

### The Socratic Flow

**Stage 1: Inventory**
- "What information are we given?"
- "What do each of these numbers represent?"

**Stage 2: Goal Identification**
- "What is the problem asking us to find?"
- "What does our answer need to look like?"

**Stage 3: Strategy Selection**
- "What mathematical concepts might help here?"
- "Have you solved similar problems before?"

**Stage 4: Step-by-Step Execution**
- "What's our first step?"
- "What happens when we do that?"
- "How does that change our equation?"

**Stage 5: Validation**
- "Does this answer make sense?"
- "Can we check our work?"
- "What do we learn from this?"

### Hint Escalation System

**Level 1: Socratic Question** (Always start here)
- "What operation would help us isolate x?"

**Level 2: Narrowing Question** (After 1 uncertain response)
- "Would adding, subtracting, multiplying, or dividing help?"

**Level 3: Concrete Hint** (After 2+ stuck turns)
- "Try subtracting 5 from both sides. What do you get?"

**Level 4: Worked Example of Similar Step** (If still stuck)
- "Just like when we solved 3y + 2 = 11 by subtracting 2..."

**Never:** Give the complete answer or solve the step for them

## User Experience Goals

### Emotional Experience

**Not:**
- Intimidating
- Judgmental
- Rushed
- Overwhelming

**Instead:**
- Welcoming
- Patient
- Encouraging
- Confidence-building

### Design Principles

1. **Minimal & Clean**
   - Remove distractions
   - Focus on conversation
   - Generous whitespace

2. **Inviting & Approachable**
   - Warm colors (soft indigo, not stark white)
   - Friendly micro-interactions
   - Celebration moments

3. **Learning-Focused**
   - Math equations are beautiful and prominent
   - Clear visual hierarchy
   - Progress is visible and celebrated

### Key Interactions

**Empty State:**
- Should feel inviting, not lonely
- Clear call-to-action
- Simple instructions
- Warm illustration

**During Conversation:**
- Smooth message appearance
- Clear distinction between student and tutor
- Typing indicators for AI
- Math rendered beautifully

**Success Moments:**
- Visual celebration
- Encouraging message
- Smooth transition to next problem

**Stuck Moments:**
- Patient, non-judgmental hints
- Visual differentiation (hint cards)
- Maintains encouraging tone

## What Makes This Different

### Compared to PhotoMath/Symbolab
- ❌ They give answers immediately
- ✅ We guide students to discover answers

### Compared to Human Tutors
- ❌ Expensive ($40-100/hr)
- ✅ Free or low-cost
- ❌ Limited availability
- ✅ Available 24/7
- ✅ Both use Socratic method
- ✅ Both adapt to student

### Compared to ChatGPT/Generic AI
- ❌ Will solve problems if asked
- ✅ Refuses to give direct answers
- ❌ Not specialized for learning
- ✅ Purpose-built for education
- ❌ No visual problem input
- ✅ Image upload with OCR

## Success Indicators

### Quantitative
- Session duration >5 minutes (engagement)
- 90%+ problem completion rate
- <3 hints needed per problem (optimal guidance)
- 5+ message exchanges per problem (deep thinking)

### Qualitative
- Students report feeling "helped but not given answers"
- Users describe experience as "encouraging"
- Students attempt harder problems over time
- Positive sentiment in feedback

## Known Challenges

1. **Student Frustration**
   - Some students just want answers
   - Need clear messaging about learning approach
   - Must balance guidance with independence

2. **Prompt Engineering**
   - LLMs naturally want to be helpful (solve problems)
   - Requires careful system prompts
   - Need extensive testing to prevent answer-giving

3. **OCR Limitations**
   - Handwriting varies widely
   - Complex notation can be ambiguous
   - Need fallback for poor quality images

4. **Adaptive Difficulty**
   - Hard to gauge student level from one problem
   - Questioning should adapt dynamically
   - May need user to select grade level

