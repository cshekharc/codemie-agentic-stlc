# Implementation Plan - codemie-agentic-stlc

This document is the repo-reference planning baseline for future development tasks. It features prioritized enhancements, phasing, acceptance criteria, testing, and roll-out guidance.

## 1) Context and Objective

### Current State (as in repository today)
- Single-page static HTML app in `_index.html_`.
- Manages an in-memory array of Doctor records (add/view/edit/delete).
- No backend, no persistence (data resets on refresh), no authentication/authorization, no tests or CCI.

### Target Outcome (application planning goal)
- Fix functional gaps and make the demo reliable (e.g., edit flow, data persistence).
- Improve UX/accessibility and set a clean foundation for future feature development.
- Introduce a basic Appointment MVP aligned to the demo constraints (local-only storage, clinic admin user).

## 2) In-scope vs Out-of-scope

### In-scope
1. Doctor management fixes (edit workflow, validation, UX)
2. Local persistence via browser storage (localStorage)
- Minimal Appointment MV (booking, conflicts, cancel)
- Engineering baseline (structure, lint/format, CCI)

## Out-of-scope (for now)
- Server backend, multi-user support, server-side database persistence
- Full patient profile management and PHI/regulated compliance beyond “basic standard privacy“
- Payments, notifications, audit trails

# 3) Assumptions and Constraints
- Target user: Clinic Admin
- Demo remains purely static (runs via simple static hosting)
- Data stored locally in the browser
- Fixed appointment slots per doctor (initially)

# 4) Gap Analysis (Current vs Needed)
## Functional gaps
- Edit flow currently deletes records (and depends on confirm dialog)
- No persistence; state resets on refresh
- No appointment booking workflow

## UX / Accessibility gaps
- Uses alert()/confirm() for validation and destructive actions
- Limited keyboard/focus management
- Limited inline, field-level validation

## Engineering gaps
- Monolithic index.html with inline JS/CSS
- No tests, no lint/format, no CI

# 5) Proposed High-Level Architecture (static demo)
- UI: Single-page app (still static) split into:
  - index.html (structure)
  - styles.css (styling)
  - app.js (UI & event wiring)
  - storage.js (localStorage read/write)
  - domain.js (Doctor/Appointment operations)
- Persistence: localStorage keys (namespaced)
  - codemie_stlc/doctors
  - codemie_stlc/appointments
  - codemie_stlc/meta (e.g., nextId)

## 6) Data Model
## Doctor
- id: number
- name: string
- specialization: string
- experience: number
- availability: "active" | "inactive"

## Appointment (MVP)
- id: number
- doctorId: number
- slot: string (e.g., "09:00 - 09:30")
- date: string (ISO yyyy-mm-dd) OR implicit "today" (decision required)
- status: "booked" | "canceled" (optional for MVP)

# 7) Phased Implementation Plan

## Phase 0 — Planning/Setup
Tasks
- Confirm appointment date requirement (date vs today-only)
- Confirm definition of fixed slots (existing UI has three hard-coded slots)
- Decide minimal tooling (lint/format) that fits static hosting

Deliverables
- Updated IMPLEMENTATION_PLAN.md (this file) if decisions change

## Phase 1 — Fix Doctor Edit Workflow (Bug)
Tasks
- Introduce edit mode state (editingDoctorId)
- Change CTA from “Add Doctor” to “Save Changes” when editing
- Add “Cancel” button to exit edit mode
- Update doctor in-place; do not delete on edit

Acceptance criteria
- Editing does not trigger delete confirmation
- Save updates same id; Cancel reverts without changes

Validation
- Manual test: add -> edit -> cancel -> ensure unchanged
- Manual test: add -> edit -> save -> ensure updated and id stable

## Phase 2 — Local Persistence for Doctors (Story)
Tasks
- Implement storage helpers (load/save)
- Hydrate doctors on page load
- Persist on add/edit/delete
- Add “Reset demo data” (with confirmation)
- Add safe fallback for malformed data

Acceptance criteria
- Refresh retains state
- Reset clears data and UI(
Validation
- Manual test: add doctors -> refresh -> verify
- Corrupt localStorage -> reload -> app still works

## Phase 3 — UX/Accessibility Improvements (Story)
Tasks
- Replace alert() with inline validation messages
- Replace confirm() with in-page modal for delete
- Keyboard & focus management:
  - Focus trap in modal
  - Return focus to triggering element after close
  - After add/save/delete, announce status via aria-live region

Acceptance criteria
- No browser alert/confirm used for validation/delete
- Keyboard-only flow works

Validation
- Manual a11y checks (tab order, focus visible, modal escape)

## Phase 4 — Appointment MVP

Tasks
- Add appointment form:
  - Select doctor (active only)
  - Select slot (fixed list)
  - Select date (if required)
- Add appointment list view
- Implement conflict prevention:
  - Disallow same doctorId + slot (+ date) duplicate
- Allow cancel appointment
- Persist appointments in localStorage

Acceptance criteria
- Booking works, conflict Prevented, cancel works
- Inactive doctor cannot be booked

Validation
- Manual test: book same slot twice -> blocked
- Manual test: mark doctor inactive -> cannot book

## Phase 5 — Engineering Foundations (Task)
Tasks
- Split index.html inline JS/CSS into separate files
- Add lint/format configuration (e.g., ESLint + Prettier) OR minimal formatter
- Add GitHub Actions workflow:
  - Run lint/format checks on PR/push

Acceptance criteria
- App remains runnable as static site
- CI passes on PR

Validation
- Run checks locally
- Verify workflow runs in GitHub Actions

# 8) Risks and Mitigations
- Risk: localStorage data corruption
  - Mitigation: schema/version checks; try/catch and fallback
- Risk: appointment date requirement unclear
-  - Mitigation: implement with date picker (default today), store ISO date
- Risk: scope creep beyond static demo
  - Mitigation: keep out-of-scope items explicitly excluded

# 9) Rollout Plan
- Feature development via small PRs mapped to tasks/stories
- Each PR includes:
  - Updated docs (if needed)
  - Manual test notes
- Optional: Tag demo releases for milestones (v0.1, v0.2, ...)

# 10) Reviewer Checklist
- Edit flow updates in-place; no delete side effects
- Persistence works and is namespaced
- No alert/confirm for validation/delete
- Appointment conflict logic correct
- Static hosting compatibility preserved
- CI workflow green
