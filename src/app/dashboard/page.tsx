// app/dashboard/page.tsx
"use client";

// Import only what's needed for the OVERVIEW content
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// You might have Avatar components if you show messages summary here, but NOT the main header Avatar.

export default function OverviewDashboardPage() {
  // const { data: session } = useSession(); // Not needed if userName is in layout
  // const userName = session?.user?.name || "User"; // Already in layout
  // const [role, setRole] = useState("buyer"); // DELETE THIS - This logic is handled by the layout

  return (
    // No <main> tag needed here, as the layout provides it.
    // No MinimalHeader or the main "Hello, {userName}" and role switcher buttons - they are in the layout.
    <div className="space-y-10"> {/* Or any other root element for the overview content */}
      {/* Summary Cards Specific to Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:bg-teal-600 hover:text-white hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <CardHeader><CardTitle>Overall Purchases</CardTitle></CardHeader>
          <CardContent>Data Here</CardContent>
        </Card>
        <Card className="hover:bg-teal-600 hover:text-white hover:-translate-y-1 transition-all duration-200 cursor-pointer">
          <CardHeader><CardTitle>Overall Listings</CardTitle></CardHeader>
          <CardContent>Data Here</CardContent>
        </Card>
        {/* ... other overview-specific summary cards ... */}
      </div>

      {/* Action Buttons Specific to Overview */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" className="hover:bg-black hover:text-white transition-colors">Browse All Items</Button>
        <Button variant="outline" className="hover:bg-black hover:text-white transition-colors">View Recent Activity</Button>
        {/* ... other overview-specific action buttons ... */}
      </div>

      <Separator />

      {/* Section: Recent Orders (Example - could be on overview) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Orders Summary</h2>
        {/* ... content for recent orders ... */}
      </div>

      {/* Section: Messages Summary (Example - could be on overview) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Messages Overview</h2>
        {/* ... content for messages overview ... */}
      </div>
    </div>
  );
}