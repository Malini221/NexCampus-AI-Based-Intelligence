# NexCampus: AI-Powered Campus Incident Intelligence

> **Turning scattered student complaints into actionable campus incidents.**

## 1. The Problem — What Does a Student Actually Experience?

Imagine a student staying in a hostel.

One evening, the tube light in her room starts flickering. She submits a complaint:

> "Room light is flickering continuously."

The next day, another student from the same floor reports:

> "Light near Room 214 is sparking sometimes."

A third student reports:

> "There is an electrical problem in our hostel corridor."

To the student complaint system, these may appear as **three separate tickets**.

But in reality, they may all point to **one underlying electrical fault**.

Now imagine this happening across an entire campus:

* 20 students report the same Wi-Fi problem.
* 15 students report water leakage in the same hostel block.
* 10 students report the same broken laboratory equipment.
* Several students report the same unsafe electrical condition using completely different words.

Traditional complaint portals usually store these as independent tickets.

### The result?

Administrators see:

**45 complaints**

when the campus may actually have:

**4 real incidents.**

This creates unnecessary workload for administrators and makes it difficult to identify which problems are genuinely important.

There is another problem.

Suppose a hostel has a water supply issue every three months. Each time, students submit new complaints. Once the issue is marked resolved, the previous complaints become historical records rather than useful intelligence.

The system knows that students complained repeatedly.

But it does not necessarily recognize:

> **"This problem keeps coming back. Preventive maintenance may be required."**

### NexCampus addresses this gap.

Instead of treating every complaint as an isolated ticket, NexCampus attempts to understand:

**What is the actual problem?**

**How serious is it?**

**Has somebody already reported the same problem?**

**Is this problem recurring?**

**Does it require immediate attention?**

---

# 2. What is NexCampus?

NexCampus is an **AI-powered campus incident intelligence platform** that transforms unstructured student complaints into structured, prioritized incidents.

The platform introduces an intelligence layer between:

**Student Complaint → AI Analysis → Incident → Department → Resolution**

When a student submits a complaint, NexCampus analyzes the text to determine its:

* Category
* Severity
* Similarity to existing incidents
* Safety risk
* Priority
* Potential recurrence

Instead of sending administrators a raw stream of complaints, NexCampus attempts to provide a **curated view of the actual problems affecting the campus**.

---

# 3. How NexCampus Works — A Real Student Example

Consider this scenario.

### Step 1 — A student reports a problem

A hostel student submits:

> "Hostel B block bathroom la water leak aguthu. Third floor full ah water varala."

The complaint contains a mixture of English and Tamil transliteration (**Tanglish**).

The student does not need to write a formal English description.

---

### Step 2 — NexCampus understands the complaint

The complaint is converted into a semantic representation using **Sentence-BERT (SBERT)**.

The system can compare the meaning of the complaint with existing incidents.

For example, an existing incident might contain:

> "No water supply in B Block third-floor bathrooms."

Even though the wording is different, both complaints describe a similar underlying problem.

---

### Step 3 — Duplicate complaints are detected

Suppose five more students report:

> "B block third floor water problem."

> "Bathroom water is not coming in B block."

> "Third floor hostel water supply is gone."

Instead of creating five unrelated incidents, NexCampus can identify their semantic similarity and associate them with the same underlying incident.

### Before NexCampus

```text
Complaint 1 ── Ticket 101
Complaint 2 ── Ticket 102
Complaint 3 ── Ticket 103
Complaint 4 ── Ticket 104
Complaint 5 ── Ticket 105
```

### With NexCampus

```text
Complaint 1 ─┐
Complaint 2 ─┤
Complaint 3 ─┼──► One underlying incident
Complaint 4 ─┤
Complaint 5 ─┘
```

This allows administrators to understand the **true impact of the problem** instead of simply counting tickets.

---

# 4. AI-Powered Severity Analysis

NexCampus does not only ask:

> "What category does this complaint belong to?"

It also asks:

> **"How urgently should this problem be handled?"**

For example:

### Complaint A

> "Classroom fan is making noise."

Possible priority:

**Low / Moderate**

---

### Complaint B

> "Hostel bathroom water supply is not working for the entire floor."

Possible priority:

**High**

because the issue affects an essential service and multiple students.

---

### Complaint C

> "There is a spark coming from the electrical board in our hostel room."

Possible priority:

**Critical**

because the complaint contains a potential safety hazard.

The intelligence layer assigns a risk score and provides the reasoning behind the assessment.

Example:

```text
Risk Assessment

Priority: CRITICAL
Risk Score: 86 / 100

Signals detected:
• Electrical safety hazard
• Potential immediate danger
• Hostel environment

Recommended Action:
Escalate immediately to the responsible
maintenance/safety department.
```

This makes the AI decision more understandable to administrators instead of presenting only an unexplained label.

---

# 5. Safety Override

AI confidence should never be the only factor used for safety-critical complaints.

Imagine a student writes:

> "Room switch board la spark varuthu."

Even if the classification model is uncertain about the complaint category, the system should not simply treat it as an ordinary maintenance request.

NexCampus therefore includes a **deterministic safety rule layer** outside the machine-learning model.

It looks for safety-related patterns such as:

* Sparks
* Gas leaks
* Exposed wiring
* Electrical shocks
* Fire
* Dangerous conditions

When a potential safety hazard is detected, the system can escalate the complaint regardless of the model's confidence.

### Why?

Because:

> **A safety-critical complaint should not wait for an AI model to be certain that it is dangerous.**

---

# 6. Understanding Tanglish and Hinglish Complaints

Students do not always report problems in formal English.

A real student might write:

> "WiFi romba slow ah iruku."

or:

> "Hostel bathroom la water varala."

or:

> "Lab PC start aagala."

or:

> "Classroom fan work aagala."

These are natural ways students communicate on Indian campuses.

NexCampus is designed to support **code-mixed complaint text**, including Tanglish/Hinglish-style expressions.

A future fine-tuned BERT-based classifier can learn these campus-specific language patterns and classify complaints based on their actual meaning rather than requiring students to write perfectly structured English.

---

# 7. Recurring Problem Detection

Now consider a different scenario.

A hostel water problem occurs in January.

Students complain.

The maintenance team fixes it.

The incident is closed.

Three months later:

> The same hostel block experiences another water supply failure.

A normal complaint system may simply create another new ticket.

NexCampus keeps the historical incident information available for analysis.

Over time, recurring patterns can be identified:

```text
January
   ↓
Water Supply Issue
   ↓
Resolved
   ↓
April
   ↓
Water Supply Issue
   ↓
Resolved
   ↓
July
   ↓
Water Supply Issue
```

This pattern can become a signal:

> **Recurring maintenance problem detected.**

Instead of continuously responding to emergency complaints, administrators can consider preventive maintenance.

The same approach can identify recurring issues such as:

* Hostel water failures
* Repeated electrical problems
* Laboratory equipment failures
* Frequent Wi-Fi outages
* Recurring classroom infrastructure problems

---

# 8. Student-Confirmed Resolution

Consider another common situation.

A student reports:

> "Hostel room fan is broken."

The maintenance department marks the complaint as:

**Resolved**

But the fan is still not working.

The student should not have to create a completely new complaint.

NexCampus introduces a student verification step.

```text
Complaint Submitted
        ↓
Department Assigned
        ↓
Issue Resolved
        ↓
Student Verifies Resolution
        ↓
 ┌───────────────┐
 │               │
Fixed         Not Fixed
 │               │
Closed        Reopened
                 ↓
          Reassigned / Escalated
```

This creates a feedback loop between the department and the student.

The goal is not simply:

> **"Ticket closed."**

but:

> **"Problem actually solved."**

---

# 9. Proposed System

NexCampus inserts an intelligence layer between the complaint form and the administrative workflow.

```text
Student Complaint
       ↓
Text Processing
       ↓
Sentence-BERT Embedding
       ↓
Similarity Search
       ↓
Duplicate / Existing Incident Detection
       ↓
BERT Classification
       ↓
Category + Severity
       ↓
Safety Rule Override
       ↓
Priority Assessment
       ↓
Department Routing
       ↓
Resolution
       ↓
Student Verification
       ↓
Historical / Recurrence Analysis
```

The final objective is to transform:

**Raw complaints → Meaningful incidents → Prioritized action**

---

# 10. Technology Stack

NexCampus uses purpose-built machine-learning components rather than relying on a general-purpose LLM for every decision.

| Technology            | Purpose                                      |
| --------------------- | -------------------------------------------- |
| React                 | Student and admin web interface              |
| TypeScript            | Type-safe frontend development               |
| FastAPI               | Backend API and orchestration                |
| PostgreSQL            | Application and incident data storage        |
| pgvector              | Semantic similarity search                   |
| Supabase              | Database, authentication and storage         |
| Sentence-BERT         | Complaint embeddings and semantic similarity |
| DistilBERT / TinyBERT | Category and severity classification         |
| Pandas / NumPy        | Analytics and data processing                |
| Recharts              | Dashboard visualizations                     |
| Vercel / Render       | Deployment                                   |

### Why BERT instead of a general-purpose LLM?

NexCampus focuses on structured classification and similarity tasks.

For example:

```text
Complaint
    ↓
Category
    ↓
Severity
    ↓
Similarity
    ↓
Priority
```

These tasks have relatively well-defined outputs.

A smaller self-hosted model can therefore provide:

* Lower operational cost
* No dependence on paid external LLM APIs
* Faster inference
* More predictable outputs
* Greater control over model behavior
* Easier auditing of classification decisions

The architecture is also designed so that the current prototype intelligence layer can later be replaced with a trained model.

---

# 11. System Architecture

```text
                    ┌──────────────────────┐
                    │   Student / Admin    │
                    │     React + TS       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │ Backend / Workflow   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌──────────────┐  ┌─────────────┐
       │ Supabase   │   │ BERT Model   │  │  pgvector   │
       │ Auth/Store │   │   Server     │  │ Similarity  │
       └────────────┘   └──────┬───────┘  └──────┬──────┘
                               │                 │
                               └────────┬────────┘
                                        ▼
                              ┌──────────────────┐
                              │ Intelligence     │
                              │ Engine            │
                              ├──────────────────┤
                              │ • Classification │
                              │ • Clustering     │
                              │ • Risk Scoring   │
                              │ • Safety Rules   │
                              │ • Recurrence     │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┼─────────────────┐
                    ▼                  ▼                 ▼
             Department Queue     SLA Engine       Student Tracking
                    │                  │                 │
                    └──────────────────┼─────────────────┘
                                       ▼
                              Management Dashboard
```

---

# 12. Impact

NexCampus changes the way a campus can interpret complaints.

### Without intelligence

```text
100 complaints
      ↓
100 tickets
      ↓
Manual triage
      ↓
Difficult to identify real problems
```

### With NexCampus

```text
100 complaints
      ↓
Semantic analysis
      ↓
Duplicate detection
      ↓
Severity assessment
      ↓
Safety escalation
      ↓
Incident clustering
      ↓
Prioritized department queue
      ↓
Recurrence intelligence
```

The goal is to help administrators prioritize based on **actual impact rather than complaint volume**.

---

# 13. Scalability

Although NexCampus is designed around campus complaints, the underlying intelligence pipeline can be applied to other domains where many users report variations of the same underlying problem.

Potential applications include:

* Corporate IT helpdesks
* Municipal civic complaint systems
* Hospital facility management
* University maintenance systems
* Residential community management
* Public infrastructure reporting

The core idea remains the same:

> **Many reports do not always mean many problems.**

Semantic understanding can help identify the underlying incidents hidden inside large volumes of unstructured complaints.

---

# 14. Key Features

### 🤖 AI Complaint Intelligence

Analyzes complaint text to extract meaningful signals.

### 🔎 Semantic Duplicate Detection

Identifies complaints describing the same underlying issue even when their wording differs.

### 📊 Severity & Risk Assessment

Prioritizes incidents based on severity and potential impact.

### 🚨 Safety Override

Escalates safety-critical complaints independently of model confidence.

### 🌐 Code-Mixed Language Support

Designed for Tanglish/Hinglish-style student complaints.

### 🔁 Recurrence Mining

Uses historical incidents to identify recurring campus problems.

### 🎯 Intelligent Prioritization

Helps departments focus on incidents with greater real-world impact.

### ✅ Student-Confirmed Resolution

Allows students to verify whether an issue has actually been fixed.

### 📈 Management Analytics

Provides visibility into hotspots, recurring issues and incident patterns.

---

# 15. The Core Idea

NexCampus is built around a simple observation:

> **A campus does not have as many problems as it has complaints.**

Ten students may complain about one broken water pipeline.

Twenty students may complain about one Wi-Fi outage.

Five students may report one electrical hazard.

The challenge is not simply collecting these complaints.

The challenge is **understanding what they represent**.

NexCampus attempts to bridge that gap by converting:

**Complaints → Signals → Incidents → Priorities → Action → Prevention**

---

# 16. Future Development

The current intelligence layer is designed as a foundation for future machine-learning development.

Planned improvements include:

* Training the BERT classifier on real campus complaint datasets
* Expanding Tanglish/Hinglish training data
* Improving semantic duplicate detection
* Learning campus-specific terminology
* Improving explainable severity prediction
* Advanced recurrence prediction
* Department workload analytics
* Automated SLA prioritization
* Historical hotspot prediction
* Preventive-maintenance recommendations

The long-term goal is to move from simply responding to complaints toward **predicting and preventing recurring campus problems**.
