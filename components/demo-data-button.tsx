"use client"

import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDataStore } from "@/lib/data-store"
import { generateDemoData } from "@/lib/demo-data"

export function DemoDataButton() {
  const { toast } = useToast()
  const { setData, setColumns, setLoading } = useDataStore()

  const handleLoadDemoData = () => {
    setLoading(true)

    try {
      const { data, columns } = generateDemoData()
      setData(data)
      setColumns(columns)

      toast({
        title: "Demo data loaded",
        description: `Loaded ${data.length} rows of sample data`,
      })
    } catch (error) {
      console.error("Error loading demo data:", error)
      toast({
        title: "Error loading demo data",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" onClick={handleLoadDemoData}>
      <Database className="mr-2 h-4 w-4" />
      Use Demo Data
    </Button>
  )
}
