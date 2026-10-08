# High-fidelity design system

All ten requested screens share library-frontend/src/constants/design-system.ts and components/library/ui.tsx.

Palette: Primary/Info #2D7CE9, text #1C283B, background #F5F7F7, card #FAFBFB, border #DDE2E6, secondary text #6C7886; success #25B87A, warning #F7A35C, error #F04F55. Soft status fills supplement these colors; status text stays dark for legibility.
System sans-serif typography: 32 display, 26 title, 18 heading, 14 body, 12 small, 10 caption. Buttons/inputs use 12px radius and at least 48px height; cards use 16px radius. Shared Feather outline icons, header and bottom tabs. Content is mobile-first with a 560px maximum reading width on web.

## Screens
1. / — Onboarding
2. /login — Login
3. /signup — Sign up
4. /home — Home
5. /books/filters — Filters
6. /books — Search results (20 sample titles in demo)
7. /books/[id] — Book details and shelf guide
8. /books/reserve?id=1 — Reserve
9. /books/confirmation — Confirmation after a successful reservation
10. /books/reservations — My reservations
Notifications and Profile also use the same shared theme so bottom navigation stays consistent.

## Preview
From library-frontend run npm.cmd run web. Choose Explore the demo on Onboarding or Login. Demo is visibly labelled, needs no MongoDB or credentials, and never writes to the API. Reserve a sample book to see confirmation and a populated My reservations screen. Cancel it to restore demo inventory. A reload clears demo state.

Login and signup include validation but do not create accounts or claim successful authentication. Live authentication still needs the team's account API; the existing setBookSessionToken adapter remains available. Live book/reservation requests still use the existing backend. The shelf map is an explicitly labelled sample in demo; no invented real shelf location, locker hardware, wallet pass, SMS, or barcode service is claimed.

## Team usage
Import palette/space/radius/typography from constants/design-system and Screen, Button, Field, Card, Badge, Section, Icon from components/library/ui. Do not add screen-specific primary colors or alternate button styles. Route components stay in src/app; shared state is in src/state/library.tsx. Existing backend API files are unchanged.
