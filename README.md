# Memory Bank

Memory Bank is an Expo Android application that helps people living with Alzheimer's and their caregivers keep memories, familiar people, everyday routines and caregiver-entered medication reminders together.

> **Safety:** Memory Bank is a supportive organization tool, not a medical diagnostic or treatment system. Medication schedules must be entered or confirmed by a caregiver or healthcare professional. The app does not give medication advice.

## Features

- Firebase email/password authentication, patient and caregiver roles, and password reset.
- Memory gallery and People I Know cards with optional Firebase Storage photo uploads.
- Daily routines organized by time with completion tracking.
- Caregiver-managed medication reminders with local Expo Notifications and completion status.
- Patient consent and caregiver account linking, profile/settings, validation and error states.

## Requirements and dependencies

- Node.js LTS and npm
- Expo Go for Android or an Android emulator
- Firebase project with Email/Password Authentication, Cloud Firestore and Cloud Storage enabled

The app uses Expo SDK 58, React Native 0.88, React Navigation 7 and Firebase JS SDK 11. Exact dependencies are listed in `package.json`.

## Firebase setup

1. Create a Firebase project and add a Web app.
2. Enable **Authentication → Email/Password**.
3. Create a Cloud Firestore database and enable Cloud Storage.
4. Copy `.env.example` to `.env` and replace its values with the Firebase Web app configuration from **Project settings → General → Your apps → SDK setup and configuration → Config**.
5. Publish `firestore.rules` and `storage.rules` in the Firebase consoles. Rules require patient authorization and caregiver linking before a caregiver can access patient data. Patients can only mark medication entries complete; caregivers manage the schedule.
6. Keep `.env` private and never commit service-account credentials. Review rules before production deployment.

## Run

```powershell
npm install
npm start
```

Scan the Expo QR code with Expo Go. For a network-separated device, run:

```powershell
npm start -- --tunnel ngrok
```

`npm run typecheck` checks the TypeScript sources. Local recurring medication notifications require notification permission on the device.

## Demo data

Collections start empty; no invented patient or medication records are preloaded. For testing, use clearly fictitious people and routines. Do not treat demo medication entries as real instructions.

## Screenshots

Add screenshots captured from an Android device or emulator here.

## Future enhancements

- Verified caregiver invitations and consent management.
- Offline-first synchronization and backups.
- Per-day routines, accessibility testing and additional languages.
- Automated tests with Firebase Emulator Suite and production monitoring.
