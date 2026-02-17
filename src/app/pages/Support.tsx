import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react";

export function Support() {
  const faqs = [
    { question: "How do I add a new expense?", answer: "Click on the 'Add New Expense' button on the dashboard or navigate to the Expenses page." },
    { question: "How can I generate a financial report?", answer: "Go to the Reports section and click 'Create New Report' to generate custom financial reports." },
    { question: "How do I link my bank account?", answer: "Navigate to Bank Details and follow the secure connection process to link your account." },
    { question: "Can I export my data?", answer: "Yes, you can export your data in various formats from the Reports section." },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 mt-1">Get help with your account</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-4">Chat with our support team</p>
            <Button variant="outline" className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-sm text-gray-500 mb-4">support@financeflow.com</p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-sm text-gray-500 mb-4">1-800-FINANCE</p>
            <Button variant="outline" className="w-full">Call Now</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
