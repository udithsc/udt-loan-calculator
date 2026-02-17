# Universal Loan Calculator

A modern, feature-rich React Native (Expo) mobile application for universal loan calculations. Calculate loan payments using multiple methods, view detailed amortization schedules, and share results across any country and currency.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
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
- **Email Integration**: Send detailed results via email using device mail client

### Technical Features
- **Offline Support**: Works without internet connection
- **Data Persistence**: Saves theme preferences and calculation history
- **Cross-Platform**: Works on iOS and Android
- **Accessibility**: Full VoiceOver/TalkBack support with proper labels

## Screenshots

| Home Screen | Calculator | Results | Amortization |
|-------------|------------|---------|--------------|
| Loan types & history | Input form | Payment breakdown | Monthly schedule |

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- For iOS: Xcode (on macOS)
- For Android: Android Studio

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

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

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

| Technology | Purpose |
|------------|---------|
| **React Native** | Mobile app framework |
| **Expo** | Development platform |
| **TypeScript** | Type safety |
| **React Navigation** | Screen navigation |
| **date-fns** | Date manipulation |
| **AsyncStorage** | Local data persistence |
| **expo-mail-composer** | Email integration |
| **expo-sharing** | Native sharing |

## Configuration

The app's limits can be configured in `src/constants/config.ts`:

```typescript
export const CONFIG = {
  MIN_LOAN_AMOUNT: 1000,
  MAX_LOAN_AMOUNT: 100000000,
  MIN_DURATION_MONTHS: 1,
  MAX_DURATION_MONTHS: 600,    // 50 years
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

None currently. Please report issues via the project's issue tracker.

## License

This project is private and proprietary.

**Note**: This calculator is for informational purposes only. Always consult with a financial advisor or lender for actual loan terms and conditions.
