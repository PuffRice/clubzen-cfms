import React from "react";

const FAQPage: React.FC = () => (
  <div className="p-8 bg-background text-foreground max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions (FAQ)</h1>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">General Usage</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li><strong>How do I log in?</strong> Use your registered email and password. Only authenticated users can access the app.</li>
        <li><strong>How do I add an expense or income?</strong> Go to the Dashboard, select Add Expense or Add Income, fill in the required fields, and submit.</li>
        <li><strong>How do I categorize transactions?</strong> Use the Manage Categories page to add, edit, or delete categories. Select a category when adding a transaction.</li>
        <li><strong>How do I view reports?</strong> Navigate to the Reports section for daily, monthly, and profit/loss summaries. Reports can be exported as PDF.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Loan & Due Management</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li><strong>How do I add a due?</strong> Use the Add Due page. Fill in the amount, date, and party details. Dues are tracked in the due list.</li>
        <li><strong>How are loans recorded?</strong> "Loan Taken" is recorded as income, "Loan Given" as expense. Both are visible in transaction history and reports.</li>
        <li><strong>How do I mark a due as repaid?</strong> Use the due repayment option in the Add Due page or transaction history.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Settings & Profile</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li><strong>How do I change my password?</strong> Go to Settings, enter your current and new password. The new password must be at least 8 characters, include an uppercase letter and a number.</li>
        <li><strong>How do I update my profile?</strong> Click the user icon, open account options, and update your details.</li>
        <li><strong>How do I manage currency?</strong> Change your preferred currency in the Settings page.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Help & Support</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li><strong>How do I contact support?</strong> Use the Support page to submit a ticket. You will receive a notification when your request is submitted.</li>
        <li><strong>Where can I find help documentation?</strong> Visit the Help page from the sidebar for guides and tips.</li>
        <li><strong>How do I view FAQs?</strong> This FAQ page answers common questions. For more, check Help or contact support.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Other Features</h2>
      <ul className="list-disc ml-6 text-muted-foreground">
        <li><strong>Is the app responsive?</strong> Yes, the UI works on both mobile devices and browsers.</li>
        <li><strong>Can staff add transactions?</strong> Yes, staff can add new income or expense transactions as per their role.</li>
        <li><strong>How is my data secured?</strong> Only authenticated users can access the app. Passwords follow security policies.</li>
        <li><strong>Can I export reports?</strong> Yes, reports can be exported as PDF from the Reports section.</li>
      </ul>
    </section>
  </div>
);

export default FAQPage;
