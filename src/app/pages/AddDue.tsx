import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Calendar, Bell } from "lucide-react";
import { useState } from "react";
import { loanController } from "../services";

export function AddDue() {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: "",
    recurring: "one-time",
    frequency: "",
    reminder: true,
    notes: "",
  });

  const categories = ["Loan Taken", "Loan Given"];

  const frequencies = [
    "Weekly",
    "Bi-weekly",
    "Monthly",
    "Quarterly",
    "Yearly",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { amount, dueDate, category, title, notes } = formData;

    if (!amount || !dueDate || !category) {
      return;
    }

    const numericAmount = Number(amount);
    const date = new Date(dueDate);
    const description = notes || title;

    try {
      if (category === "Loan Taken") {
        await loanController.createLoan("taken", numericAmount, date, description);
      } else if (category === "Loan Given") {
        await loanController.createLoan("given", numericAmount, date, description);
      }

      setFormData({
        title: "",
        amount: "",
        dueDate: "",
        category: "",
        recurring: "one-time",
        frequency: "",
        reminder: true,
        notes: "",
      });
    } catch (err) {
      console.error("Failed to save loan", err);
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Loan</h1>
        <p className="text-muted-foreground mt-1">
          Configure a loan payment reminder or recurring loan installment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Due Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Payment Title *</Label>
                    <input
                      id="title"
                      type="text"
                      placeholder="e.g., Monthly Rent, Electric Bill"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <input
                      id="dueDate"
                      type="date"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recurring */}
                  <div>
                    <Label htmlFor="recurring">Payment Type *</Label>
                    <select
                      id="recurring"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.recurring}
                      onChange={(e) =>
                        setFormData({ ...formData, recurring: e.target.value })
                      }
                    >
                      <option value="one-time">One-time Payment</option>
                      <option value="recurring">Recurring Payment</option>
                    </select>
                  </div>
                </div>

                {/* Frequency (shown only if recurring) */}
                {formData.recurring === "recurring" && (
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <select
                      id="frequency"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                    >
                      <option value="">Select frequency</option>
                      {frequencies.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reminder */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="reminder"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={formData.reminder}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder: e.target.checked })
                    }
                  />
                  <Label htmlFor="reminder" className="flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    Send me a reminder 3 days before due date
                  </Label>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Due Payment
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 mb-1">Amount Due</p>
                  <p className="text-3xl font-bold text-orange-700">
                    ${formData.amount || "0.00"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">
                      {formData.dueDate || "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">
                      {formData.category || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">
                      {formData.recurring.replace("-", " ")}
                    </span>
                  </div>
                  {formData.recurring === "recurring" && formData.frequency && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium">{formData.frequency}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
