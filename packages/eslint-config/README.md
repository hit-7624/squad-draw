# @repo/eslint-config

Shared ESLint configuration for the Squad Draw monorepo.

## Overview

This package provides centralized ESLint configurations used across all apps and packages in the Squad Draw monorepo. It ensures consistent code quality and style across the entire project.

## 📦 Configurations

### Available Configs

- **`base.js`**: Base ESLint configuration for all packages
- **`next.js`**: Next.js specific configuration for the web app
- **`react-internal.js`**: React component library configuration

## 🚀 Usage

### In Package Configuration

Add to your `package.json`:

```json
{
  "eslintConfig": {
    "extends": ["@repo/eslint-config/base"]
  }
}
```

### Or use `.eslintrc.js`:

```javascript
module.exports = {
  extends: ["@repo/eslint-config/base"],
};
```

### For Next.js Apps

```javascript
module.exports = {
  extends: ["@repo/eslint-config/next"],
};
```

### For React Libraries

```javascript
module.exports = {
  extends: ["@repo/eslint-config/react-internal"],
};
```

## 🔧 Rules

### Base Configuration
- TypeScript support
- Import/export validation
- Code quality rules
- Best practices enforcement

### Next.js Configuration
- Next.js specific rules
- React hooks rules
- Performance optimizations
- Accessibility checks

### React Internal Configuration
- React component best practices
- Hook usage validation
- JSX formatting rules
- Prop validation

## 📁 Used By

- **apps/web**: Next.js application
- **apps/ws-server**: WebSocket server
- **packages/**: All shared packages
- **Future packages**: Any new additions to the monorepo

## 🛠 Development

### Adding New Rules

1. Edit the appropriate configuration file
2. Test across affected packages
3. Update this documentation
4. Increment package version

### Testing Configuration

```bash
# Test in a specific package
cd apps/web
pnpm lint

# Test across monorepo
pnpm lint
```

## 📋 Dependencies

- ESLint core packages
- TypeScript ESLint parser
- React ESLint plugins
- Next.js ESLint config
- Import/export plugins

---

## 🔗 Integration

This ESLint configuration integrates with:
- **VS Code**: Automatic linting in editor
- **Pre-commit hooks**: Code quality checks
- **CI/CD**: Automated linting in builds
- **Turbo**: Cached linting across monorepo
