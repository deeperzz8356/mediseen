# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

People using an Android phone to understand health scans, find plain-language condition information, generate condition-aware meal guidance, and keep lightweight health activity in one place.

## Product Purpose

MediSeen is an AI-assisted health companion. It helps users upload health imagery for educational interpretation, explore a curated health library, generate nutrition plans, and ask follow-up questions.

## Positioning

MediSeen connects scan interpretation, clinical context, nutrition guidance, and multilingual assistance in one continuous mobile workflow.

## Operating Context

The product is used one-handed on Android phones, often while reading or uploading sensitive health information. Clear hierarchy, familiar native controls, readable results, and explicit medical-safety language are essential.

## Capabilities and Constraints

- Native Android Views and XML layouts under `frontend/android` are the application frontend.
- Existing authentication, guest access, camera/gallery upload, scan analysis, library, diet, profile, language, notification, and assistant flows must remain functional.
- Health information is educational and must not be presented as a diagnosis.
- The web application is outside the scope of native app UI work.

## Brand Commitments

- Product name: MediSeen.
- Preserve the supplied pink pulse logo and the “AI Health Assistant” descriptor.
- The uploaded Android screenshots are the binding visual reference for this implementation.

## Evidence on Hand

- Eighteen supplied Android reference screenshots covering onboarding, authentication, home, scan, diet, library, profile, language, and assistant states.
- Existing native app behavior and copy in `frontend/android/app/src/main`.

## Product Principles

- Make the next useful health action immediately obvious.
- Keep complex health information calm, legible, and structured.
- Preserve user control over permissions, identity, and stored information.
- Use consistent navigation and interaction patterns across every feature.

## Accessibility & Inclusion

Use scalable text, high-contrast body copy, 48dp minimum touch targets, content descriptions, and multilingual layouts that tolerate longer labels.
