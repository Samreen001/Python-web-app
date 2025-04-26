"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useDataStore } from "@/lib/data-store"
import { Loader2, Download } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export function DataVisualizer() {
  const { data, columns, loading } = useDataStore()
  const { toast } = useToast()
  const [chartType, setChartType] = useState("bar")
  const [xAxis, setXAxis] = useState("")
  const [yAxis, setYAxis] = useState("")
  const [categoryField, setCategoryField] = useState("")
  const chartRef = useRef<ChartJS<"bar" | "line" | "pie">>(null)

  // Get numeric and categorical columns
  const numericColumns = columns.filter((col) => col.type === "number")
  const categoricalColumns = columns.filter((col) => col.type === "string")

  // Set default axes when data changes
  useEffect(() => {
    if (numericColumns.length > 0 && !yAxis) {
      setYAxis(numericColumns[0].id)
    }

    if (categoricalColumns.length > 0 && !xAxis) {
      setXAxis(categoricalColumns[0].id)
    }
  }, [columns, numericColumns, categoricalColumns, xAxis, yAxis])

  // Prepare chart data
  const prepareChartData = () => {
    if (!xAxis || !yAxis || data.length === 0) return null

    // Group data by x-axis value
    const groupedData: Record<string, number[]> = {}

    data.forEach((row) => {
      const xValue = String(row[xAxis] || "Unknown")
      const yValue = Number(row[yAxis])

      if (!isNaN(yValue)) {
        if (!groupedData[xValue]) {
          groupedData[xValue] = []
        }
        groupedData[xValue].push(yValue)
      }
    })

    // Calculate averages for each group
    const labels = Object.keys(groupedData)
    const values = labels.map((label) => {
      const sum = groupedData[label].reduce((acc, val) => acc + val, 0)
      return sum / groupedData[label].length
    })

    // If we have a category field, organize data by category
    if (categoryField && chartType !== "pie") {
      const categorizedData: Record<string, Record<string, number>> = {}

      data.forEach((row) => {
        const xValue = String(row[xAxis] || "Unknown")
        const yValue = Number(row[yAxis])
        const category = String(row[categoryField] || "Unknown")

        if (!isNaN(yValue)) {
          if (!categorizedData[category]) {
            categorizedData[category] = {}
          }
          if (!categorizedData[category][xValue]) {
            categorizedData[category][xValue] = 0
            categorizedData[category][xValue] = yValue
          } else {
            categorizedData[category][xValue] += yValue
          }
        }
      })

      const datasets = Object.keys(categorizedData).map((category, index) => {
        // Generate a color based on index
        const hue = (index * 137) % 360
        const color = `hsl(${hue}, 70%, 60%)`

        return {
          label: category,
          data: labels.map((label) => categorizedData[category][label] || 0),
          backgroundColor: color,
          borderColor: color,
        }
      })

      return {
        labels,
        datasets,
      }
    }

    // For pie charts or when no category is selected
    if (chartType === "pie") {
      return {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, index) => {
              const hue = (index * 137) % 360
              return `hsl(${hue}, 70%, 60%)`
            }),
          },
        ],
      }
    }

    // For bar and line charts without categories
    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data: values,
          backgroundColor: "hsl(215, 70%, 60%)",
          borderColor: "hsl(215, 70%, 60%)",
        },
      ],
    }
  }

  const chartData = prepareChartData()

  const downloadChart = () => {
    if (!chartRef.current) return

    const canvas = chartRef.current.canvas
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `chart-${new Date().toISOString()}.png`
    link.href = image
    link.click()

    toast({
      title: "Chart downloaded",
      description: "Your chart has been downloaded as a PNG image",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>Loading your data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>Upload a CSV file or use demo data to create visualizations.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          No data available. Please upload a CSV file or use the demo data.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Visualization</CardTitle>
        <CardDescription>Create charts and graphs from your data.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Chart Type</label>
              <Tabs value={chartType} onValueChange={setChartType} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="bar">Bar</TabsTrigger>
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="pie">Pie</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">X-Axis</label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Y-Axis</label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {numericColumns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartType !== "pie" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Category (Optional)</label>
                <Select value={categoryField} onValueChange={setCategoryField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categoricalColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-card">
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={downloadChart}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="h-[400px] relative">
              {chartData ? (
                <>
                  {chartType === "bar" && (
                    <Bar
                      ref={chartRef as any}
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: `${yAxis} by ${xAxis}`,
                          },
                        },
                      }}
                    />
                  )}

                  {chartType === "line" && (
                    <Line
                      ref={chartRef as any}
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: `${yAxis} by ${xAxis}`,
                          },
                        },
                      }}
                    />
                  )}

                  {chartType === "pie" && (
                    <Pie
                      ref={chartRef as any}
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                          title: {
                            display: true,
                            text: `${yAxis} by ${xAxis}`,
                          },
                        },
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Please select valid X and Y axes to generate a chart.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
