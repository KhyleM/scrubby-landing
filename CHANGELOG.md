# Changelog

All notable changes to Scrubby will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Staff management for multi-person salons
- Advanced route optimization for mobile groomers
- Recurring appointments
- Financial reporting for providers
- Capacity management

---

## [1.0.1] - 2025-10-17

### Added
- Comprehensive documentation reorganization (Phase 1-3)
- Getting started guides for new developers
- Architecture documentation (Flutter, Supabase, Stripe)
- Development guides (troubleshooting, migrations, environment config)
- Operations guides (App Store, Google Play, monitoring)
- Business documentation (product vision, roadmap)
- Contributing guidelines
- This changelog

### Changed
- Improved documentation structure and organization
- Updated README with better navigation
- Enhanced code examples throughout documentation

### Fixed
- Documentation accuracy issues
- Broken documentation links
- Outdated technical information

---

## [1.0.0] - 2025-10-15

### Added - Initial Launch 🎉

#### Core Features
- User authentication with email and social login
- Pet profile management with photo upload
- Provider discovery with map view and filters
- Service booking with calendar and time slots
- Payment processing via Stripe
- Reviews and ratings system
- Booking history and tracking
- Real-time location tracking for mobile groomers
- Push notifications (iOS and Android)
- In-app messaging between customers and providers

#### Provider Features
- Provider dashboard with earnings overview
- Booking management and calendar
- Schedule configuration (weekly hours, breaks, time off)
- Service pricing and customization
- Mobile groomer settings (service radius, travel zones)
- Travel fee calculator
- Stripe Connect integration for payouts
- Provider profile customization

#### Payment Features
- Stripe payment processing
- Stripe Connect for provider payouts
- Deposit handling (configurable per service)
- Tips (percentage or custom amount)
- Promo code support with validation
- Refund processing
- Secure payment storage

#### Additional Features
- Vaccination record management
- Waitlist functionality
- "Next available" booking suggestions
- Smart booking recommendations
- Multi-currency support (USD, CAD)
- Tax calculation for Canadian provinces
- US and Canada market support

#### Technical
- Flutter 3.35.1 with Dart 3.9.0
- Riverpod 2.6.1 for state management
- GoRouter 16.2.1 for navigation
- Supabase backend (PostgreSQL, Auth, Storage, Edge Functions)
- Stripe 11.5.0 for payments
- Google Maps integration
- Firebase Cloud Messaging for push notifications
- Sentry 8.0.0 for error tracking
- Freezed 2.5.7 for immutable models
- Row Level Security (RLS) for data protection

#### Platform Support
- iOS 13.0+
- Android 5.0+ (API 21+)
- Web (Chrome, Safari, Edge)

### Security
- PKCE authentication flow
- Row Level Security (RLS) policies
- Encrypted data at rest and in transit
- Secure payment processing via Stripe
- Environment-based configuration
- API key protection

---

## Version History

### Version Numbering

Scrubby follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner
- **PATCH** version for backwards compatible bug fixes

### Release Schedule

- **Major releases**: Quarterly (Q1, Q2, Q3, Q4)
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical bugs

---

## Categories

### Added
New features or functionality

### Changed
Changes to existing functionality

### Deprecated
Features that will be removed in future versions

### Removed
Features that have been removed

### Fixed
Bug fixes

### Security
Security improvements or vulnerability fixes

---

## Migration Guides

### Upgrading to 1.0.1

No breaking changes. Simply update the app from the App Store or Google Play.

### Upgrading to 1.0.0

Initial release - no migration needed.

---

## Deprecation Notices

No features are currently deprecated.

---

## Known Issues

### iOS
- None currently

### Android
- None currently

### Web
- Firebase Cloud Messaging not supported (push notifications unavailable)
- Performance may vary on older browsers

---

## Future Releases

### 1.1.0 (Planned Q1 2026)
- Staff management for salons
- Recurring appointments
- Advanced scheduling features
- Capacity management
- Financial reporting

### 1.2.0 (Planned Q2 2026)
- Advanced route optimization
- Predictive scheduling
- Enhanced analytics
- Performance improvements
- A/B testing framework

### 2.0.0 (Planned Q3 2026)
- Veterinary services
- Dog walking
- Pet sitting
- Geographic expansion
- Multi-language support

See [Roadmap](docs/05-business/roadmap.md) for detailed feature plans.

---

## Support

### Reporting Issues

Found a bug? Please report it:
1. Check [existing issues](https://github.com/KhyleM/scrubby/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Device/OS information

### Feature Requests

Have an idea? We'd love to hear it:
1. Check [roadmap](docs/05-business/roadmap.md)
2. Search [existing requests](https://github.com/KhyleM/scrubby/issues?q=is%3Aissue+label%3Aenhancement)
3. Create a new feature request with:
   - Use case description
   - Expected behavior
   - Why it's valuable

### Getting Help

- Check [Documentation](docs/)
- Search [issues](https://github.com/KhyleM/scrubby/issues)
- Contact support: support@scrubby.app

---

## Contributors

Thank you to all contributors who have helped make Scrubby better!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

---

## Links

- [Homepage](https://scrubby.app)
- [Documentation](docs/)
- [GitHub Repository](https://github.com/KhyleM/scrubby)
- [Issue Tracker](https://github.com/KhyleM/scrubby/issues)
- [Roadmap](docs/05-business/roadmap.md)

---

**Last Updated**: October 17, 2025  
**Maintained by**: Scrubby Development Team

[Unreleased]: https://github.com/KhyleM/scrubby/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/KhyleM/scrubby/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/KhyleM/scrubby/releases/tag/v1.0.0

