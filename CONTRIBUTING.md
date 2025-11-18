# Contributing to Scrubby

Thank you for your interest in contributing to Scrubby! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Positive Behavior**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable Behavior**:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations of the Code of Conduct may be reported to the project team. All complaints will be reviewed and investigated promptly and fairly.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Flutter SDK 3.35.1 or later
- Dart SDK 3.9.0 or later
- Git installed and configured
- A GitHub account
- Development environment set up (see [Setup Guide](docs/00-getting-started/setup.md))

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/scrubby.git
   cd scrubby
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/KhyleM/scrubby.git
   ```
4. **Install dependencies**:
   ```bash
   flutter pub get
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

### Environment Setup

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```
2. Fill in required values (see [Environment Config](docs/03-development/environment-config.md))
3. Verify setup:
   ```bash
   flutter doctor
   flutter test
   ```

---

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Convention**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/path/to/test_file.dart

# Run with coverage
flutter test --coverage

# Run integration tests
flutter test integration_test/
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add user profile editing"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

---

## Coding Standards

### Dart Style Guide

Follow the [Effective Dart](https://dart.dev/guides/language/effective-dart) style guide.

**Key Points**:
- Use `lowerCamelCase` for variables, methods, and parameters
- Use `UpperCamelCase` for classes and types
- Use `lowercase_with_underscores` for file names
- Prefer `final` over `var` when possible
- Use `const` constructors where applicable

### Code Formatting

```bash
# Format all Dart files
dart format .

# Check formatting without changes
dart format --output=none --set-exit-if-changed .
```

### Linting

```bash
# Run analyzer
flutter analyze

# Fix auto-fixable issues
dart fix --apply
```

### File Organization

```dart
// 1. Imports (grouped and sorted)
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'package:petbooker/core/models/user.dart';
import 'package:petbooker/features/auth/auth_service.dart';

// 2. Part statements
part 'my_file.g.dart';
part 'my_file.freezed.dart';

// 3. Class definition
class MyWidget extends StatelessWidget {
  // Public constants
  static const String routeName = '/my-widget';
  
  // Public fields
  final String title;
  
  // Constructor
  const MyWidget({super.key, required this.title});
  
  // Public methods
  @override
  Widget build(BuildContext context) {
    return Container();
  }
  
  // Private methods
  void _handleTap() {}
}
```

### State Management

Use **Riverpod** for state management:

```dart
// Provider definition
@riverpod
Future<List<Provider>> providers(Ref ref) async {
  final repository = ref.watch(providerRepositoryProvider);
  return repository.getProviders();
}

// Usage in widgets
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final providersAsync = ref.watch(providersProvider);
    
    return providersAsync.when(
      data: (providers) => ListView(...),
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => ErrorWidget(error),
    );
  }
}
```

### Error Handling

```dart
try {
  final result = await riskyOperation();
  return result;
} on SpecificException catch (e) {
  AppLogger.error('Specific error occurred', e);
  rethrow;
} catch (error, stackTrace) {
  AppLogger.error('Unexpected error', error, stackTrace);
  throw Exception('Operation failed');
}
```

---

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build, etc.)
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(booking): add recurring appointment support"

# Bug fix
git commit -m "fix(payments): resolve Stripe webhook signature validation"

# Documentation
git commit -m "docs(api): update Supabase integration guide"

# Breaking change
git commit -m "feat(auth)!: migrate to PKCE auth flow

BREAKING CHANGE: Old auth tokens are no longer valid"
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests when applicable
- Provide context in the body for complex changes

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No merge conflicts with main branch
- [ ] Commits follow conventional commit format

### PR Title

Use conventional commit format:
```
feat(booking): add recurring appointment support
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer reviews the code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves the PR
5. **Merge**: Maintainer merges the PR

### After Merge

- Delete your feature branch
- Update your local main branch
- Close related issues

---

## Testing Requirements

### Test Coverage

- **Minimum coverage**: 70% for new code
- **Critical paths**: 90%+ coverage
- **UI components**: Widget tests for complex widgets

### Test Types

**Unit Tests**:
```dart
test('should calculate total price correctly', () {
  final service = Service(price: 50.0);
  final tip = 10.0;
  final total = calculateTotal(service, tip);
  
  expect(total, 60.0);
});
```

**Widget Tests**:
```dart
testWidgets('should display provider name', (tester) async {
  await tester.pumpWidget(
    ProviderCard(provider: testProvider),
  );
  
  expect(find.text('Test Provider'), findsOneWidget);
});
```

**Integration Tests**:
```dart
testWidgets('complete booking flow', (tester) async {
  // Test full user journey
});
```

### Running Tests

```bash
# All tests
flutter test

# Specific file
flutter test test/features/booking/booking_test.dart

# With coverage
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

---

## Documentation

### Code Documentation

```dart
/// Calculates the total price including tip.
///
/// Takes a [service] and optional [tip] amount.
/// Returns the total price as a double.
///
/// Example:
/// ```dart
/// final total = calculateTotal(service, 10.0);
/// ```
double calculateTotal(Service service, double tip) {
  return service.price + tip;
}
```

### Documentation Updates

When adding features:
- Update relevant documentation in `docs/`
- Add code examples
- Update README if needed
- Add to CHANGELOG

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Link to related documentation
- Keep documentation up-to-date

---

## Questions?

- Check [Documentation](docs/)
- Search [existing issues](https://github.com/KhyleM/scrubby/issues)
- Ask in pull request comments
- Contact maintainers

---

## License

By contributing to Scrubby, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Scrubby!** 🐾

---

**Last Updated**: October 17, 2025  
**Maintainer**: Scrubby Development Team

