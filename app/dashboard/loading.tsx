import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-950 py-8 px-4">
      <div className="w-full max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">
          <Skeleton className="h-8 w-64 mx-auto" />
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Resumo de Status das Tarefas Skeleton */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-32" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-48" />
              </div>
              <p className="text-xs text-muted-foreground">
                <Skeleton className="h-3 w-full" />
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    <Skeleton className="h-4 w-20" />
                  </span>
                  <Skeleton className="h-6 w-10 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    <Skeleton className="h-4 w-24" />
                  </span>
                  <Skeleton className="h-6 w-10 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    <Skeleton className="h-4 w-16" />
                  </span>
                  <Skeleton className="h-6 w-10 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Tarefas por Posto de Trabalho Skeleton */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-48" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] pr-4">
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        <Skeleton className="h-4 w-32" />
                      </span>
                      <Skeleton className="h-6 w-10 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Execuções Recentes Skeleton */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-36" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] pr-4">
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium">
                        <Skeleton className="h-4 w-48" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Skeleton className="h-3 w-full" />
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        <Skeleton className="h-3 w-40" />
                      </p>
                      {index < 2 && <Skeleton className="my-2 h-px w-full" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
