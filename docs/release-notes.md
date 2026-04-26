# Release Notes

## v0.2.6 (2026-04-26)

### Highlights
- Rebranded product experience to Doc Gen Studio across desktop packaging and docs.
- Stabilized tag-based release publishing in GitHub Actions.
- Improved runtime packaging behavior to keep release artifacts platform-focused.

### Changed
- CI release workflow now syncs package version from git tag (`vX.Y.Z` -> `X.Y.Z`) before packaging.
- Linux release jobs install required packaging dependency (`libarchive-tools`) for electron-builder targets.
- Runtime build now prunes non-target runtime folders during build to avoid bundling irrelevant binaries.
- README rewritten for Doc Gen Studio positioning and release behavior clarity.

### Fixed
- Resolved missing expected release-tag publication behavior caused by tag/version mismatch.
- Corrected release command path so publish behavior is consistently applied by matrix target.

## Unreleased

### Added
- Configurable output filename pattern for DOCX/PDF generation.
- Output filename pattern editor moved into Field Mapping workflow.
- Filename placeholders are now treated as first-class mapping variables.

### Improved
- Setup page Load Check now focuses on workbook validation even before selecting a Word template.
- Workbook mapping usage badges now clearly indicate `[WORD Field]` usage.
- Setup Check section is collapsible with compact aggregate status (for example, `10/10 Checks Pass`).

### Notes
- If output filename pattern uses plain text only, no extra filename placeholder mappings are required.
