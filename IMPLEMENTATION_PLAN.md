# IMPLEMENTATION PLIA

This document is the reference implementation plan for future development tasks in this repo. It focuses on the current scope (frontend demo app) and the Jira backlog items in project CAP.

## 1) Scope & goals

- Stabilize doctor management MVP (prototype) to be a safe, reliable reference for future development.
- Fix destructive edit behavior and support true edit/save/cancel flow.
- Add client-side validation with inline errors.
- Prevent XSS by avoiding unsanitized innerHTML.
- Add persistence via localStorage.
- Create a test plan and regression checklist.

## 2) Jira mapping

- CAP-1: Stabilize Doctor Management MVP
- CAP-2: Non-destructive edit/save/cancel
- CAP-3: Validation + inline errors
- CAP-4: Safe rendering (no untrusted innerHTML)
- CAP-5: localStorage persistence
- CAP-6: Test plan
