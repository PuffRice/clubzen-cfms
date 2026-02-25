import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { transactionController } from "../services";

export function AddIncome() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    type: "",
  });

  const sources = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Bonus",
    "Gift",
    "Other",
  ];

  const incomeTypes = [
    "Recurring",
    "One-time",
    "Passive",
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    try {
      await transactionController.addIncome(
        Number(formData.amount),
        new Date(formData.date),
        formData.source,
        formData.description || formData.source,
        formData.type || undefined,
      );
      setFormSuccess(true);
      setFormData({ amount: "", source: "", date: new Date().toISOString().split('T')[0], description: "", type: "" });
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Add Income</h1>
        <p className="text-muted-foreground mt-1">Record a new income transaction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Income Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Source */}
                  <div>
                    <Label htmlFor="source">Income Source *</Label>
                    <select
                      id="source"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                    >
                      <option value="">Select a source</option>
                      {sources.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <input
                      id="date"
                      type="date"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type">Income Type *</Label>
                    <select
                      id="type"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="">Select type</option>
                      {incomeTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Add notes about this income..."
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">Income saved successfully!</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Save Income
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/")}>
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
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/20 rounded-lg border border-primary/30">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-foreground">
                    +${formData.amount || "0.00"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">
                      {formData.source || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formData.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">
                      {formData.type || "Not selected"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
