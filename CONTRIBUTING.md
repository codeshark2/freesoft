# Contributing to Voice AI Testing Tool

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up your development environment
4. Create a new branch for your changes

## Development Setup

This project uses a monorepo structure with pnpm workspaces.

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install

# Start the development servers
pnpm dev
```

This will start:
- Web app on http://localhost:3000
- Server on http://localhost:3001

### Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Express backend
├── packages/
│   └── shared/       # Shared TypeScript types
├── .github/          # GitHub workflows and templates
└── package.json      # Root package.json
```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Write clear, concise commit messages:
- Use present tense ("Add feature" not "Added feature")
- Start with a capital letter
- Keep the first line under 72 characters
- Reference issues and PRs when applicable

Examples:
```
Add voice selection for ElevenLabs provider
Fix WebSocket connection timeout issue
Update README with new installation steps
```

## Submitting Changes

1. **Push your changes** to your fork
2. **Create a Pull Request** against the `main` branch
3. **Fill out the PR template** completely
4. **Wait for review** - maintainers will review your PR

### Pull Request Requirements

- All tests must pass
- Code must follow the project's coding standards
- New features should include tests
- Update documentation as needed
- No TypeScript errors (`pnpm typecheck`)
- No linting errors (`pnpm lint`)

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types for props
- Follow the existing component structure

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use shadcn/ui components when possible
- Ensure dark mode compatibility

### Code Formatting

- We use Prettier for code formatting
- Run `pnpm format` before committing
- Husky pre-commit hooks will auto-format staged files

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for meaningful test coverage
- Test edge cases and error conditions

## Reporting Bugs

Use the GitHub issue tracker to report bugs.

### Before Reporting

1. Check if the issue already exists
2. Verify you're using the latest version
3. Try to reproduce the issue consistently

### Bug Report Template

Use the bug report template provided in `.github/ISSUE_TEMPLATE/bug_report.md`:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

## Suggesting Features

We welcome feature suggestions!

### Feature Request Template

Use the feature request template in `.github/ISSUE_TEMPLATE/feature_request.md`:
- Clear description of the feature
- Problem it solves
- Proposed solution
- Alternative solutions considered
- Additional context

## Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

## Community Guidelines

- Be respectful and inclusive
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- Help others when you can
- Share knowledge and learn together

## Questions?

If you have questions:
- Check existing issues and discussions
- Create a new issue with the "question" label
- Reach out to maintainers

Thank you for contributing!
