
# Brand Style Guide: Tassy 2026 (WCWR Inspired)

This document outlines the design system derived from the "West Coast Wilderness Railway" aesthetic. 
The goal is to evoke a premium heritage feeling combined with rugged wilderness adventure.

## 1. Color Palette

The palette is derived from the Tasmanian landscape: deep rainforest greens, railway iron rust, steam engine charcoal, and heritage paper tones.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-wilderness` | `#1B3B36` | Primary Brand Color (Deep Green) |
| `--color-wilderness-light` | `#2D564F` | Hover states, secondary accents |
| `--color-heritage-rust` | `#C06C47` | Primary CTA, Accents, Highlights (Copper/Rust) |
| `--color-steam` | `#1A1A1A` | Main Text, Headings (Charcoal) |
| `--color-paper` | `#F8F6F2` | Page Background (Warm off-white) |
| `--color-paper-dark` | `#EBE7DE` | Secondary Backgrounds, Cards |
| `--color-stone` | `#8C8C8C` | Muted Text, Borders |
| `--color-white` | `#FFFFFF` | Card Backgrounds, High Contrast Text |

## 2. Typography

We use a strong serif for headings to convey history and a clean geometric sans-serif for modern readability.

*   **Headings**: `Playfair Display` (Serif)
    *   Usage: Editorial, elegant, historical.
    *   Weights: 700 (Bold), 400 (Regular/Italic).
*   **Body**: `Lato` (Sans-serif)
    *   Usage: UI elements, long-form text.
    *   Weights: 400, 700.
*   **Utility**: `JetBrains Mono`
    *   Usage: Flight numbers, dates, coordinates.

## 3. UI Patterns & Shape Language

*   **Border Radius**: `4px` (Slightly rounded, mostly structured/industrial).
*   **Shadows**: Gentle, diffused shadows to lift cards from the "paper" background.
    *   `--shadow-card`: `0 2px 8px rgba(0,0,0,0.08)`
    *   `--shadow-hover`: `0 8px 24px rgba(0,0,0,0.12)`
*   **Buttons**:
    *   **Primary**: Solid Rust background, White text, Uppercase label tracking (letter-spacing).
    *   **Secondary**: Transparent background, 1px Solid Border (Wilderness color), Dark text.
*   **Spacing**:
    *   Generous whitespace.
    *   "Block" layout: clearly defined sections with padding `4rem` to `8rem`.

## 4. Components

*   **Cards**: White background on Paper/Stone surface. Subtle border (`1px solid #E5E5E5`). Content padding `2rem`.
*   **Navigation**: Sticky, White/Paper background with distinct border-bottom. Logo prominently serif.
*   **Hero**: Full-bleed images. Gradient overlays (dark at bottom) to ensure text legibility.
