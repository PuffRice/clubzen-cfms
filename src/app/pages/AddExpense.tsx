import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * Legacy add-expense route. The actual form is now rendered inside a
 * dialog on the Expenses listing page. Users who navigate here should
 * be redirected to /expenses so the dialog can be opened from that
 * page instead.
 */
export function AddExpense() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    paymentMethod: "",
  });

  const categories = [
    "Groceries",
    "Transportation",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Dining",
    "Shopping",
    "Other",
  ];

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Digital Wallet",
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    try {
      await transactionController.addExpense(
        Number(formData.amount),
        new Date(formData.date),
        formData.category,
        formData.description || formData.category,
        formData.paymentMethod || undefined,
      );
      setFormSuccess(true);
      setFormData({ amount: "", category: "", date: new Date().toISOString().split('T')[0], description: "", paymentMethod: "" });
    } catch (err: unknown) {
      setFormError((err as Error).message);
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
        <p className="text-muted-foreground mt-1">Record a new expense transaction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Expense Details
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

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
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

                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <select
                      id="paymentMethod"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value })
                      }
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
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
                    placeholder="Add notes about this expense..."
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-input-background text-foreground"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <Label>Attach Receipt</Label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">Expense saved successfully!</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Save Expense
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
                    ${formData.amount || "0.00"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">
                      {formData.category || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formData.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment</span>
                    <span className="font-medium">
                      {formData.paymentMethod || "Not selected"}
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
=======
  useEffect(() => {
    navigate('/expenses?add=true', { replace: true });
  }, [navigate]);
  return null;
>>>>>>> 9dd7fad52837847522d3d7bab880c4f512e06c4d
}
