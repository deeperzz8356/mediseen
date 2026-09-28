---
name: MediSeen Android
description: Calm, high-clarity native health guidance with a precise violet-to-pink brand accent.
colors:
  primary-violet: "#8140F6"
  primary-violet-deep: "#5020BD"
  action-pink: "#F4547B"
  health-green: "#0EC69B"
  information-blue: "#4B9CF7"
  navigation-navy: "#0A1429"
  ink: "#0D172C"
  muted-ink: "#66758B"
  quiet-ink: "#9AA7B8"
  canvas: "#F3F6FF"
  surface: "#FFFFFF"
  surface-subtle: "#F8FAFD"
  hairline: "#E8ECF3"
typography:
  headline:
    fontFamily: "Roboto, sans-serif"
    fontSize: "25sp"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Roboto, sans-serif"
    fontSize: "20sp"
    fontWeight: 700
  body:
    fontFamily: "Roboto, sans-serif"
    fontSize: "15.5sp"
    fontWeight: 400
    lineHeight: 1.22
  label:
    fontFamily: "Roboto, sans-serif"
    fontSize: "11sp"
    fontWeight: 700
rounded:
  control: "16dp"
  card: "22dp"
  hero: "30dp"
spacing:
  xs: "8dp"
  sm: "12dp"
  md: "20dp"
  lg: "24dp"
components:
  button-primary:
    backgroundColor: "{colors.primary-violet}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "58dp"
    padding: "4dp 16dp"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "21dp 20dp"
  input:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "56dp"
---

# Design System: MediSeen Android

## Overview

**Creative North Star: "The Calm Clinical Companion"**

MediSeen uses familiar Material structure with a bright, reassuring health identity. Large navy headings and generous spacing reduce cognitive load; white elevated surfaces organize tasks without making the app feel institutional. Violet and pink are reserved for selected states and primary actions.

**Key Characteristics:**

- Pale blue-to-lilac canvas with crisp white task surfaces.
- Navy active navigation and high-contrast headings.
- Violet-to-pink primary actions; green and blue are feature-specific supporting accents.
- Large touch targets and compact, readable information groups.

## Colors

The palette is restrained: calm cool neutrals carry most screens while saturated brand colors identify action and state.

**The Saturation Budget Rule.** Use strong violet or pink for a single primary action or selected state in each region; routine information stays neutral.

## Typography

**Display Font:** Roboto with the Android sans-serif fallback
**Body Font:** Roboto with the Android sans-serif fallback

The hierarchy is direct and practical: bold, tightly tracked headlines; medium-size body copy; small uppercase labels only where they communicate status or category.

**The Two-Step Scan Rule.** Every screen must expose an obvious bold heading and a clearly quieter body level before any controls.

## Layout

Compact phones use a five-destination Material bottom navigation bar and an 88dp branded header. Screen content uses 20dp horizontal gutters, 14–24dp vertical rhythm, and full-width task surfaces. Measurement groups and shortcut collections use equal-width rows to keep primary actions above the fold. Expanded-width navigation remains an open decision.

## Elevation & Depth

Depth is ambient and functional. Cards use a low soft Material elevation; the hero and active navigation rely on tonal contrast. Avoid stacking borders and shadows on the same surface.

## Shapes

Controls use 16dp corners, cards use 22dp corners, and feature heroes use 30dp corners. Small status controls may be circular or pill-shaped. Navigation active indicators use an 18dp rounded rectangle.

## Components

### Buttons

- Primary actions are 58–60dp tall with bold white text and the violet-to-pink brand gradient.
- Secondary actions are white with navy text and a quiet hairline outline.

### Chips

- Chips use subtle surfaces, 12dp corners, and a 44dp minimum height for selections.

### Cards / Containers

- White or softly tinted surfaces use 22dp corners, 20dp horizontal padding, and low ambient elevation.
- Dark feature heroes use the navy-to-deep-violet gradient with white content.

### Inputs / Fields

- Inputs use a pale neutral fill, 16dp corners, navy text, and a violet focused outline.

### Navigation

- Five compact destinations remain visible on primary screens.
- The selected destination uses a navy rounded indicator with white icon and label; inactive destinations use muted blue-gray.

## Do's and Don'ts

### Do:

- **Do** keep primary actions visible without unnecessary scrolling on task-entry screens.
- **Do** preserve at least 48dp touch targets and readable multilingual labels.
- **Do** use the supplied MediSeen pulse logo and branded header consistently.

### Don't:

- **Don't** introduce a second competing primary action in the same region.
- **Don't** use saturated accents as general card backgrounds or long-form text colors.
- **Don't** replace native Android back, navigation, permission, or dialog behavior with web-like controls.
