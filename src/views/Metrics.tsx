import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function Metrics() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Recruitment Metrics</h1>
      <p className="text-muted-foreground">
        Track and analyze your recruitment performance metrics.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Time to Hire</CardTitle>
            <CardDescription>Average days to fill a position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">32 days</div>
            <p className="text-sm text-muted-foreground">
              ↓ 12% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Offer Acceptance Rate</CardTitle>
            <CardDescription>Percentage of accepted offers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78%</div>
            <p className="text-sm text-muted-foreground">
              ↑ 5% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Candidate Quality</CardTitle>
            <CardDescription>Average candidate rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.2/5</div>
            <p className="text-sm text-muted-foreground">
              ↑ 0.3 from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-muted-foreground mt-4">
        This is a placeholder view. Full implementation coming soon.
      </div>
    </div>
  );
}
