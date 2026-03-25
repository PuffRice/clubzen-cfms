import React, { useState } from "react";
import {
  PlusCircle,
  FolderOpen,
  Banknote,
  FileText,
  HelpCircle,
  Zap,
  Shield,
  Settings,
  ChevronRight,
} from "lucide-react";

interface HelpSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: string[];
  color: string;
}

const helpSections: HelpSection[] = [
  {
    id: "1",
    icon: <PlusCircle className="h-6 w-6" />,
    title: "Adding Income or Expense",
    description: "Get started by recording your first transaction",
    steps: [
      "Go to the Dashboard or click 'Add Income/Expense' from the sidebar",
      "Fill in the required fields: amount, date, category, description",
      "For income, specify the income type (one-time, recurring, etc.)",
      "For expense, select the payment method (cash, card, etc.)",
      "Click 'Submit' to save your transaction",
      "Your transaction will appear in your history and reports",
    ],
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "2",
    icon: <FolderOpen className="h-6 w-6" />,
    title: "Managing Categories",
    description: "Organize your transactions with custom categories",
    steps: [
      "Navigate to 'Manage Categories' from the sidebar",
      "Click 'Add Category' to create a new category",
      "Enter the category name and select a color",
      "Choose whether it's for income or expense",
      "Edit existing categories by clicking the edit button",
      "Delete categories you no longer need",
      "Assign categories when adding transactions",
    ],
    color: "from-purple-600 to-pink-600",
  },
  {
    id: "3",
    icon: <Banknote className="h-6 w-6" />,
    title: "Loan Feature",
    description: "Track loans easily with dedicated loan management",
    steps: [
      "Go to the 'Add Due' page from the sidebar",
      'Select "Loan Taken" to record money you borrowed',
      'Select "Loan Given" to record money you lent',
      "Enter the amount, date, and description",
      "Set up recurring reminders if needed",
      "View all loans in your transaction history",
      "Mark loans as repaid when settled",
    ],
    color: "from-emerald-600 to-teal-600",
  },
  {
    id: "4",
    icon: <FileText className="h-6 w-6" />,
    title: "Viewing Reports",
    description: "Analyze your financial data with comprehensive reports",
    steps: [
      "Click 'Reports' in the sidebar to expand the menu",
      "Select 'Daily Reports' for daily transaction summaries",
      "Select 'Monthly Reports' for monthly financial analysis",
      "View your income, expenses, and net profit/loss",
      "Check category breakdowns in pie charts",
      "Export reports as PDF for record keeping",
      "Filter reports by month or date range",
    ],
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "5",
    icon: <HelpCircle className="h-6 w-6" />,
    title: "Support Tickets",
    description: "Get help by creating support tickets",
    steps: [
      "Navigate to the 'Support' page from the sidebar",
      "Click 'Create New Ticket'",
      "Select the issue category (bug, feature request, etc.)",
      "Provide a detailed description of your issue",
      "Add any relevant attachments or screenshots",
      "Submit your ticket",
      "Track ticket status on the same page",
    ],
    color: "from-red-600 to-rose-600",
  },
  {
    id: "6",
    icon: <Settings className="h-6 w-6" />,
    title: "Settings & Profile",
    description: "Customize your account and preferences",
    steps: [
      "Click your avatar in the top-left corner",
      "Select 'Settings' to open the settings modal",
      "Update your full name and preferred currency",
      "Click 'Change Password' to update your password",
      "Enter your current password and new password",
      "Confirm your new password",
      "Changes are saved immediately",
    ],
    color: "from-indigo-600 to-blue-600",
  },
];

const HelpPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            Help & Documentation
          </h1>
          <p className="text-gray-400 text-lg">
            Learn how to use ClubZen CFMS with step-by-step guides
          </p>
        </div>

        {/* Help Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpSections.map((section) => (
            <div
              key={section.id}
              className="group"
            >
              <div
                className="relative h-full bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/50 hover:bg-slate-800/40 transition-all duration-300 cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === section.id ? null : section.id)
                }
              >
                {/* Header Background Gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.color}`}></div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      {section.icon}
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                        expandedId === section.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {section.description}
                  </p>

                  {/* Steps - Expanded */}
                  {expandedId === section.id && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-3">
                      {section.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className={`flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br ${section.color} flex items-center justify-center text-white text-xs font-bold`}>
                            {idx + 1}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-8">
          <div className="flex gap-4">
            <Zap className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Pro Tips</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <strong className="text-yellow-400">•</strong> Use consistent categories to get accurate reports and insights
                </li>
                <li>
                  <strong className="text-yellow-400">•</strong> Set up recurring transactions to save time on regular expenses
                </li>
                <li>
                  <strong className="text-yellow-400">•</strong> Review your monthly reports regularly to track spending patterns
                </li>
                <li>
                  <strong className="text-yellow-400">•</strong> Use descriptive transaction descriptions for better organization
                </li>
                <li>
                  <strong className="text-yellow-400">•</strong> Export reports for accounting or record-keeping purposes
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
            <Shield className="h-6 w-6 text-emerald-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Data Security</h4>
            <p className="text-gray-300 text-sm">
              All your data is encrypted and secured. Only authenticated users can access the app, and your password is protected with industry-standard security.
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6">
            <Zap className="h-6 w-6 text-cyan-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-2">Performance</h4>
            <p className="text-gray-300 text-sm">
              ClubZen is optimized for both desktop and mobile devices. Enjoy a smooth experience whether you're on your phone or computer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
