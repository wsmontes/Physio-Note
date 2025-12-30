# Contributing to Physio-Note

Thank you for your interest in contributing to Physio-Note! This document provides guidelines and best practices for contributing to the project.

## Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Code Standards

### Backend (Node.js/Express)
- Follow ES6+ JavaScript standards
- Use async/await for asynchronous operations
- Proper error handling with try-catch blocks
- Add JSDoc comments for complex functions
- Validate all inputs with express-validator

### Frontend (React)
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling (avoid inline styles)
- Keep components small and focused
- Implement proper error boundaries

### Database (MongoDB)
- Use descriptive field names
- Add indexes for frequently queried fields
- Include timestamps on all schemas
- Validate data at the schema level

## Commit Messages

Follow the conventional commits specification:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## Pull Request Process

1. Update documentation for any changed functionality
2. Ensure all tests pass
3. Update the README.md if needed
4. Request review from maintainers

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Maintain professionalism

## Questions?

Open an issue for any questions or concerns.
