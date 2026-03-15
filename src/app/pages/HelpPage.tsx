import React from "react";

const HelpPage: React.FC = () => (
  <div className="p-8 bg-background text-foreground max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Help & Documentation</h1>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Adding Income or Expense</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Go to the Dashboard or the Add Income/Add Expense page.</li>
        <li>Fill in the required fields: amount, date, category, description.</li>
        <li>For income, you can specify the income type (e.g., one-time, recurring).</li>
        <li>For expense, you can specify the payment method (cash, card, etc.).</li>
        <li>Click "Submit" to save your transaction.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Managing Categories</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Navigate to the "Manage Categories" page from the sidebar.</li>
        <li>Add new categories for income or expense by clicking "Add Category".</li>
        <li>Edit or delete existing categories using the edit and delete buttons.</li>
        <li>Choose a color for each category to organize your transactions visually.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Loan Feature</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Go to the "Add Due" page to record loans.</li>
        <li>"Loan Taken" will be recorded as income, "Loan Given" as expense.</li>
        <li>Fill in the amount, date, description, and select the loan type.</li>
        <li>Loans are tracked and can be viewed in reports and transaction history.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Opening Support Tickets</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>Navigate to the "Support" page from the sidebar.</li>
        <li>Fill in the issue details and submit your ticket.</li>
        <li>Track the status of your support tickets in the same page.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Other Features & Tips</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li>View daily and monthly reports in the "Reports" section.</li>
        <li>Customize your settings in the "Settings" page (currency, theme, etc.).</li>
        <li>Bank details can be managed in the "Bank Details" page.</li>
        <li>Events and approvals are accessible from their respective pages.</li>
        <li>For any issue, use the support ticket system for assistance.</li>
      </ul>
    </section>
    <section>
      <h2 className="text-xl font-semibold mb-2">FAQ</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li><strong>How do I edit a transaction?</strong> Go to the transaction history, select the transaction, and click edit.</li>
        <li><strong>Can I export reports?</strong> Yes, use the export option in the Reports page.</li>
        <li><strong>How do I reset my password?</strong> Use the Settings page or contact support.</li>
      </ul>
    </section>
  </div>
);

export default HelpPage;
