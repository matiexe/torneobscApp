# Changelog

All notable changes to the **Súper Liga BSC** project will be documented in this file.

## [0.2.0] - 2026-05-14

### Added
- **Live Stream Integration:** Added a dynamic "Live Stream" section on the Home tab that embeds YouTube videos.
- **DB-Driven Streaming:** Added `stream_url` column to the `matches` table in Supabase.
- **Admin Streaming Management:** Updated the admin panel to allow setting and updating YouTube URLs for matches.
- **Dynamic UI:** The streaming panel now automatically hides if no stream URL is provided for the next match.

### Updated
- **Team Logos:** Verified and synchronized the new logo for "PEOR ES NADA".
- **Match Management:** Improved the score update logic in the admin panel.

### Fixed
- **League Branding:** Reverted accidental league logo change to maintain original branding.

---

## [0.1.0] - 2026-05-11

### Added
- Initial project structure with Next.js 16 and Tailwind CSS 4.
- Supabase integration for teams, matches, and players.
- Functional Standings Table with automatic points calculation.
- Top Scorers list.
- Admin panel for managing scores and players.
- Instagram Story generator for upcoming matches.
