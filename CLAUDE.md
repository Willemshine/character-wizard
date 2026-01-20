# CLAUDE.md - AI Assistant Guide for Character Wizard

This document provides comprehensive guidance for AI assistants working on the Character Wizard codebase.

## Project Overview

**Character Wizard** is a project for creating and managing characters (likely for tabletop RPGs, game development, or similar applications). This repository is currently in its initial setup phase.

---

## Repository Structure

### Expected Directory Layout

As this project develops, the structure should follow these conventions:

```
character-wizard/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components or routes
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── hooks/             # Custom React hooks (if applicable)
│   ├── services/          # API and external service integrations
│   └── styles/            # Stylesheets and theme definitions
├── public/                # Static assets
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
├── .github/              # GitHub workflows and templates
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── README.md             # User-facing documentation
└── CLAUDE.md             # This file - AI assistant guide

```

---

## Development Workflows

### Branch Strategy

- **Main Branch**: `main` or `master` - production-ready code
- **Feature Branches**: `claude/claude-md-*` pattern for AI-assisted development
- Always develop on designated feature branches
- Never commit directly to main without explicit permission

### Git Commit Guidelines

1. **Commit Message Format**:
   ```
   <type>: <subject>

   <optional body>
   ```

2. **Commit Types**:
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code refactoring
   - `docs`: Documentation changes
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks
   - `style`: Code style changes (formatting, etc.)

3. **Best Practices**:
   - Write clear, descriptive commit messages
   - Focus on "why" rather than "what"
   - Keep commits atomic and focused
   - Reference issue numbers when applicable

### Testing Strategy

- Write tests for all new features
- Maintain or improve code coverage
- Run tests before committing: `npm test` or equivalent
- Consider Test-Driven Development (TDD) for complex features

---

## Code Conventions

### General Principles

1. **KISS (Keep It Simple, Stupid)**
   - Avoid over-engineering
   - Only add complexity when necessary
   - Prefer simple, readable code over clever solutions

2. **DRY (Don't Repeat Yourself)**
   - Extract common patterns into reusable functions
   - But avoid premature abstraction - three uses is a good rule of thumb

3. **YAGNI (You Aren't Gonna Need It)**
   - Don't add features for hypothetical future requirements
   - Build what's needed now

### JavaScript/TypeScript

- **Prefer TypeScript** for type safety
- Use `const` by default, `let` when reassignment is needed, avoid `var`
- Prefer functional programming patterns (map, filter, reduce)
- Use async/await over Promise chains
- Destructure objects and arrays for clarity

### File Naming

- **Components**: PascalCase - `CharacterSheet.tsx`
- **Utilities**: camelCase - `calculateModifier.ts`
- **Types**: PascalCase - `Character.ts` or `types.ts`
- **Tests**: Match source file with `.test` or `.spec` suffix - `CharacterSheet.test.tsx`

### Code Style

- **Indentation**: 2 spaces (or follow existing project settings)
- **Quotes**: Single quotes for strings (unless project uses double)
- **Semicolons**: Follow project convention (present or absent)
- **Line Length**: Max 80-100 characters
- **Trailing Commas**: Use in multi-line arrays/objects for cleaner diffs

### Comments

- Write self-documenting code first
- Add comments only when logic isn't self-evident
- Explain "why" not "what"
- Keep comments up-to-date with code changes
- Use JSDoc for function documentation:
  ```typescript
  /**
   * Calculates the ability modifier for a given score
   * @param score - The ability score (typically 1-30)
   * @returns The modifier value
   */
  function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }
  ```

---

## Character Wizard Specific Guidelines

### Character Data Structure

When implementing character management:

1. **Data Integrity**
   - Validate all character data inputs
   - Ensure character states are consistent
   - Handle edge cases (min/max values, invalid inputs)

2. **Character Properties** (Common in RPG characters)
   - Basic info: name, race, class, level
   - Attributes/Ability Scores: strength, dexterity, constitution, etc.
   - Derived stats: HP, AC, initiative, modifiers
   - Skills, feats, equipment, spells
   - Background and narrative elements

3. **Calculation Logic**
   - Keep calculation functions pure (no side effects)
   - Make calculations deterministic and testable
   - Document complex formulas clearly

### UI/UX Considerations

1. **Wizard Flow**
   - Guide users step-by-step through character creation
   - Allow navigation back to previous steps
   - Save progress automatically or provide clear save points
   - Validate each step before allowing progression

2. **Accessibility**
   - Use semantic HTML
   - Provide keyboard navigation
   - Include ARIA labels where appropriate
   - Ensure sufficient color contrast

3. **Responsive Design**
   - Support mobile, tablet, and desktop viewports
   - Test on various screen sizes
   - Consider touch vs. mouse interactions

---

## Working with AI Assistants

### Before Making Changes

1. **Read First**: Always read existing files before modifying them
2. **Understand Context**: Review related files to understand the broader context
3. **Check Conventions**: Look at similar existing code to match style
4. **Plan**: For complex tasks, create a todo list to track progress

### During Development

1. **Incremental Changes**: Make small, testable changes
2. **Test Frequently**: Run tests after each significant change
3. **Stay Focused**: Only change what's necessary for the task
4. **Document Decisions**: Explain non-obvious choices in commit messages

### Security Considerations

- **Never commit secrets**: API keys, passwords, tokens
- **Validate user input**: Prevent XSS, injection attacks
- **Sanitize data**: Before rendering or storing user-generated content
- **Use environment variables**: For configuration and secrets

### Performance

- **Optimize when necessary**: Profile first, then optimize
- **Lazy load**: Load resources and components as needed
- **Memoize expensive calculations**: Use React.memo, useMemo, useCallback appropriately
- **Minimize re-renders**: Understand React rendering behavior

---

## Common Tasks

### Adding a New Feature

1. Read relevant existing code
2. Create a todo list if the feature is complex
3. Implement the feature following conventions
4. Write tests
5. Update documentation if needed
6. Commit with a clear message
7. Push to the feature branch

### Fixing a Bug

1. Reproduce the bug
2. Write a failing test that demonstrates the bug
3. Fix the bug
4. Verify the test passes
5. Check for similar bugs elsewhere
6. Commit the fix

### Refactoring

1. Ensure tests exist and pass
2. Make refactoring changes
3. Verify tests still pass
4. Commit refactoring separately from feature changes

---

## Technology Stack (To Be Determined)

As the project evolves, document the chosen technologies here:

### Potential Technologies

- **Frontend Framework**: React, Vue, Svelte, or vanilla JS
- **Language**: TypeScript (recommended) or JavaScript
- **Styling**: CSS Modules, Tailwind, Styled Components, or SCSS
- **State Management**: Context API, Redux, Zustand, or Jotai
- **Build Tool**: Vite, Webpack, or Create React App
- **Testing**: Jest, Vitest, Testing Library, Playwright
- **Backend** (if applicable): Node.js, Express, tRPC, GraphQL

### Update This Section

When technologies are chosen, update this section with:
- Specific versions
- Configuration details
- Setup instructions
- Key libraries and their purposes

---

## Build and Development Commands

Document common commands here as they're established:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## Troubleshooting

### Common Issues

**Issue**: [To be added as issues arise]
**Solution**: [Document solutions here]

### Debugging Tips

- Use browser DevTools for frontend debugging
- Check console for errors and warnings
- Verify environment variables are set correctly
- Ensure dependencies are installed and up-to-date
- Clear cache if experiencing build issues

---

## Resources and References

### Character Creation Systems

- D&D 5e SRD: [System Reference Document]
- Pathfinder: [Reference documents]
- Other systems: [Add as relevant]

### Best Practices

- [React Best Practices](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Contributing

### For AI Assistants

1. Always work on the designated feature branch
2. Follow the conventions in this document
3. Ask clarifying questions when requirements are ambiguous
4. Update this CLAUDE.md file as the project evolves
5. Commit and push changes when tasks are complete

### For Human Developers

- Review AI-generated code carefully
- Provide feedback on AI contributions
- Update conventions in this document as needed
- Ensure AI assistants have the context they need

---

## Changelog

### 2026-01-20
- Initial CLAUDE.md created
- Established basic project structure and conventions
- Set up guidelines for future development

---

## Notes for Future Updates

As this project grows, keep this document updated with:

- Actual project structure as it develops
- Chosen technology stack and versions
- Project-specific conventions and patterns
- Common pitfalls and solutions
- API documentation and integration details
- Deployment procedures
- Environment setup instructions

This document should be the first reference for any AI assistant working on this codebase.
