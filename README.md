# Doc Gen Studio

[![Build](https://github.com/presdec/docgen-studio-desktop/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/presdec/docgen-studio-desktop/actions/workflows/build.yml)
[![Test](https://github.com/presdec/docgen-studio-desktop/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/presdec/docgen-studio-desktop/actions/workflows/test.yml)
[![Release](https://img.shields.io/github/v/release/presdec/docgen-studio-desktop?display_name=tag)](https://github.com/presdec/docgen-studio-desktop/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Turn an Excel spreadsheet and a Word template into hundreds of personalised documents — in one run, on your own machine.**

Doc Gen Studio is a free, open-source desktop app for teams that need to produce contracts, letters, or notices at scale. No cloud subscription. No mail-merge fragility. No Python scripts to babysit. Just load your data, map your fields, and generate.

---

## Why Doc Gen Studio?

- **Your data stays local.** Excel files, Word templates, and generated outputs never leave your machine. No accounts, no uploads, no SaaS billing.
- **Batch in minutes, not hours.** Generate Word docs, PDFs, and email drafts from a single workbook run. One click replaces hours of copy-paste.
- **Safe to hand to anyone.** A guided four-step workflow means non-technical team members can run generation without touching scripts or configuration files.
- **Catch mistakes before you generate.** Live mapping preview, first-row filename preview, and unmapped-token warnings catch errors before a full run.
- **Flexible email output.** Export email drafts as one combined DOCX, individual DOCX files, ready-to-send `.eml` files, or Outlook `.msg` files — whichever fits your workflow.
- **Respects your OS.** Follows your system light/dark theme. Full application menu with keyboard shortcuts.

## Who Is It For?

- Legal, grants, and contracts teams preparing high-volume personalised document sets
- Operations teams replacing fragile mail-merge workflows with a repeatable process
- Small organisations that can't justify a cloud document-automation subscription

## What Can You Do Today?

- Load an Excel workbook, a Word `.docx` template, and an optional email template
- Search existing variables or create new ones directly in the mapping tables
- Build output filenames from workbook fields with a live first-row preview
- Generate DOCX, PDF, and email drafts for every row in one run
- Open, inspect, and share results directly from the app
- Save your project setup and reload it next time

---

## Download

> Pre-built installers are published on every tagged release. Most users should download the latest release rather than build from source.

| Version | Package | Download |
|---------|---------|----------|
| **v0.4.1** *(latest)* | Windows installer | [DocGen-Studio-Setup-0.4.1.exe](https://github.com/presdec/docgen-studio-desktop/releases/download/v0.4.1/DocGen-Studio-Setup-0.4.1.exe) |
| **v0.4.1** *(latest)* | Linux AppImage | [docgen-studio-0.4.1-x86_64.AppImage](https://github.com/presdec/docgen-studio-desktop/releases/download/v0.4.1/docgen-studio-0.4.1-x86_64.AppImage) |
| **v0.4.1** *(latest)* | Linux deb | [docgen-studio-0.4.1-amd64.deb](https://github.com/presdec/docgen-studio-desktop/releases/download/v0.4.1/docgen-studio-0.4.1-amd64.deb) |
| **v0.4.1** *(latest)* | Linux rpm | [docgen-studio-0.4.1-x86_64.rpm](https://github.com/presdec/docgen-studio-desktop/releases/download/v0.4.1/docgen-studio-0.4.1-x86_64.rpm) |
| **v0.4.1** *(latest)* | Linux pacman | [docgen-studio-0.4.1-x64.pacman](https://github.com/presdec/docgen-studio-desktop/releases/download/v0.4.1/docgen-studio-0.4.1-x64.pacman) |

All releases: [github.com/presdec/docgen-studio-desktop/releases](https://github.com/presdec/docgen-studio-desktop/releases)

### Install Instructions

**Windows (`.exe`)**

1. Download `DocGen-Studio-Setup-0.4.1.exe`.
2. Double-click the installer.
3. Follow the setup wizard and launch Doc Gen Studio from the Start menu.

**Linux AppImage**

```bash
chmod +x ./docgen-studio-0.4.1-x86_64.AppImage
./docgen-studio-0.4.1-x86_64.AppImage
```

On Ubuntu or Debian, AppImage may require `libfuse2`:

```bash
sudo apt install libfuse2
```

**Ubuntu / Debian (`.deb`)**

```bash
sudo apt install ./docgen-studio-0.4.1-amd64.deb
```

If `apt` prints a warning about downloading unsandboxed as root for a local file, that is an `apt` local-file warning, not a Doc Gen Studio packaging issue.

**Fedora / RHEL (`.rpm`)**

```bash
sudo dnf install ./docgen-studio-0.4.1-x86_64.rpm
```

**Arch Linux (`.pacman`)**

```bash
sudo pacman -U ./docgen-studio-0.4.1-x64.pacman
```

### Release History

| Tag | Summary |
|-----|---------|
| [v0.4.1](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.4.1) | Generation cancel, unsaved changes guard, skipped rows detail, keyboard shortcuts modal, email validation |
| [v0.4.0](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.4.0) | Inline validation per component, step indicator for issues, clearer copy, Linux no-sandbox fix |
| [v0.3.0](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.3.0) | Workbook setup modal, template inspection modal, file-field clear button, rich preview rows, sticky footer nav, sidebar step navigation, filename pattern preview restored |
| [v0.2.15](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.15) | Quick save/recent projects, docked mapping panel, DOCX email templates, Greek header suggestions, review polish |
| [v0.2.14](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.14) | Variable-first mapping, creatable/searchable field selectors, filename chips show variables |
| [v0.2.13](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.13) | Navigation scroll-to-top, step 1 validation, compact sidebar, rejected row count, MSG recipient fixes |
| [v0.2.12](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.12) | Outlook MSG drafts, row rejection filter, capabilities API, email header fixes |
| [v0.2.11](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.11) | App menu, system theme, Linux AppImage fix, Ubuntu font fix, Python test suite, docs refresh |
| [v0.2.10](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.10) | Email output modes, filename preview and warnings, mapping UX improvements |
| [v0.2.9](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.9) | Worksheet dropdown, first-sheet fallback, header/data row auto-bump, render stability fixes |
| [v0.2.8](https://github.com/presdec/docgen-studio-desktop/releases/tag/v0.2.8) | Filename token picker, Step 2 column assignment, navigation guard |

---

## Development, Source Builds, and Releasing

Contributor and maintainer workflows now live in dedicated docs:

- [Development and source builds](docs/development.md)
- [Packaging runtime contract](docs/packaging-runtime.md)
- [Release notes](docs/release-notes.md)

---

## License

[MIT](LICENSE) © Philip Prescott-Decie

## Support

See [SUPPORT.md](SUPPORT.md) for help options.
