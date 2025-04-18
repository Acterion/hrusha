import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function Positions() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Open Positions</h1>
      <p className="text-muted-foreground">
        View and manage all open positions in your organization.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Frontend Developer</CardTitle>
            <CardDescription>Engineering • Full-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span>Candidates: 12</span>
              <span>Open since: Apr 10, 2023</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Backend Engineer</CardTitle>
            <CardDescription>Engineering • Full-time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span>Candidates: 8</span>
              <span>Open since: May 5, 2023</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>UX Designer</CardTitle>
            <CardDescription>Design • Contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span>Candidates: 5</span>
              <span>Open since: Jun 15, 2023</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-muted-foreground mt-4">
        This is a placeholder view. Full implementation coming soon.
      </div>
    </div>
  );
}
