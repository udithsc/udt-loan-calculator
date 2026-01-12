import { Share, Alert, Platform } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { LoanResults } from '../types/loan';
import { formatCurrency, formatDate, formatPercentage, formatDuration } from '../utils/formatters';

export const shareLoanResults = async (results: LoanResults): Promise<boolean> => {
  const {
    loanAmount,
    durationMonths,
    interestRate,
    monthlyPayment,
    totalInterestPaid,
    totalAmountPayable,
    startDate,
    payOffDate,
    currency,
    repaymentType,
  } = results;

  const repaymentLabel = repaymentType === 'reducing' ? 'Reducing Balance' : 'Equated Monthly Installment';
  const paymentLabel = repaymentType === 'reducing' ? 'First Month Payment' : 'Monthly Payment';

  const text = `📊 Loan Calculator Results

💰 Loan Details:
• Loan Amount: ${formatCurrency(loanAmount, currency)}
• Duration: ${formatDuration(durationMonths)}
• Interest Rate: ${formatPercentage(interestRate)}
• Repayment Type: ${repaymentLabel}

📈 Payment Summary:
• ${paymentLabel}: ${formatCurrency(monthlyPayment, currency)}
• Total Interest: ${formatCurrency(totalInterestPaid, currency)}
• Total Payable: ${formatCurrency(totalAmountPayable, currency)}

📅 Timeline:
• Start Date: ${formatDate(startDate)}
• Pay-off Date: ${formatDate(payOffDate)}

Calculated with Universal Loan Calculator`;

  try {
    const result = await Share.share({
      message: text,
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing:', error);
    Alert.alert(
      'Share Failed',
      'Unable to share the results. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

export const shareAmortizationSchedule = async (
  results: LoanResults
): Promise<boolean> => {
  const { amortizationSchedule, currency, loanAmount, durationMonths, interestRate, repaymentType } = results;

  const repaymentLabel = repaymentType === 'reducing' ? 'Reducing Balance' : 'EMI';

  let text = `📊 Amortization Schedule\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Loan: ${formatCurrency(loanAmount, currency)} | ${durationMonths} months | ${formatPercentage(interestRate)} (${repaymentLabel})\n\n`;

  text += `# | Date | Payment | Interest | Principal | Balance\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  amortizationSchedule.forEach((entry) => {
    text += `${entry.month} | ${formatDate(entry.date)} | ${formatCurrency(entry.payment, currency)} | ${formatCurrency(entry.interest, currency)} | ${formatCurrency(entry.principal, currency)} | ${formatCurrency(entry.balance, currency)}\n`;
  });

  text += `\nCalculated with Universal Loan Calculator`;

  try {
    const result = await Share.share({
      message: text,
    });
    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Error sharing amortization schedule:', error);
    Alert.alert(
      'Share Failed',
      'Unable to share the schedule. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

export const sendLoanResultsByEmail = async (
  results: LoanResults
): Promise<boolean> => {
  const {
    loanAmount,
    durationMonths,
    interestRate,
    monthlyPayment,
    totalInterestPaid,
    totalAmountPayable,
    startDate,
    payOffDate,
    currency,
    repaymentType,
    amortizationSchedule,
  } = results;

  const repaymentLabel = repaymentType === 'reducing' ? 'Reducing Balance' : 'EMI';
  const paymentLabel = repaymentType === 'reducing' ? 'First Month Payment' : 'Monthly Payment';

  // Check if mail composer is available
  const isAvailable = await MailComposer.isAvailableAsync();

  if (!isAvailable) {
    Alert.alert(
      'Email Not Available',
      'Email is not configured on this device. Please set up an email account in your device settings.',
      [{ text: 'OK' }]
    );
    return false;
  }

  let amortizationText = '';
  if (amortizationSchedule.length <= 60) {
    amortizationText = '\n\n--- AMORTIZATION SCHEDULE ---\n\n';
    amortizationText += 'Month | Date | Payment | Interest | Principal | Balance\n';
    amortizationText += '------|------|---------|----------|-----------|--------\n';

    amortizationSchedule.forEach((entry) => {
      amortizationText += `${entry.month} | ${formatDate(entry.date)} | ${formatCurrency(entry.payment, currency)} | ${formatCurrency(entry.interest, currency)} | ${formatCurrency(entry.principal, currency)} | ${formatCurrency(entry.balance, currency)}\n`;
    });
  }

  const body = `LOAN CALCULATOR RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━

LOAN DETAILS:
• Loan Amount: ${formatCurrency(loanAmount, currency)}
• Duration: ${formatDuration(durationMonths)}
• Interest Rate: ${formatPercentage(interestRate)}
• Repayment Type: ${repaymentLabel}

PAYMENT SUMMARY:
• ${paymentLabel}: ${formatCurrency(monthlyPayment, currency)}
• Total Interest: ${formatCurrency(totalInterestPaid, currency)}
• Total Payable: ${formatCurrency(totalAmountPayable, currency)}

TIMELINE:
• Start Date: ${formatDate(startDate)}
• Pay-off Date: ${formatDate(payOffDate)}
${amortizationText}
---
Calculated with Universal Loan Calculator`;

  try {
    const result = await MailComposer.composeAsync({
      subject: `Loan Calculator: ${formatCurrency(loanAmount, currency)} - ${formatDuration(durationMonths)}`,
      body: body,
      isHtml: false,
    });

    return result.status === MailComposer.MailComposerStatus.SENT;
  } catch (error) {
    console.error('Error sending email:', error);
    Alert.alert(
      'Email Failed',
      'Unable to compose email. Please try again.',
      [{ text: 'OK' }]
    );
    return false;
  }
};
