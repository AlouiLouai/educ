import { Button } from "../../../components/ui/button";
import StatCard from "../../../components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ADMIN_STATS, SUPPORT_TICKETS } from "../../../lib/data/mock";

export default function AdminDashboard() {
  return (
    <div className="container py-8 pb-16 space-y-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de pilotage</h1>
          <p className="text-muted-foreground mt-2 text-lg">Supervision, conformité et qualité.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost">Journal conformité</Button>
          <Button>Générer un rapport</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ADMIN_STATS.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets support</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sujet</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Priorité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUPPORT_TICKETS.map((ticket) => (
                <TableRow key={ticket.subject}>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>{ticket.owner}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.priorityKey as "primary" | "warning" | "muted"}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
