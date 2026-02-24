import { Card, CardContent } from "./card";

type StatCardProps = {
  label: string;
  value: string;
  trend: string;
};

export default function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted">{label}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
        <span className="text-sm font-semibold text-primary">{trend}</span>
      </CardContent>
    </Card>
  );
}
