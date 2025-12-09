# Contributing to HackJudge AI

Thank you for your interest in contributing to HackJudge AI! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm 9+
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/hackjudge.git
cd hackjudge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Development Workflow

### Branch Naming

Use descriptive branch names:

```
feature/add-lighthouse-integration
fix/oauth-callback-error
docs/update-readme
refactor/simplify-api-routes
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Lighthouse performance audit
fix: resolve GitHub OAuth callback error
docs: update API documentation
refactor: simplify evaluate API route
style: fix terminal card border styling
test: add unit tests for mock data
chore: update dependencies
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Test locally** with `npm run dev` and `npm run build`
4. **Run lint** with `npm run lint` and fix any issues
5. **Create a PR** using the PR template
6. **Wait for CodeRabbit review** - address any feedback
7. **Request human review** once CodeRabbit approves

## Coding Standards

### TypeScript

- ✅ Use explicit types (avoid `any`)
- ✅ Use interfaces for complex objects
- ✅ Use `const` by default
- ✅ Handle all error cases

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

const getUser = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};

// ❌ Bad
const getUser = async (id: any) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

### React Components

- ✅ Use functional components
- ✅ Use TypeScript props interfaces
- ✅ Include accessibility attributes
- ✅ Follow terminal aesthetic

```tsx
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Button({ onClick, children, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className="terminal-button"
    >
      {children}
    </button>
  );
}
```

### CSS / Styling

- ✅ Use CSS custom properties from `globals.css`
- ✅ No rounded corners (terminal aesthetic)
- ✅ Monospace font only
- ✅ Dark background, bright text

```css
/* ✅ Good */
.card {
  border: var(--border-width) solid var(--color-border);
  background-color: transparent;
  font-family: var(--font-mono);
}

/* ❌ Bad */
.card {
  border-radius: 8px;
  background: linear-gradient(to right, #333, #666);
  font-family: Arial, sans-serif;
}
```

## Testing

### Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Writing Tests

- Test file naming: `*.test.ts` or `*.test.tsx`
- Use descriptive test names
- Cover edge cases

## Project Structure

```
src/
├── app/                 # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── dashboard/      # Dashboard page
│   └── report/         # Report page
├── components/         # React components
│   └── ui/             # Reusable UI components
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

## Need Help?

- 📖 Check the [README](README.md)
- 🐛 Open an [issue](https://github.com/your-username/hackjudge/issues)
- 💬 Ask in discussions

---

**Thank you for contributing!** 🎉
