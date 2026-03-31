# Green AI Web - UI/UX Design Specification

## 1. Design Philosophy
The design of Green AI Web focuses on **sustainability, clarity, and engagement**. The interface should feel organic, clean, and modern, using a color palette inspired by nature to evoke a sense of environmental responsibility.

## 2. Color Palette
The color scheme is built around a primary green hue, supported by neutral earth tones and clean whitespace.

### Primary Colors
- **Eco Green (Primary)**: `#2E7D32` (Deep, natural green for primary actions, buttons, active states)
- **Leaf Light (Secondary)**: `#81C784` (Lighter green for accents, hover states, success messages)
- **Earth Brown (Accent)**: `#795548` (Warm earth tone for grounding elements, footers, or distinct sections)

### Neutral Colors
- **Pure White**: `#FFFFFF` (Main background, cards)
- **Off White**: `#F5F7FA` (Page background to reduce eye strain)
- **Dark Text**: `#2C3E50` (Primary text for readability)
- **Light Text**: `#607D8B` (Secondary text, metadata)
- **Border Gray**: `#E0E0E0` (Subtle dividers)

### Semantic Colors
- **Success**: `#4CAF50` (Task completion, positive feedback)
- **Warning**: `#FF9800` (Alerts, important notices)
- **Error**: `#F44336` (Form errors, deletion confirmations)
- **Info**: `#2196F3` (Information banners)

## 3. Typography
We will use a modern, sans-serif font stack to ensure readability across all devices.

- **Font Family**: `'Inter', 'Helvetica Neue', Arial, sans-serif`
- **Headings**: Bold, high contrast.
  - H1: 32px / 2.5rem (Page Titles)
  - H2: 24px / 1.75rem (Section Headers)
  - H3: 20px / 1.5rem (Card Titles)
- **Body**: 16px / 1rem (Standard readable size)
- **Small**: 14px / 0.875rem (Captions, hints)

## 4. Iconography
Use **Material Design Icons** (via Element Plus or standard SVG) for consistency.
- **Style**: Rounded, filled or outlined depending on context.
- **Key Icons**: Leaf (Sustainability), Recycle (Reconstruction), Chat (AI Assistant), Trophy (Achievements), Users (Community).

## 5. UI Components & Layout

### Global Layout
- **Navbar**: Sticky top navigation. Logo on left, links in center, user profile/actions on right.
- **Footer**: Simple footer with copyright, quick links, and social icons.
- **Grid System**: Responsive grid (12 columns) adapting to Mobile (<768px), Tablet (768px-1024px), and Desktop (>1024px).

### Key Modules

#### A. User Authentication
- **Login/Register**: Clean, centered card layout.
- **Profile**: Dashboard view with avatar, stats, and editable fields.

#### B. Old Object Reconstruction (旧物重构)
- **Upload Area**: Drag-and-drop zone with preview.
- **Analysis Result**: Card displaying AI analysis, estimated value, and reconstruction ideas.
- **Action**: "Generate Plan" button.

#### C. AI Chat Assistant (AI 聊天助手)
- **Interface**: Chat window (fixed height or expandable).
- **Messages**: Bubbles (Right for user, Left for AI).
- **Input**: Text area with send button.

#### D. Achievements System (成就系统)
- **Badges**: Grid of circular badges. Grayscale for locked, colored for unlocked.
- **Progress Bars**: Visual indicator of progress toward next achievement.

#### E. Community & Leaderboard (活动社区和排行榜)
- **Feed**: List of user posts/activities.
- **Leaderboard**: Ranked list with avatars, names, and scores. Top 3 highlighted.

## 6. Interaction & Animation
- **Hover Effects**: Subtle lift (shadow increase) on cards. Color shift on buttons.
- **Transitions**: Smooth fade-in for page loads (`router-view` transition).
- **Micro-interactions**: Like button heart animation. Loading spinners for AI processing.
- **Animations (GSAP)**:
  - Hero section elements sliding in.
  - Numbers counting up in stats.

## 7. Accessibility (WCAG 2.1 AA)
- **Contrast**: Ensure text/background contrast ratio is at least 4.5:1.
- **Focus States**: Visible outline for keyboard navigation.
- **Alt Text**: All images (especially uploaded ones) must have `alt` attributes.
- **Responsive**: Touch targets at least 44x44px on mobile.
