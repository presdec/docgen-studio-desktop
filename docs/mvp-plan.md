# Desktop MVP Plan

## Product goal

Build a calm Windows desktop tool that lets a non-technical user:

- choose an Excel workbook
- choose a Word contract template
- map placeholders to workbook columns
- build or load an email template
- generate DOCX files, PDFs, and email drafts
- review outputs without touching a terminal

The product should stay local-first and workflow-first. It is not a SaaS platform, shared workspace, or online document editor.

## Current app state

The app is already past the initial shell stage.

Implemented now:

- Electron + Vite + React desktop shell
- file pickers and project save/load
- workbook inspection through Python
- DOCX placeholder detection
- setup sanity check with sample workbook rows
- contract placeholder mapping step
- email template builder with field insertion
- email preview using workbook sample values
- generation IPC from renderer to Electron to Python
- output review panel with open-folder/open-file actions
- example template downloads for Excel, Word, and email
- Playwright desktop launch smoke test

Still rough or incomplete:

- some runtime paths are still local-machine specific
- full project persistence is not finished yet
- preflight validation is not centralized
- generation progress is basic, not truly streamed
- packaging is not solved yet

## Actual wizard flow

The current product flow should stay close to this:

1. Project setup
2. Contract field mapping
3. Email builder
4. Review and generate

Project setup should answer one question first:

"Did I load the correct files and rows?"

That is why the setup step should keep showing:

- detected Word placeholders
- a few Excel sample rows
- worksheet/header/data-row settings
- example template download actions

## MVP scope

### In scope

- local file-based workflow
- one workbook at a time
- one Word template at a time
- one email template per project
- DOCX output
- PDF output when available
- email draft file output
- project save/open
- output review inside app

### Out of scope

- cloud sync
- user accounts
- team collaboration
- hosted database
- built-in email sending
- full Word template editing inside the app
- CRM integrations
- e-sign integrations
- analytics dashboard

## Core requirements

### 1. Setup confidence

Before a user proceeds, they should be able to tell:

- the workbook is the right one
- the sheet is the right one
- the header row is right
- the first data row is right
- the Word template is the intended one

### 2. Explicit mapping

The app must make it obvious how values flow:

- workbook column -> variable
- Word placeholder -> variable
- email token -> variable

Duplicate or missing mappings should be visible before generation.

### 3. Safe generation

The Generate action should:

- validate the setup
- block obviously bad runs
- show stage/progress state
- return a readable success or failure summary

### 4. Trustworthy output review

After generation, the user should be able to:

- open the output folder
- open the report
- open the combined email drafts file when present
- inspect created files in a structured list

## Biggest remaining work

### 1. Fix and stabilize the current build

Required immediately:

- keep `pnpm typecheck` green
- keep `pnpm lint` green
- make sure lint ignores generated output directories
- reduce machine-specific assumptions in runtime paths

### 2. Finish full project persistence

Project save/open should restore more than setup paths.

It should restore:

- generation options
- workbook column assignments
- Word placeholder mappings
- email template content
- optional email-source settings

### 3. Add real preflight validation

Before generation starts, the app should validate:

- workbook exists
- template exists
- output folder exists or can be created
- worksheet exists
- header/data row values are valid
- required Word placeholders are mapped
- required email placeholders are mapped
- PDF capability is available if PDF output is selected

### 4. Improve generation orchestration

The current generation path works, but still needs hardening:

- move generator orchestration out of `electron/main.ts`
- standardize payload building
- improve error parsing and user-facing messages
- stream richer progress instead of stage text only

### 5. Package the Python side

This is still the main MVP risk.

Short-term internal alpha options:

- Option A: require local Python and detect it robustly
- Option B: bundle frozen Python executables and helper scripts

Preferred direction for a real MVP:

- bundle frozen Python executables with the desktop app
- detect an existing LibreOffice install first for local PDF conversion
- bundle or install LibreOffice Standard only when no usable local install is found

Packaging decision for MVP:

- prefer a detected local LibreOffice install over any bundled copy
- if LibreOffice must be distributed by the app, use the Standard bundle, not the All Languages bundle
- avoid duplicate LibreOffice payload when the machine already has a usable `soffice`
- keep DOCX generation independent from LibreOffice so the app still works if PDF conversion is disabled or unavailable

Python freeze and bundle steps:

1. Inventory the Python entrypoints the app actually calls.
2. Separate generator orchestration from `electron/main.ts` so Electron resolves one packaged service contract.
3. Lock Python dependencies and create a reproducible build environment for Windows.
4. Freeze the required scripts into Windows executables:
   - `generate_contracts.py`
   - `app/scripts/inspect_project.py`
   - `app/scripts/generate_email_drafts.py`
5. Bundle non-code assets those executables need at runtime and verify path resolution in packaged mode.
6. Change Electron runtime discovery so it prefers packaged executables instead of a user Anaconda path.
7. Add preflight checks for:
   - packaged generator executable exists
   - packaged email/inspection helpers exist
   - existing local LibreOffice can be detected when PDF output is enabled
   - bundled LibreOffice path is available only as a fallback when no local install is found
8. Add setup validation that reports which PDF backend will be used:
   - existing local LibreOffice
   - bundled LibreOffice Standard
   - no PDF backend available
9. If LibreOffice must be distributed by the app, bundle or install the Standard build and invoke its `soffice` binary via app-managed paths.
10. Write packaged-temp config, mapping, and template files into app-controlled temporary directories during generation.
11. Standardize stdout/stderr parsing and error messages for the frozen executables and PDF conversion layer.
12. Test packaged generation on a clean Windows machine with:
   - DOCX only
   - DOCX + PDF
   - email drafts only
   - missing workbook/template failure cases
   - LibreOffice already installed
   - LibreOffice absent so fallback install/bundle path is exercised
13. Add a setup smoke test that verifies PDF backend detection before the user reaches Generate.
14. Measure installer size, installed size, startup time, and generation time before locking the MVP release path.

Docker is not a fit for this product.

## Recommended next order

1. Keep the app green and remove local-machine fragility.
2. Persist the full project state.
3. Add centralized preflight validation.
4. Extract generator logic into dedicated Electron service modules.
5. Improve progress reporting and recovery UX.
6. Solve Python packaging for Windows.
7. Add more integration coverage.

## Testing priorities

The next useful tests are:

- project setup load and preview smoke test
- mapping step behavior with duplicate assignments
- generation payload construction
- generate happy path with output summary
- save/open project roundtrip

## Packaging note

The app should be packaged as a local Windows desktop application.

That means:

- no Docker dependency
- no server dependency
- no user-managed Python dependency for the final distributed version
- no separate LibreOffice install for the final distributed version if PDF output is enabled in MVP

The final product should bring its own runtime story.

## Success criteria

The MVP is successful if a non-technical user can:

- load their workbook and template files correctly
- understand what is mapped and what is missing
- generate outputs without using the terminal
- recover from common mistakes without developer help
- resume a saved project without rebuilding the setup

## Short takeaway

The product is no longer “build the shell.”

The product is now:

"Stabilize the workflow, persist it, validate it, and package it."
