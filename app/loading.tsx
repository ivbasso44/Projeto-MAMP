import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function Loading() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-screen-2xl mx-auto my-8 px-4 py-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-center">MEIOS AUXILIARES E MEDIÇÃO PARA PRODUÇÃO</CardTitle>
          <CardDescription className="text-center">
            Gerenciamento de tarefas de manutenção com histórico, agendamento e visualização em calendário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {" "}
              {/* Alterado para 3 colunas */}
              <TabsTrigger value="table">Lista de Tarefas</TabsTrigger>
              <TabsTrigger value="calendar">Calendário de Prazos</TabsTrigger>
              <TabsTrigger value="gantt">Gráfico de Gantt</TabsTrigger> {/* Nova aba */}
            </TabsList>
            <TabsContent value="table" className="mt-4">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <Skeleton className="h-10 w-full sm:max-w-md" />
                  <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-end">
                    <Skeleton className="h-10 w-full sm:w-[150px]" />
                    <Skeleton className="h-10 w-full sm:w-[150px]" />
                    <Skeleton className="h-10 w-full sm:w-[150px]" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-6 w-24 hidden sm:block" />
                  <Skeleton className="h-10 w-full sm:w-[180px]" />
                  <Skeleton className="h-10 w-full sm:w-[220px]" />
                  <Skeleton className="h-10 w-full sm:w-[120px]" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[700px] md:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px] sm:w-[200px]">
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                      <TableHead className="w-[200px] sm:w-[250px]">
                        <Skeleton className="h-4 w-32" />
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </TableHead>
                      <TableHead className="text-center w-[120px]">
                        <Skeleton className="h-4 w-24 mx-auto" />
                      </TableHead>
                      <TableHead className="text-center w-[100px]">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="text-right w-[150px]">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-6 w-20 mx-auto" />
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-64" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-[300px] w-[300px] rounded-md border" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold mb-2">
                      <Skeleton className="h-6 w-48" />
                    </h3>
                    <ul className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                          <p className="font-medium">
                            <Skeleton className="h-4 w-48" />
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Skeleton className="h-3 w-64" />
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="gantt" className="mt-4">
              {" "}
              {/* Novo esqueleto para o Gantt */}
              <Card className="w-full overflow-hidden">
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-64" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto rounded-md border h-[400px]">
                    <div
                      className="sticky left-0 z-10 grid bg-background"
                      style={{ gridTemplateColumns: `200px repeat(90, 30px)`, height: 60 }}
                    >
                      <div className="flex items-center border-b border-r p-2 font-semibold">
                        <Skeleton className="h-4 w-24" />
                      </div>
                      {Array.from({ length: 90 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center border-b border-r text-xs"
                        >
                          <Skeleton className="h-3 w-6" />
                          <Skeleton className="h-3 w-8 mt-1" />
                        </div>
                      ))}
                    </div>
                    <div className="relative" style={{ width: 90 * 30 + 200, height: 300 }}>
                      {Array.from({ length: 5 }).map((_, taskIndex) => (
                        <div
                          key={taskIndex}
                          className="grid items-center border-b"
                          style={{
                            gridTemplateColumns: `200px 1fr`,
                            height: 40,
                          }}
                        >
                          <div className="flex h-full items-center border-r p-2 text-sm font-medium">
                            <Skeleton className="h-4 w-40" />
                          </div>
                          <div className="relative h-full">
                            <Skeleton
                              className="absolute h-3/5 rounded-sm"
                              style={{
                                left: `${Math.random() * 500}px`,
                                width: `${Math.random() * 300 + 50}px`,
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
