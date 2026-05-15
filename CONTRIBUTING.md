# Contributing

First off, thank you for taking the time to contribute to Doc Gen Studio.

Whether it's reporting bugs, improving documentation, suggesting features, or contributing code, all help is appreciated.

## Before You Start

Please:

- Search existing issues before opening a new one
- Keep pull requests focused and reasonably small
- Prefer clear, maintainable solutions over overly clever ones
- Discuss larger architectural changes in an issue first

## Development Setup

### Requirements

- Node.js 20+
- npm
- Git

### Clone the Repository

```bash
git clone https://github.com/presdec/docgen-studio-desktop.git
cd docgen-studio-desktop
```

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Build the Application

```bash
npm run build
```

## Tech Stack

Doc Gen Studio is built with:

- Electron
- React
- TypeScript
- Vite

## Pull Requests

### Branch Naming

Examples:

```txt
feature/template-preview
fix/windows-path-handling
chore/update-dependencies
```

### PR Guidelines

Please:

- Keep PRs scoped to a single concern where possible
- Write clear commit messages
- Add or update tests when appropriate
- Update documentation if behavior changes
- Ensure builds and tests pass locally

## Code Style

General expectations:

- Prefer readable and maintainable code
- Avoid unnecessary abstraction
- Keep components and modules focused
- Use TypeScript types properly instead of `any`
- Favor composition over large monolithic files

## Reporting Bugs

When reporting bugs, include:

- OS and version
- App version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or logs if helpful

## Feature Requests

Feature requests are welcome.

Please explain:

- The problem you're trying to solve
- Your expected workflow
- Why the feature would be broadly useful

## Security Issues

Please do not open public issues for security vulnerabilities.

See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
