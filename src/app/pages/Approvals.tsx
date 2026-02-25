import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export function Approvals() {
  const approvals = [
    { id: 1, type: "Expense", description: "Client Dinner", amount: 320.50, date: "Feb 7, 2026", status: "pending" },
    { id: 2, type: "Reimbursement", description: "Office Supplies", amount: 156.00, date: "Feb 6, 2026", status: "pending" },
    { id: 3, type: "Expense", description: "Travel Expenses", amount: 1200.00, date: "Feb 5, 2026", status: "approved" },
    { id: 4, type: "Purchase", description: "Software License", amount: 499.00, date: "Feb 3, 2026", status: "rejected" },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve pending requests</p>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {approval.status === "pending" && (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    {approval.status === "approved" && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {approval.status === "rejected" && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{approval.description}</h3>
                      <p className="text-sm text-muted-foreground">{approval.type} • {approval.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-foreground">
                    ${approval.amount.toFixed(2)}
                  </span>
                  {approval.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        approval.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
