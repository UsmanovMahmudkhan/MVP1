# Contributing to CoreArena

Thank you for your interest in contributing to CoreArena! This document provides comprehensive guidelines and instructions for contributing to the project. Please read this document carefully before making your first contribution.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Submitting Changes](#submitting-changes)
10. [Review Process](#review-process)
11. [Issue Guidelines](#issue-guidelines)
12. [Pull Request Guidelines](#pull-request-guidelines)
13. [Commit Message Guidelines](#commit-message-guidelines)
14. [Release Process](#release-process)
15. [Community Guidelines](#community-guidelines)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18.x or higher)
- npm (version 9.x or higher) or yarn
- Git
- Docker and Docker Compose (for database and containerized services)
- PostgreSQL (optional, if not using Docker)
- A code editor (VS Code recommended)

### Forking and Cloning

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/CoreArenaCLI.git
   cd CoreArenaCLI
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/UsmanovMahmudkhan/CoreArenaCLI.git
   ```

### Initial Setup

1. Install dependencies for all subprojects:
   ```bash
   # Backend server
   cd codearena-server
   npm install
   
   # Frontend web application
   cd ../codearena-web
   npm install
   
   # CLI tool
   cd ../codearena-cli
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Copy example environment files
   cd codearena-server
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start the database:
   ```bash
   # From project root
   docker-compose up -d
   ```

4. Run database migrations:
   ```bash
   cd codearena-server
   npx sequelize-cli db:migrate
   ```

## Development Setup

### Backend Server (codearena-server)

The backend server is built with Express.js and uses Sequelize as the ORM.

**Starting the development server:**
```bash
cd codearena-server
npm start
```

The server will run on `http://localhost:3000` by default (or the port specified in your `.env` file).

**Key directories:**
- `config/` - Configuration files for database and authentication
- `controllers/` - Request handlers and business logic
- `models/` - Database models and schemas
- `routes/` - API route definitions
- `middleware/` - Custom middleware functions
- `services/` - Business logic services
- `migrations/` - Database migration scripts

### Frontend Web Application (codearena-web)

The frontend is built with Next.js and React.

**Starting the development server:**
```bash
cd codearena-web
npm run dev
```

The application will run on `http://localhost:3000` (or the next available port).

**Key directories:**
- `pages/` - Next.js pages and API routes
- `components/` - Reusable React components
- `styles/` - CSS modules and global styles
- `public/` - Static assets

### CLI Tool (codearena-cli)

The CLI tool is built with oclif and TypeScript.

**Building and linking:**
```bash
cd codearena-cli
npm run build
npm link
```

**Running tests:**
```bash
npm test
```

## Project Structure

CoreArena is a monorepo containing three main components:

```
CoreArenaCLI/
├── codearena-server/     # Backend API server
├── codearena-web/        # Frontend web application
├── codearena-cli/        # Command-line interface
├── docker/               # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── LICENSE               # Apache 2.0 License
├── README.md             # Main project documentation
├── CONTRIBUTING.md       # This file
├── CODE_OF_CONDUCT.md    # Code of conduct
└── SECURITY.md           # Security policy
```

Each component has its own `package.json`, dependencies, and can be developed independently while sharing common configuration and tooling.

## Development Workflow

### Branch Strategy

We use a feature branch workflow:

1. **main** - Production-ready code
2. **develop** - Integration branch for features (if applicable)
3. **feature/** - New features
4. **bugfix/** - Bug fixes
5. **hotfix/** - Critical production fixes
6. **docs/** - Documentation updates

### Creating a Branch

Always create a new branch from `main`:

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create and switch to a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### Branch Naming Conventions

- Use lowercase letters and hyphens
- Be descriptive but concise
- Prefix with type: `feature/`, `bugfix/`, `docs/`, `refactor/`, `test/`
- Examples:
  - `feature/add-user-authentication`
  - `bugfix/fix-submission-validation`
  - `docs/update-api-documentation`
  - `refactor/optimize-database-queries`

## Coding Standards

### JavaScript/TypeScript

- Follow the existing code style in the project
- Use ESLint and Prettier configurations provided
- Use meaningful variable and function names
- Write self-documenting code with clear intent
- Add comments for complex logic
- Keep functions small and focused
- Avoid deep nesting (max 3-4 levels)
- Use async/await instead of callbacks where possible
- Handle errors appropriately

### Code Style

**Indentation:**
- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings (unless interpolation is needed)

**Functions:**
- Use arrow functions for callbacks and short functions
- Use function declarations for main functions
- Keep functions under 50 lines when possible
- One function should do one thing

**Variables:**
- Use `const` by default, `let` when reassignment is needed
- Avoid `var`
- Use descriptive names
- Declare variables at the top of their scope

**Objects and Arrays:**
- Use object destructuring when appropriate
- Use array methods (map, filter, reduce) instead of loops when possible
- Prefer object spread over Object.assign

### File Organization

- One main export per file
- Group related functionality together
- Keep files focused and under 300 lines when possible
- Use consistent naming conventions

### Backend Code Standards

**Express Routes:**
- Keep route handlers thin, delegate to controllers
- Use middleware for common functionality
- Validate input data
- Handle errors consistently
- Return appropriate HTTP status codes

**Database:**
- Use migrations for schema changes
- Write efficient queries
- Use transactions for multi-step operations
- Handle database errors gracefully

**API Design:**
- Follow RESTful conventions
- Use consistent response formats
- Version APIs when making breaking changes
- Document endpoints clearly

### Frontend Code Standards

**React Components:**
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use PropTypes or TypeScript for type checking
- Avoid prop drilling, use context when appropriate

**Styling:**
- Use CSS Modules for component styles
- Follow BEM naming conventions
- Keep styles scoped to components
- Use CSS variables for theming

**State Management:**
- Use React hooks for local state
- Consider context for shared state
- Keep state as close to where it's used as possible

## Testing Guidelines

### Writing Tests

- Write tests for new features and bug fixes
- Aim for high code coverage (80%+)
- Test edge cases and error conditions
- Keep tests independent and isolated
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

### Test Structure

```javascript
describe('Component/Function Name', () => {
  describe('specific behavior', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Running Tests

**Backend:**
```bash
cd codearena-server
npm test
```

**Frontend:**
```bash
cd codearena-web
npm test
```

**CLI:**
```bash
cd codearena-cli
npm test
```

### Test Coverage

- Run tests before submitting pull requests
- Ensure all tests pass
- Add tests for new code
- Update tests when modifying existing code

## Documentation

### Code Documentation

- Add JSDoc comments for public functions and classes
- Document complex algorithms and business logic
- Keep comments up to date with code changes
- Write self-documenting code when possible

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error responses
- Keep API documentation updated

### README Updates

- Update README when adding new features
- Document new configuration options
- Update installation instructions if needed
- Add examples for new functionality

## Submitting Changes

### Before Submitting

1. **Update your branch:**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests:**
   ```bash
   # Run all tests
   npm test
   
   # Run linters
   npm run lint
   ```

3. **Check for issues:**
   - All tests pass
   - Code follows style guidelines
   - No console.log statements
   - No commented-out code
   - Documentation is updated

### Commit Message Guidelines

Follow the conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add Google OAuth authentication

Implement Google OAuth 2.0 authentication flow with passport.js.
Add user model fields for OAuth provider information.
Update authentication routes to handle OAuth callbacks.

Closes #123
```

```
fix(submission): validate code before execution

Add input validation to prevent malicious code execution.
Check for dangerous patterns and reject submissions.

Fixes #456
```

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin your-branch-name
   ```

2. **Create PR on GitHub:**
   - Use a clear, descriptive title
   - Reference related issues
   - Provide a detailed description
   - Include screenshots for UI changes
   - List breaking changes if any

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Related Issues
   Closes #123
   
   ## Testing
   - [ ] Tests added/updated
   - [ ] All tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   - [ ] All tests pass
   ```

## Review Process

### What Reviewers Look For

- Code quality and correctness
- Adherence to coding standards
- Test coverage
- Documentation completeness
- Performance considerations
- Security implications
- Breaking changes

### Responding to Reviews

- Be open to feedback
- Ask questions if something is unclear
- Make requested changes promptly
- Explain your reasoning if you disagree
- Thank reviewers for their time

### Review Checklist

Before requesting review, ensure:
- [ ] Code compiles/runs without errors
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No sensitive data is committed
- [ ] No console.log or debug statements
- [ ] Error handling is appropriate
- [ ] Performance is considered

## Issue Guidelines

### Reporting Bugs

When reporting bugs, include:

1. **Clear title** describing the issue
2. **Description** of what happened
3. **Steps to reproduce** the issue
4. **Expected behavior** vs actual behavior
5. **Environment information:**
   - OS and version
   - Node.js version
   - Browser (if applicable)
   - Package versions
6. **Screenshots** or error messages
7. **Related issues** or pull requests

### Requesting Features

When requesting features, include:

1. **Clear title** describing the feature
2. **Use case** and motivation
3. **Proposed solution** or approach
4. **Alternatives considered**
5. **Additional context** or examples

### Issue Labels

We use labels to categorize issues:
- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation improvements
- `question` - Questions or discussions
- `help wanted` - Extra attention needed
- `good first issue` - Good for newcomers

## Pull Request Guidelines

### PR Requirements

- All CI checks must pass
- At least one approval from maintainers
- No merge conflicts
- Up to date with main branch
- Clear description and title

### PR Size

- Keep PRs focused and reasonably sized
- Split large changes into multiple PRs
- Each PR should be reviewable in 30-60 minutes

### PR Lifecycle

1. **Draft** - Work in progress
2. **Ready for Review** - Ready for feedback
3. **Changes Requested** - Address feedback
4. **Approved** - Ready to merge
5. **Merged** - Integrated into main

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Subject Line

- Use imperative mood ("add feature" not "added feature")
- First line should be 50 characters or less
- Capitalize first letter
- No period at the end

### Body

- Explain what and why vs how
- Wrap at 72 characters
- Use present tense
- Reference issues and PRs

### Footer

- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-authored-by: Name <email>`

## Release Process

### Version Numbers

We follow Semantic Versioning (SemVer):
- MAJOR.MINOR.PATCH (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Release notes prepared
- [ ] Tag created
- [ ] Release published

## Community Guidelines

### Communication

- Be respectful and professional
- Use clear and concise language
- Provide context in discussions
- Be patient with newcomers
- Give constructive feedback

### Getting Help

- Check existing documentation first
- Search closed issues for similar problems
- Ask questions in issue discussions
- Be specific about what you need help with
- Provide relevant context

### Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Project documentation
- GitHub contributors page

## Additional Resources

### Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Sequelize Documentation](https://sequelize.org/)
- [Git Documentation](https://git-scm.com/doc)

### Tools and Services

- ESLint for code linting
- Prettier for code formatting
- Jest for testing
- Docker for containerization
- GitHub Actions for CI/CD

### Getting Involved

- Start with "good first issue" labeled issues
- Review open pull requests
- Help improve documentation
- Answer questions in discussions
- Share your use cases and feedback

## Questions?

If you have questions about contributing:

- Check existing documentation
- Search closed issues
- Open a new issue with the `question` label
- Contact project maintainers

Thank you for contributing to CoreArena!
