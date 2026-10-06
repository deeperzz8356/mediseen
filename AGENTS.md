# Workspace rules

- This is an Android-first project. Treat `frontend/android` (Jetpack Compose/Kotlin) as the application frontend.
- For UI or application changes, work only in the native Android Jetpack code under `frontend/android`.
- Backend work belongs under `backend` and shared Python modules used by it.
- Do not edit the React/Next.js application under `frontend/app`, or other web frontend files, unless the user explicitly asks for a React, Next.js, or web change.
- When a request says “app,” “frontend,” “screen,” “navigation,” or “UI” without naming a platform, implement it in Jetpack Compose, not React/Next.js.

