# Universal Loan Calculator

A modern, feature-rich React Native (Expo) mobile application for universal loan calculations. Calculate loan payments using multiple methods, view detailed amortization schedules, and share results across any country and currency.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2056-black.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

## Features

### Core Features

- **Multiple Loan Types**: Personal Loans, Mortgages, Auto Loans, and Business Loans
- **Dual Calculation Methods**:
  - **EMI (Equated Monthly Installment)**: Fixed monthly payments throughout the loan term
  - **Reducing Balance**: Decreasing payments as principal reduces over time
- **Multi-Currency Support**: 12+ major currencies (USD, EUR, GBP, LKR, INR, JPY, AUD, CAD, CHF, CNY, SGD, NZD)
- **Accurate Calculations**: Industry-standard EMI formula with detailed amortization schedules
- **Flexible Duration Input**: Enter duration in years and/or months

### User Experience

- **Modern Minimalist UI**: Clean, intuitive interface with smooth animations
- **Dark Mode Support**: Light, dark, and system-adaptive themes
- **Calculation History**: Auto-save and access recent calculations
- **Interactive Amortization Table**: Expandable rows with payment breakdown details
- **Search & Filter**: Quick currency search in the selector

### Sharing & Export

- **Share Results**: Share loan summaries via any installed app
- **Share Amortization Schedule**: Export full payment breakdown
- **CSV Schedule Export**: Share comma-separated schedule rows for spreadsheet workflows
- **Email Integration**: Send detailed results via email using device mail client

### Technical Features

- **Offline Support**: Works without internet connection
- **Data Persistence**: Saves theme preferences and compact calculation history
- **Cross-Platform**: Works on iOS and Android
- **Accessibility**: Full VoiceOver/TalkBack support with proper labels

## Screenshots

| Home Screen          | Calculator | Results           | Amortization     |
| -------------------- | ---------- | ----------------- | ---------------- |
| Loan types & history | Input form | Payment breakdown | Monthly schedule |

## Local Setup

### Prerequisites

- Node.js 20 LTS or newer is recommended.
- npm, included with Node.js.
- Expo CLI through `npx expo` or the local npm scripts in this project.
- Expo Go compatible with Expo SDK 56, if testing on a physical iOS or Android device.
- For iOS simulator: macOS with Xcode installed.
- For Android emulator: Android Studio with an emulator/device configured.

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd udt-loan-calculator
```

2. Install dependencies:

```bash
npm install
```

3. Start the Expo development server:

```bash
npm start
```

4. Run the app:
   - Press `i` in the Expo terminal to open the iOS simulator.
   - Press `a` in the Expo terminal to open an Android emulator.
   - Press `w` to open the web version.
   - Scan the QR code with Expo Go to run on a physical device.

### Common Commands

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm start`            | Start the Expo development server            |
| `npm run ios`          | Start Expo and open the iOS simulator        |
| `npm run android`      | Start Expo and open Android                  |
| `npm run web`          | Start Expo for web                           |
| `npm test`             | Run Node test files under `src/**/*.test.ts` |
| `npm run typecheck`    | Run TypeScript without emitting files        |
| `npm run lint`         | Run ESLint                                   |
| `npm run format:check` | Check Prettier formatting                    |
| `npm run format`       | Format the project with Prettier             |

### Verify Your Setup

After installing dependencies, run the quality checks before opening a pull request or sharing a build:

```bash
npm run typecheck
npm test
npm run lint
npm run format:check
```

If Expo behaves strangely after dependency or native package changes, restart it with a cleared Metro cache:

```bash
npm start -- --clear
```

## Expo SDK And Publishing

This project currently uses Expo SDK 56:

- `expo@^56.0.4`
- `react-native@0.85.3`
- `react@19.2.3` and `react-dom@19.2.3`

Native package versions are intentionally kept aligned with Expo Doctor's SDK 56 compatibility matrix. A few npm registry packages may publish newer standalone versions than Expo currently validates; prefer `npx expo install <package>` for native Expo/React Native packages.

As of this upgrade, `npm outdated` may still show newer registry versions for `react`, `react-dom`, `@react-native-async-storage/async-storage`, and `react-native-safe-area-context`. Those are pinned to the SDK 56 versions expected by `npx expo-doctor`.

After package upgrades, run:

```bash
npx expo-doctor
npm run typecheck
npm test
npm run lint
npm audit
```

If an Expo development server is already running while dependencies change, stop it and restart with:

```bash
npm start -- --clear
```

### Preview During Development

Use this for local testing and demos:

```bash
npm start
```

Then open the app in one of these ways:

- Press `a` for Android.
- Press `i` for iOS.
- Scan the QR code with Expo Go.
- Use `npm start -- --tunnel` if the device is not on the same network.

This is a development session, not a production publish.

### Publish JavaScript Updates With EAS Update

The old `expo publish` flow is deprecated. For modern Expo projects, publish over-the-air JavaScript and asset updates with EAS Update.

First-time setup:

```bash
npx eas-cli@latest login
npx eas-cli@latest update:configure
```

The configure step connects the app to an Expo project and adds the update configuration required by EAS. Commit the generated config changes before publishing updates.

Publish an update to a channel:

```bash
npx eas-cli@latest update --channel preview --message "Update loan calculator" --environment preview
```

For production:

```bash
npx eas-cli@latest update --channel production --message "Production update" --environment production
```

Important rules:

- EAS Update can ship JavaScript, styling, and assets.
- Native dependency changes, app config changes, SDK upgrades, icons, splash screens, permissions, and other native runtime changes require a new build.
- SDK 55 and later require the `--environment` flag when publishing updates.
- Devices only receive updates from the channel embedded in their installed build.
- Restart the installed app after publishing if you want to check update download behavior immediately.

### Splash Screen Configuration

SDK 56 validates splash screens through the `expo-splash-screen` config plugin. The legacy top-level `expo.splash` field is not used; splash settings live in `app.json` under:

```json
[
  "expo-splash-screen",
  {
    "image": "./assets/splash-icon.png",
    "backgroundColor": "#ffffff"
  }
]
```

The current Expo documentation recommends this plugin-based configuration for modern SDKs.

### Dependency Audit Notes

`npm audit` currently reports a moderate transitive `uuid` advisory through Expo's config/plugin toolchain. `npm audit fix --force` attempts to resolve it by downgrading Expo packages across SDK lines, so it is not applied here. Re-check this after Expo publishes a compatible fix, and keep `npx expo-doctor` passing before release builds.

### Build Installable Apps With EAS Build

Use EAS Build when you need an APK/AAB/IPA or when a change affects native code/config.

First-time setup:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
```

Before the first store build, choose permanent native identifiers in `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.udtloancalculator"
    },
    "android": {
      "package": "com.yourcompany.udtloancalculator"
    }
  }
}
```

Do not change these identifiers after submitting to the stores unless you intend to create a different app listing.

Common builds:

```bash
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile preview
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

If `eas.json` does not exist yet, `build:configure` will create it. Keep build profiles explicit so preview builds can point at the `preview` update channel and production builds can point at the `production` channel.

Recommended `eas.json` shape:

```json
{
  "cli": {
    "version": ">= 19.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "channel": "preview",
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

Preview builds are for internal testing. Production builds are for Play Store and App Store submission.

### Deploy To Android

Use Android preview builds when you want to install the app directly on a device:

```bash
npx eas-cli@latest build --platform android --profile preview
```

The preview profile should produce an APK. After the build finishes, open the EAS build link and install the APK on a test device.

For Google Play:

1. Confirm `android.package` is set in `app.json`.
2. Create the app in Google Play Console.
3. Run the production build:

```bash
npx eas-cli@latest build --platform android --profile production
```

4. Submit the latest production build:

```bash
npx eas-cli@latest submit --platform android --profile production --latest
```

Google Play production builds should use Android App Bundle (`.aab`). EAS can manage Android signing credentials, or you can provide your own keystore if your Play Console setup requires it.

### Deploy To iOS

Use iOS preview builds for internal device testing:

```bash
npx eas-cli@latest build --platform ios --profile preview
```

For installable internal iOS builds, EAS will guide you through Apple credentials and device registration. You need access to the Apple Developer Program.

For TestFlight/App Store:

1. Confirm `ios.bundleIdentifier` is set in `app.json`.
2. Create the app record in App Store Connect.
3. Run the production build:

```bash
npx eas-cli@latest build --platform ios --profile production
```

4. Submit the latest production build:

```bash
npx eas-cli@latest submit --platform ios --profile production --latest
```

After submission, the build appears in App Store Connect. Use TestFlight for beta review and internal/external testing before submitting the app for App Store review.

### Deploy Both Platforms

To create production builds for Android and iOS together:

```bash
npx eas-cli@latest build --platform all --profile production
```

To submit the latest successful production builds:

```bash
npx eas-cli@latest submit --platform android --profile production --latest
npx eas-cli@latest submit --platform ios --profile production --latest
```

You can also build and submit in one step:

```bash
npx eas-cli@latest build --platform all --profile production --auto-submit
```

Use `--auto-submit` only after the store listings, credentials, and submit profiles are ready.

### Recommended Release Checklist

Before publishing an update or creating a store build:

```bash
npx expo-doctor
npm run typecheck
npm test
npm run lint
npm run format:check
```

Then:

1. Update `app.json` version fields when preparing a store release.
2. Confirm whether the change is OTA-safe or requires a new native build.
3. Publish to `preview` first and test on a real device.
4. Promote the same change to `production` after verification.

## Debug Guide

### Expo And Metro

- Start the app with `npm start`.
- Open the developer menu from the running app:
  - iOS simulator: press `Cmd + D`.
  - Android emulator: press `Cmd + M` on macOS or `Ctrl + M` on Windows/Linux.
  - Physical device: shake the device.
- Use the Expo terminal output for bundling errors, dependency resolution errors, and QR/device connection status.
- Use the in-app red error screen for runtime errors. The stack trace usually points to the affected component, screen, or service.

### JavaScript Debugging

- Add temporary `console.log`, `console.warn`, or `console.error` calls while investigating.
- Logs appear in the terminal that is running `npm start` and, depending on platform, in the simulator/device logs.
- Keep calculation logic debugging focused in `src/services/loanCalculator.ts`; it is covered by tests in `src/services/loanCalculator.test.ts`.
- Keep validation debugging focused in `src/utils/validators.ts`; related tests live in `src/utils/validators.test.ts`.
- Keep display formatting debugging focused in `src/utils/formatters.ts`; related tests live in `src/utils/formatters.test.ts`.

### Storage Debugging

Local data is stored with `@react-native-async-storage/async-storage`.

- Calculation history is managed in `src/services/storageService.ts`.
- New saved calculations use storage schema v2: compact inputs plus summary metadata are stored, and full amortization schedules are rebuilt from inputs when opened.
- Legacy saved calculations that include full schedules are still readable and are normalized when history is rewritten.
- Theme preference is managed in `src/context/ThemeContext.tsx`.
- Use the app's Settings screen to clear saved app data when testing history or theme behavior.
- If persisted state looks stale during development, uninstall the app from the simulator/device or clear app storage, then reload from Expo.

### Sharing And Email Debugging

Sharing and email behavior is implemented in `src/services/shareService.ts`.

- Native sharing uses React Native's `Share` API and is best tested on a real device or simulator.
- CSV schedule generation is implemented in `src/services/exportService.ts` and covered by `src/services/shareService.test.ts`.
- Email uses `expo-mail-composer`; it requires a configured mail account on the test device.
- On unsupported or unconfigured devices, the app should show an alert instead of crashing.
- The web target may not behave the same as native for share and email flows.

### Platform-Specific Notes

- iOS requires Xcode and the iOS simulator for `npm run ios`.
- Android requires Android Studio, an installed SDK, and either an emulator or connected device for `npm run android`.
- The app runs in Expo Go, but native module compatibility should still be checked after package upgrades.
- If a native dependency issue appears after an upgrade, verify the package supports the Expo SDK version in use and run `npx expo-doctor`.

### Common Issues

| Issue                                | What to try                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Metro cache or stale bundle issues   | Run `npm start -- --clear`                                                                     |
| Device cannot connect to Expo        | Make sure the computer and device are on the same network, then restart Expo                   |
| iOS simulator does not open          | Open Xcode once, install simulator components, then retry `npm run ios`                        |
| Android emulator does not open       | Start an emulator from Android Studio first, then retry `npm run android`                      |
| TypeScript import or type errors     | Run `npm run typecheck` and inspect the first reported error                                   |
| Tests fail after calculation changes | Run `npm test` and compare expected values in the relevant `*.test.ts` file                    |
| Share or email fails                 | Test on a device with native sharing/email configured and check `src/services/shareService.ts` |
| Saved history/theme seems wrong      | Clear app data from Settings, uninstall the app, or clear simulator/device storage             |

## Project Structure

```
udt-loan-calculator/
├── src/
│   ├── components/
│   │   ├── LoanCalculator/
│   │   │   ├── LoanInputs.tsx        # Loan input form with validation
│   │   │   ├── LoanResults.tsx       # Results display component
│   │   │   └── AmortizationTable.tsx # Interactive payment schedule
│   │   └── common/
│   │       ├── Button.tsx            # Themed button component
│   │       ├── CurrencySelector.tsx  # Currency picker with search
│   │       └── NumberInput.tsx       # Themed numeric input
│   ├── context/
│   │   └── ThemeContext.tsx          # Theme provider (light/dark/system)
│   ├── services/
│   │   ├── exportService.ts         # CSV schedule export helpers
│   │   ├── loanCalculator.ts         # EMI & reducing balance calculations
│   │   ├── shareService.ts           # Share & email functionality
│   │   ├── storageService.ts         # AsyncStorage persistence
│   │   └── currency.ts               # Currency utilities
│   ├── utils/
│   │   ├── formatters.ts             # Date, currency, number formatting
│   │   └── validators.ts             # Input validation
│   ├── types/
│   │   └── loan.ts                   # TypeScript type definitions
│   ├── constants/
│   │   ├── currencies.ts             # Supported currencies
│   │   └── config.ts                 # App configuration
│   └── screens/
│       ├── HomeScreen.tsx            # Main screen with loan types
│       ├── CalculatorScreen.tsx      # Loan calculation form
│       ├── AmortizationScreen.tsx    # Payment schedule view
│       └── SettingsScreen.tsx        # Theme & data settings
├── App.tsx                           # App entry point
├── package.json
└── README.md
```

## Usage Guide

### Basic Calculation

1. **Select Loan Type**: Choose from Personal, Mortgage, Auto, or Business loans
2. **Enter Loan Details**:
   - Loan Amount (with currency selection)
   - Duration (years and/or months)
   - Interest Rate (annual percentage)
   - Repayment Type (EMI or Reducing Balance)
   - Start Date
3. **Calculate**: Tap the "Calculate" button
4. **View Results**: See monthly payment, total interest, and total payable
5. **Amortization**: View detailed month-by-month breakdown

### Understanding Repayment Types

#### EMI (Equated Monthly Installment)

- Fixed monthly payment throughout the loan term
- Same amount every month
- Total interest is higher compared to reducing balance
- **Best for**: Predictable budgeting

#### Reducing Balance

- Payments decrease each month
- Principal portion is constant, interest decreases
- Total interest is lower
- **Best for**: Minimizing total interest paid

### Sharing Results

1. Navigate to the Amortization screen
2. Tap "Share" in the header
3. Choose sharing option:
   - **Share Summary**: Quick overview of loan details
   - **Share Full Schedule**: Complete payment breakdown
   - **Share CSV**: Spreadsheet-friendly amortization rows
   - **Send via Email**: Detailed report with optional amortization

## Calculation Formula

### EMI Formula

```
EMI = [P × r × (1 + r)^n] / [(1 + r)^n – 1]
```

Where:

- **P** = Principal loan amount
- **r** = Monthly interest rate (Annual Rate / 12 / 100)
- **n** = Total number of monthly payments

### Reducing Balance Formula

```
Monthly Interest = Remaining Balance × Monthly Rate
Principal Payment = Loan Amount / Total Months
Monthly Payment = Principal Payment + Monthly Interest
```

## Technologies Used

| Technology             | Purpose                |
| ---------------------- | ---------------------- |
| **React Native**       | Mobile app framework   |
| **Expo SDK 56**        | Development platform   |
| **TypeScript**         | Type safety            |
| **React Navigation**   | Screen navigation      |
| **date-fns**           | Date manipulation      |
| **AsyncStorage**       | Local data persistence |
| **expo-mail-composer** | Email integration      |
| **expo-sharing**       | Native sharing         |

## Configuration

The app's limits can be configured in `src/constants/config.ts`:

```typescript
export const CONFIG = {
  MIN_LOAN_AMOUNT: 1000,
  MAX_LOAN_AMOUNT: 100000000,
  MIN_DURATION_MONTHS: 1,
  MAX_DURATION_MONTHS: 600, // 50 years
  MIN_INTEREST_RATE: 0,
  MAX_INTEREST_RATE: 100,
  DEFAULT_DURATION_MONTHS: 12,
  DEFAULT_INTEREST_RATE: 5.0,
};
```

## Theming

The app supports three theme modes:

- **Light**: Clean white interface
- **Dark**: Eye-friendly dark interface
- **System**: Follows device settings

Theme preference is persisted and applied on app restart.

## Accessibility

The app is built with accessibility in mind:

- All interactive elements have accessibility labels
- Proper role announcements for buttons and inputs
- Support for VoiceOver (iOS) and TalkBack (Android)
- Sufficient color contrast in both themes

## Future Enhancements

- [ ] Loan comparison feature (side-by-side comparison)
- [ ] Extra payment calculator (early payoff scenarios)
- [ ] PDF export functionality
- [ ] Biometric authentication for saved data
- [ ] Cloud sync across devices
- [ ] Localization (i18n) for multiple languages
- [ ] Interest rate trends/charts
- [ ] Push notifications for payment reminders

## Known Issues

- `npm audit` reports a moderate transitive `uuid` advisory through Expo's config/plugin dependencies. The available forced fix currently downgrades Expo packages across SDK lines, so it is deferred until an Expo-compatible fix is available.

## License

This project is private and proprietary.

**Note**: This calculator is for informational purposes only. Always consult with a financial advisor or lender for actual loan terms and conditions.
