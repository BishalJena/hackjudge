# Contributing to HackJudge AI

First off, thank you for considering contributing to HackJudge AI! 🎉

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Docker (for Kestra integration)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HackJudge.git
   cd HackJudge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   npm test -- --coverage
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, browser)

### Suggesting Features

Feature requests are welcome! Please:

- Check existing issues first
- Describe the problem your feature would solve
- Explain your proposed solution
- Note any alternatives you've considered

### Code Contributions

1. **Find an issue to work on**
   - Look for `good first issue` or `help wanted` labels
   - Comment on the issue to claim it

2. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run build
   npm run lint
   ```

5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new evaluation agent"
   git commit -m "fix: resolve SSE connection timeout"
   git commit -m "docs: update API documentation"
   ```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass** and coverage doesn't decrease
4. **Fill out the PR template** completely
5. **Request review** from maintainers
6. **Address feedback** promptly

### PR Title Format

Use conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `chore:` Maintenance

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` types
- Use meaningful variable names

### Code Style

- Use ESLint configuration provided
- Use Prettier for formatting
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Testing

- Write tests for all new features
- Maintain >70% code coverage
- Use descriptive test names
- Mock external dependencies

### Commits

- Use conventional commit messages
- Keep commits atomic and focused
- Write descriptive commit messages

## Questions?

Feel free to open an issue with the `question` label or reach out to maintainers.

Thank you for contributing! 🚀
