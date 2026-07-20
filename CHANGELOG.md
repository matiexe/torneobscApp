# Changelog

All notable changes to the **Súper Liga BSC** project will be documented in this file.

## [0.3.1] - 2026-07-20

### Added
- **Match Modification in Admin:** Added full functionality in the admin panel to modify existing match scores, filter matches (All, Pending, Finished), and revert matches back to pending status.

### Removed
- **Official Fixture Image:** Removed the official fixture image card and modal viewer from the public interface as requested.

---

## [0.3.0] - 2026-07-20

### Added
- **Segunda Ronda & Eliminatorias Fixture:** Added all 10 regular second round matches and 3 playoff phase matches (1RO vs 4TO, 2DO vs 3ERO, and Final) to Supabase database.
- **Official Fixture Image Integration:** Added official graphic asset `segundaRonda.jpeg` to the public directory and built an interactive modal viewer and download option in the Fixture tab.
- **Standings & Admin Filtering:** Filtered playoff placeholder teams from regular league standings and admin player dropdowns.

---

## [0.2.3] - 2026-05-14

### Fixed
- **Build Error:** Fixed a syntax error in the admin page caused by code duplication during previous updates.

---

## [0.2.2] - 2026-05-14

### Updated
- **Player Delete Button:** Enhanced UX for the player delete button in the admin panel by adding a loading state and distinct red styling.

---

## [0.2.1] - 2026-05-14

### Added
- **Dedicated Stream Save Button:** Added a specific button to save only the transmission URL in the admin panel.

### Fixed
- **Partial Updates:** Improved the admin logic to allow updating the stream URL without affecting match scores or status.

---

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
