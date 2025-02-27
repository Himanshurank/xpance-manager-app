# Xpance Manager App

Mobile app for managing expenses and budgets, built with Flutter.

## Setup

### Prerequisites

- Flutter SDK
- Xcode (for iOS)
- Android Studio (for Android)
- Firebase project setup

### Installation

1. Clone the repository

```bash
git clone <repository-url>
```

2. Install dependencies

```bash
flutter pub get
```

3. Setup Firebase

- Add `google-services.json` to `android/app/`
- Add `GoogleService-Info.plist` to `ios/Runner/`

### Running the App

```bash
# Run in debug mode
flutter run

# Build release version for iOS
flutter build ios

# Build release version for Android
flutter build apk
```

## CI/CD

This project uses Codemagic for CI/CD. The build configuration can be found in `codemagic.yaml`.

### Build Triggers

- Push to main branch
- Pull request to main branch
- Manual trigger

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
