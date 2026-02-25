import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Building2, Plus, CreditCard } from "lucide-react";

export function BankDetails() {
  const accounts = [
    { id: 1, bank: "Chase Bank", accountNumber: "****4521", type: "Checking", balance: 45000 },
    { id: 2, bank: "Wells Fargo", accountNumber: "****7893", type: "Savings", balance: 26000 },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Details</h1>
          <p className="text-muted-foreground mt-1">Manage your connected bank accounts</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Link New Account
        </Button>
      </div>

      {/* Connected Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {accounts.map((account) => (
          <Card key={account.id} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {account.bank}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-mono">{account.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium">{account.type}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-bold text-xl">${account.balance.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:bg-red-50">
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </span>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center text-white font-bold">
                  VISA
                </div>
                <div>
                  <p className="font-semibold">**** **** **** 1234</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
