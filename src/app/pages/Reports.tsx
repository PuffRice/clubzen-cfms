import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { FileText, Download, Plus, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../components/ui/dialog";

export function Reports() {
  const userRole = sessionStorage.getItem("userRole") ?? "Staff";
  const isAdmin = userRole === "Admin";
  const [editOpen, setEditOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState<number | null>(null);
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
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isAdmin}
                  onClick={() => {
                    setEditingReportId(report.id);
                    setEditOpen(true);
                  }}
                  className={`gap-2 ${
                    isAdmin
                      ? "hover:bg-blue-600 hover:text-white cursor-pointer"
                      : "opacity-50 cursor-not-allowed text-gray-500"
                  }`}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Report Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Report Name</label>
              <input
                type="text"
                defaultValue={reports.find((r) => r.id === editingReportId)?.name}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Period</label>
              <input
                type="text"
                defaultValue={reports.find((r) => r.id === editingReportId)?.period}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Update Report
            </Button>
          </div>
          <DialogClose className="absolute top-2 right-2">
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
