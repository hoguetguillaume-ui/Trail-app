# 🏔️ TrailBrain App

> An iOS app that helps trail runners prepare for their races — training plans, pacing, nutrition, and race day guidance — all personalised to their profile.

---

## 🧭 Project Context

- **Owner:** Guillaume Hoguet
- **Stack:** React Native + Supabase (target), currently prototyped as standalone HTML files
- **Platform:** iOS first
- **Figma:** https://www.figma.com/design/ePzlw9IdhhSipHbUnYYWu0/BRAIN-STORMING
- **Built with:** Claude (claude.ai) — non-technical owner using AI-assisted development

---

## 📁 File Structure

```
Trail-app/
├── trail-onboarding.html   # Full onboarding flow (16 screens)
├── trail-profile.html      # User profile / account area
└── README.md               # This file
```

---

## ✅ What Has Been Built

### 1. trail-onboarding.html — Onboarding Flow
16 interactive screens that collect all user criteria:
- Login / Register (email + password, Google & Apple SSO)
- Intro screen
- Connect training apps (Strava, Nike Run, Garmin, Kiprun)
- Weekly training hours picker
- Max session length picker
- Training terrain multi-select (flat, hilly, mountainous…)
- Race type (Existing trail or Custom)
- Race search with autocomplete
- Race date calendar picker
- Time objective dual picker (hours + mins)
- Generating plan loading screen
- Training plan output (week view, workouts, workload stats)

### 2. trail-profile.html — User Profile & Account
The central data layer. All onboarding answers stored in a user object.

User data model:
- name, email
- weeklyHours (number)
- sessionLength (number, hours)
- terrain (string array)
- apps (string array — Garmin, Strava etc.)
- raceType ('Existing trail' or 'Custom one')
- raceName (string)
- raceDate (ISO date string or null)
- timeObjectiveH / timeObjectiveM (numbers or null)

Profile screen features:
- Completion bar showing % of profile filled
- Each criteria row tagged with source (Onboarding badge) + filled/missing dot
- Tap any row opens a bottom sheet editor (pickers, chips, search, calendar)
- Tab bar: Training / Race Day / Progress / Profile

---

## 🗺️ Figma Pages

- Trail app proto onboarding → 16-screen onboarding flow (BUILT)
- Trail app proto training → Weekly plan, workout detail, Apple Watch handoff
- Trail app proto raceday → Live race view, map, splits
- Trail app research → Brainstorming and components

---

## 🚧 Next Steps

- Merge onboarding into profile: onboarding completion writes into user object
- Training plan screens: weekly view + individual workout detail
- Race day screens: live pacing, nutrition, map
- Supabase backend: auth, user table, plan storage
- React Native conversion of HTML prototypes

---

## 💡 How to Continue with Claude

Start any new Claude conversation with:

"I'm building the TrailBrain trail running app. Here is my GitHub repo: https://github.com/hoguetguillaume-ui/Trail-app — please read the README and the existing files so we can continue building."

Claude will read this README, understand the full context, and pick up exactly where we left off.
