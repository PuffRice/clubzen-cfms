import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar as CalendarIcon, Plus, Clock } from "lucide-react";

export function Events() {
  const events = [
    { id: 1, title: "Tax Filing Deadline", date: "April 15, 2026", time: "11:59 PM", type: "deadline", description: "Submit annual tax returns" },
    { id: 2, title: "Budget Review Meeting", date: "February 15, 2026", time: "2:00 PM", type: "meeting", description: "Quarterly budget review with team" },
    { id: 3, title: "Investment Portfolio Review", date: "February 20, 2026", time: "10:00 AM", type: "review", description: "Review investment performance" },
    { id: 4, title: "Insurance Premium Due", date: "March 1, 2026", time: "12:00 PM", type: "payment", description: "Annual insurance payment" },
  ];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">Track important financial dates and reminders</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar View Placeholder */}
      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Calendar view coming soon</p>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-blue-600 font-medium">
                      {new Date(event.date).toLocaleDateString('en', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-xl font-bold text-blue-700">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.type === "deadline"
                        ? "bg-red-100 text-red-700"
                        : event.type === "meeting"
                        ? "bg-blue-100 text-blue-700"
                        : event.type === "review"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
