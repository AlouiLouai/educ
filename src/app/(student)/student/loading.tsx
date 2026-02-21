import { Skeleton } from "../../../components/ui/skeleton";
import { Card, CardContent } from "../../../components/ui/card";

export default function StudentLoading() {
  return (
    <div className="container py-8 space-y-10">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24 hidden sm:block" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-black/5">
                <Skeleton className="aspect-[5/3] w-full" />
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
