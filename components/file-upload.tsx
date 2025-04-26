"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/lib/data-store"

export function FileUpload() {
  const { toast } = useToast()
  const { setData, setColumns, setLoading } = useDataStore()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is CSV
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setLoading(true)

    try {
      const text = await file.text()
      const rows = text.split("\n")
      const headers = rows[0].split(",").map((header) => header.trim())

      const parsedData = rows
        .slice(1)
        .map((row) => {
          const values = row.split(",").map((value) => value.trim())
          const rowData: Record<string, string | number> = {}

          headers.forEach((header, index) => {
            const value = values[index] || ""
            // Try to convert to number if possible
            const numValue = Number(value)
            rowData[header] = !isNaN(numValue) ? numValue : value
          })

          return rowData
        })
        .filter((row) => Object.values(row).some((value) => value !== ""))

      setData(parsedData)
      setColumns(
        headers.map((header) => ({
          id: header,
          name: header,
          type: typeof parsedData[0]?.[header] === "number" ? "number" : "string",
        })),
      )

      toast({
        title: "File uploaded successfully",
        description: `Loaded ${parsedData.length} rows of data`,
      })
    } catch (error) {
      console.error("Error parsing CSV:", error)
      toast({
        title: "Error parsing file",
        description: "Please check your CSV file format",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={() => document.getElementById("csv-upload")?.click()} disabled={isUploading}>
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV
      </Button>
      <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
    </div>
  )
}
