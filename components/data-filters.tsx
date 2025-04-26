"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useDataStore } from "@/lib/data-store"
import { Download, Filter, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DataFilters() {
  const { data, columns, loading } = useDataStore()
  const { toast } = useToast()
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [filteredData, setFilteredData] = useState<Record<string, any>[]>([])
  const [hasFiltered, setHasFiltered] = useState(false)

  // Get numeric and categorical columns
  const numericColumns = columns.filter((col) => col.type === "number")
  const categoricalColumns = columns.filter((col) => col.type === "string")

  // Get min/max values for numeric columns
  const ranges = numericColumns.reduce(
    (acc, col) => {
      const values = data.map((row) => Number(row[col.id])).filter((val) => !isNaN(val))
      acc[col.id] = {
        min: Math.min(...values),
        max: Math.max(...values),
        current: [Math.min(...values), Math.max(...values)],
      }
      return acc
    },
    {} as Record<string, { min: number; max: number; current: [number, number] }>,
  )

  // Get unique values for categorical columns
  const uniqueValues = categoricalColumns.reduce(
    (acc, col) => {
      const values = [...new Set(data.map((row) => String(row[col.id])))].filter(Boolean)
      acc[col.id] = values
      return acc
    },
    {} as Record<string, string[]>,
  )

  const handleNumericFilterChange = (column: string, values: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      [column]: values,
    }))
  }

  const handleCategoricalFilterChange = (column: string, value: string, checked: boolean) => {
    setFilters((prev) => {
      const currentValues = prev[column] || []
      if (checked) {
        return { ...prev, [column]: [...currentValues, value] }
      } else {
        return { ...prev, [column]: currentValues.filter((v: string) => v !== value) }
      }
    })
  }

  const applyFilters = () => {
    const filtered = data.filter((row) => {
      // Check if row passes all filters
      return Object.entries(filters).every(([column, filterValue]) => {
        // For numeric columns (ranges)
        if (ranges[column]) {
          const value = Number(row[column])
          const [min, max] = filterValue as [number, number]
          return value >= min && value <= max
        }

        // For categorical columns (selected values)
        if (uniqueValues[column]) {
          const selectedValues = filterValue as string[]
          // If no values selected, don't filter
          if (!selectedValues.length) return true
          return selectedValues.includes(String(row[column]))
        }

        return true
      })
    })

    setFilteredData(filtered)
    setHasFiltered(true)

    toast({
      title: "Filters applied",
      description: `Showing ${filtered.length} of ${data.length} rows`,
    })
  }

  const resetFilters = () => {
    // Reset all filters
    const resetFiltersObj = {} as Record<string, any>

    // Reset numeric filters to full range
    Object.keys(ranges).forEach((column) => {
      resetFiltersObj[column] = [ranges[column].min, ranges[column].max]
    })

    // Reset categorical filters to empty arrays
    Object.keys(uniqueValues).forEach((column) => {
      resetFiltersObj[column] = []
    })

    setFilters(resetFiltersObj)
    setHasFiltered(false)
    setFilteredData([])
  }

  const downloadCSV = () => {
    const dataToExport = hasFiltered ? filteredData : data

    if (dataToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "Please apply filters or load data first",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const headers = columns.map((col) => col.name).join(",")
    const rows = dataToExport
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col.id]
            // Handle values with commas by quoting them
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      )
      .join("\n")

    const csvContent = `${headers}\n${rows}`

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `data-export-${new Date().toISOString()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "CSV downloaded",
      description: `Exported ${dataToExport.length} rows of data`,
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filter & Export</CardTitle>
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
          <CardTitle>Filter & Export</CardTitle>
          <CardDescription>Upload a CSV file or use demo data to filter and export.</CardDescription>
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
        <CardTitle>Filter & Export</CardTitle>
        <CardDescription>Filter your data and export the results.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Numeric Filters */}
          {numericColumns.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Numeric Filters</h3>
              <div className="grid gap-4">
                {numericColumns.map((column) => {
                  const range = ranges[column.id]
                  if (!range) return null

                  const currentValue = (filters[column.id] || range.current) as [number, number]

                  return (
                    <div key={column.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>{column.name}</Label>
                        <div className="text-sm text-muted-foreground">
                          {currentValue[0].toFixed(2)} - {currentValue[1].toFixed(2)}
                        </div>
                      </div>
                      <Slider
                        min={range.min}
                        max={range.max}
                        step={(range.max - range.min) / 100}
                        value={currentValue}
                        onValueChange={(value) => handleNumericFilterChange(column.id, value as [number, number])}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Categorical Filters */}
          {categoricalColumns.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Categorical Filters</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categoricalColumns.map((column) => {
                  const values = uniqueValues[column.id]
                  if (!values || values.length === 0) return null

                  const selectedValues = filters[column.id] || []

                  return (
                    <div key={column.id} className="space-y-2">
                      <Label>{column.name}</Label>
                      <div className="border rounded-md p-4 h-[200px] overflow-y-auto">
                        {values.map((value) => (
                          <div key={value} className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id={`${column.id}-${value}`}
                              checked={selectedValues.includes(value)}
                              onCheckedChange={(checked) =>
                                handleCategoricalFilterChange(column.id, value, checked === true)
                              }
                            />
                            <label
                              htmlFor={`${column.id}-${value}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
              <Button onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
            <Button variant="secondary" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>

          {/* Results Summary */}
          {hasFiltered && (
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Filter Results</h3>
              <p className="text-sm text-muted-foreground">
                Showing {filteredData.length} of {data.length} rows (
                {Math.round((filteredData.length / data.length) * 100)}%)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
