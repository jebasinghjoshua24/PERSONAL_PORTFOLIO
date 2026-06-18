# Portfolio — Jebasingh Joshua

Personal portfolio website for a systems architect and generalist developer. Built with vanilla JavaScript, Three.js, and CSS custom properties.

**Live:** https://gleeful-malasada-b193fb.netlify.app/

## Features

- **Protocol Sigma** — an interactive 4-module puzzle game hidden within the page. Solve wire tracing, Caesar cipher, pattern memory, and logic gate challenges to unlock a rewards system.
- **Theme Studio** — unlocked by completing Protocol Sigma. Choose from 5 preset color palettes or create a fully custom theme using the built-in color picker. Changes persist via localStorage.
- **Konami Terminal** — press Up Up Down Down Left Right Left Right B A anywhere on the page to activate a full-screen terminal interface. Navigate the portfolio sections via commands like `about`, `skills`, `projects`, and `contact`.
- **Three.js Background** — dynamic 3D shapes with subtle float animation in the game overlay.
- **Light/Dark Mode** — toggleable theme with smooth CSS transitions.
- **Scroll Reveal** — sections animate into view as you scroll.
- **Contact Form** — client-side validation with helpful error feedback.

## How to Run

Open `index.html` in any modern browser. No build step or server required.

To explore the hidden features:

1. Click the diamond button in the footer or triple-click the nav logo to open the game overlay.
2. Start Protocol Sigma and solve the 4 modules to unlock the Theme Studio.
3. Or press the Konami code (Up Up Down Down Left Right Left Right B A) to launch the terminal.

## Project Structure

```
index.html       — Main HTML document
style.css        — All styles including game UI and themes
script.js        — Application logic, game engine, theme engine, terminal
README.md        — This file
```

## Stack

- Vanilla JavaScript (no frameworks)
- Three.js (r128) for 3D background
- CSS Custom Properties for dynamic theming
- localStorage for persistence

## Easter Eggs

- Protocol Sigma: a 4-module puzzle game
- Theme Studio: custom color palette editor (unlocked via game completion)
- Konami Terminal: full-screen CLI for navigating the portfolio
- Hidden badge icon appears in the nav after game completion
