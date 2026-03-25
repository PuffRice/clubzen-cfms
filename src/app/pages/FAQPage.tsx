import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    category: "General Usage",
    question: "How do I log in?",
    answer: "Use your registered email and password. Only authenticated users can access the app.",
  },
  {
    id: "2",
    category: "General Usage",
    question: "How do I add an expense or income?",
    answer: "Go to the Dashboard, select Add Expense or Add Income, fill in the required fields, and submit.",
  },
  {
    id: "3",
    category: "General Usage",
    question: "How do I categorize transactions?",
    answer: "Use the Manage Categories page to add, edit, or delete categories. Select a category when adding a transaction.",
  },
  {
    id: "4",
    category: "General Usage",
    question: "How do I view reports?",
    answer: "Navigate to the Reports section for daily, monthly, and profit/loss summaries. Reports can be exported as PDF.",
  },
  {
    id: "5",
    category: "Loan & Due Management",
    question: "How do I add a due?",
    answer: "Use the Add Due page. Fill in the amount, date, and party details. Dues are tracked in the due list.",
  },
  {
    id: "6",
    category: "Loan & Due Management",
    question: "How are loans recorded?",
    answer: '"Loan Taken" is recorded as income, "Loan Given" as expense. Both are visible in transaction history and reports.',
  },
  {
    id: "7",
    category: "Loan & Due Management",
    question: "How do I mark a due as repaid?",
    answer: "Use the due repayment option in the Add Due page or transaction history.",
  },
  {
    id: "8",
    category: "Settings & Profile",
    question: "How do I change my password?",
    answer: "Go to Settings, enter your current and new password. The new password must be at least 6 characters.",
  },
  {
    id: "9",
    category: "Settings & Profile",
    question: "How do I update my profile?",
    answer: "Click the user icon, open account options, and update your details.",
  },
  {
    id: "10",
    category: "Settings & Profile",
    question: "How do I manage currency?",
    answer: "Change your preferred currency in the Settings page.",
  },
  {
    id: "11",
    category: "Help & Support",
    question: "How do I contact support?",
    answer: "Use the Support page to submit a ticket. You will receive a notification when your request is submitted.",
  },
  {
    id: "12",
    category: "Help & Support",
    question: "Where can I find help documentation?",
    answer: "Visit the Help page from the sidebar for guides and tips.",
  },
  {
    id: "13",
    category: "Other Features",
    question: "Is the app responsive?",
    answer: "Yes, the UI works on both mobile devices and browsers.",
  },
  {
    id: "14",
    category: "Other Features",
    question: "Can I export reports?",
    answer: "Yes, reports can be exported as PDF from the Reports section.",
  },
];

const FAQPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFAQs = filteredFAQs.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    "General Usage": {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-400",
    },
    "Loan & Due Management": {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
    },
    "Settings & Profile": {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
    },
    "Help & Support": {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
    },
    "Other Features": {
      bg: "bg-pink-500/10",
      border: "border-pink-500/30",
      text: "text-pink-400",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg">Find answers to common questions quickly</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        {Object.entries(groupedFAQs).map(([category, items]) => {
          const colors = categoryColors[category] || categoryColors["General Usage"];
          return (
            <div key={category} className="mb-10">
              <h2 className={`text-xl font-bold mb-4 px-4 py-2 rounded-lg w-fit ${colors.bg} ${colors.text}`}>
                {category}
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg transition-all duration-200 ${
                      expandedId === item.id
                        ? "bg-slate-700/30 border-blue-500/50 shadow-lg shadow-blue-500/10"
                        : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600/50"
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <span className="font-semibold text-white text-lg">{item.question}</span>
                      <ChevronDown
                        className={`h-5 w-5 text-blue-400 transition-transform duration-200 flex-shrink-0 ${
                          expandedId === item.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedId === item.id && (
                      <div className="px-6 pb-4 border-t border-slate-700/50 pt-4">
                        <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No FAQs match your search. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
