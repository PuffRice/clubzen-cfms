import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Download, Plus } from "lucide-react";

export function Reports() {
  const reports = [
    { id: 1, name: "Monthly Expense Report", period: "January 2026", generated: "Feb 1, 2026" },
    { id: 2, name: "Annual Income Summary", period: "2025", generated: "Jan 15, 2026" },
    { id: 3, name: "Tax Report", period: "Q4 2025", generated: "Jan 10, 2026" },
    { id: 4, name: "Budget Analysis", period: "December 2025", generated: "Jan 5, 2026" },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">View and generate financial reports</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Report
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                {report.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Period:</span> {report.period}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Generated:</span> {report.generated}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
