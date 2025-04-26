import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { DemoDataButton } from "@/components/demo-data-button"
import { DataTable } from "@/components/data-table"
import { DataVisualizer } from "@/components/data-visualizer"
import { DataFilters } from "@/components/data-filters"
import { ModeToggle } from "@/components/mode-toggle"
import { BarChart, LineChart, PieChart } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            <h1 className="text-xl font-bold">Data Explorer</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="grid gap-6">
          <section className="grid gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                  Upload your CSV data and start exploring with interactive visualizations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FileUpload />
                <DemoDataButton />
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Upload a CSV file or use our demo data to begin exploring.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
                    <div className="mb-2 p-2 rounded-full bg-primary/10">
                      <LineChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Visualize</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Create beautiful charts and graphs from your data
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
                    <div className="mb-2 p-2 rounded-full bg-primary/10">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Analyze</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Get insights with statistical analysis and summaries
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
                    <div className="mb-2 p-2 rounded-full bg-primary/10">
                      <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Share</h3>
                    <p className="text-sm text-center text-muted-foreground">Export your findings as CSV or images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Tabs defaultValue="data" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="data">Data Table</TabsTrigger>
              <TabsTrigger value="visualize">Visualize</TabsTrigger>
              <TabsTrigger value="filter">Filter & Export</TabsTrigger>
            </TabsList>
            <TabsContent value="data" className="space-y-4">
              <DataTable />
            </TabsContent>
            <TabsContent value="visualize" className="space-y-4">
              <DataVisualizer />
            </TabsContent>
            <TabsContent value="filter" className="space-y-4">
              <DataFilters />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Data Explorer. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Terms
            </Button>
            <Button variant="ghost" size="sm">
              Privacy
            </Button>
            <Button variant="ghost" size="sm">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
