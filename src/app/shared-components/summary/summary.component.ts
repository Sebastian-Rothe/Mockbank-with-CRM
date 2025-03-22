import { Component } from '@angular/core';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-summary',
  standalone: true,
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {

  downloadSummary(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const lineHeight = 5;
    const maxLineWidth = 190;
    let y = margin;

    doc.setFontSize(14); // Increased font size
    doc.setTextColor(63, 81, 181);
    doc.text('Project Overview', margin, y);
    y += lineHeight + 4; // Adjusted line height

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    const overviewText = 'This project is a comprehensive banking application with CRM functionalities built using Angular and Firebase. It includes features for user authentication, role management, account management, transfers, and more. The application also utilizes Material Design for a modern and responsive user interface.';
    const splitOverviewText = doc.splitTextToSize(overviewText, maxLineWidth);
    splitOverviewText.forEach((line: string) => {
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += lineHeight;

    doc.setFontSize(13);
    doc.setTextColor(63, 81, 181);
    doc.text('Key Features', margin, y);
    y += lineHeight + 2;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    const features = [
      { title: 'User Authentication:', items: ['Firebase Authentication: Users can log in using Firebase authentication.', 'Guest Login: Guests can log in without creating an account. Guest data is deleted upon logout.'] },
      { title: 'Role Management:', items: ['Role Change: Guests can change their role to user, admin, or manager.', 'Role-Based Access: Different functionalities are available based on the user\'s role.'] },
      { title: 'Account Management:', items: ['Create New Accounts: Users can create new accounts.', 'View and Edit Accounts: Users can view and edit account details.', 'Delete Accounts: Users can delete accounts.'] },
      { title: 'Transfers:', items: ['Send Money: Users can send money to other accounts.', 'Move Money: Users can move money between their own accounts.', 'Transfer Fees: Transfer fees are applied based on the type of transfer.', 'Transfer Details: Users can view details of their transfers.'] },
      { title: 'Automatic Interest Payment:', items: ['Interest Calculation: Interest is automatically calculated and credited to user accounts.'] },
      { title: 'Dashboard:', items: ['User Dashboard: Displays user information, account balances, and recent transfers.', 'Admin Dashboard: Displays bank statistics, user growth, and other admin-specific information.'] },
      { title: 'Profile Management:', items: ['Profile Picture: Users can upload and update their profile picture.', 'Edit Profile: Users can edit their profile information, including email and password (with email verification for non-guests).'] },
      { title: 'Statistics and Charts:', items: ['Income and Expenses Chart: Displays a chart of income and expenses.', 'User Growth Chart: Displays a chart of user growth over time.', 'Transfers Chart: Displays a chart of transfers.'] },
      { title: 'Notifications:', items: ['Snackbar Notifications: Users receive notifications for successful actions and errors.', 'Dialog Service: Users receive dialog notifications for important messages and errors.'] },
      { title: 'Dialogs:', items: ['Edit Account Dialog: Allows users to edit account details.', 'Send Money Dialog: Allows users to send money to other accounts.', 'Move Money Dialog: Allows users to move money between their own accounts.', 'Edit Interest Rate Dialog: Allows admins to edit the bank\'s interest rate.', 'Edit Transaction Fee Dialog: Allows admins to edit the bank\'s transaction fee.'] },
    ];

    features.forEach(feature => {
      doc.setFontSize(12);
      doc.setTextColor(63, 81, 181);
      doc.text(feature.title, margin, y);
      y += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      feature.items.forEach(item => {
        doc.text(`- ${item}`, margin + 5, y);
        y += lineHeight;
      });
      y += lineHeight / 2;
    });

    doc.setFontSize(11);
    doc.setTextColor(63, 81, 181);
    doc.text('Additional Functionalities', margin, y);
    y += lineHeight + 2;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    const additionalFunctionalities = [
      'Email Verification: When a non-guest user changes their email, the new email must be verified.',
      'Loading Spinner: A loading spinner is displayed during data fetching and processing.',
      'Error Handling: Comprehensive error handling with user-friendly messages.'
    ];

    additionalFunctionalities.forEach(func => {
      doc.text(`- ${func}`, margin + 5, y);
      y += lineHeight;
    });

    doc.save('Project_Summary.pdf');
  }
}
