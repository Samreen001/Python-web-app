type DemoData = {
  data: Record<string, any>[]
  columns: { id: string; name: string; type: "string" | "number" }[]
}

export function generateDemoData(): DemoData {
  // Generate dates for the last 30 days
  const today = new Date()
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    return date.toISOString().split("T")[0]
  }).reverse()

  // Product categories
  const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys"]

  // Regions
  const regions = ["North", "South", "East", "West"]

  // Generate random data
  const data = []

  for (let i = 0; i < 100; i++) {
    const date = dates[Math.floor(Math.random() * dates.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const region = regions[Math.floor(Math.random() * regions.length)]
    const sales = Math.floor(Math.random() * 1000) + 100
    const units = Math.floor(Math.random() * 50) + 1
    const profit = Math.round(sales * (0.2 + Math.random() * 0.3))
    const customerSatisfaction = Math.floor(Math.random() * 5) + 1

    data.push({
      date,
      category,
      region,
      sales,
      units,
      profit,
      customerSatisfaction,
    })
  }

  // Define columns
  const columns = [
    { id: "date", name: "Date", type: "string" as const },
    { id: "category", name: "Category", type: "string" as const },
    { id: "region", name: "Region", type: "string" as const },
    { id: "sales", name: "Sales ($)", type: "number" as const },
    { id: "units", name: "Units Sold", type: "number" as const },
    { id: "profit", name: "Profit ($)", type: "number" as const },
    { id: "customerSatisfaction", name: "Customer Satisfaction", type: "number" as const },
  ]

  return { data, columns }
}
