"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDataStore } from "@/lib/data-store"
import { Loader2 } from "lucide-react"

export function DataTable() {
  const { data, columns, loading } = useDataStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const rowsPerPage = 10

  // Filter data based on search term
  const filteredData = data.filter((row) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return Object.values(row).some((value) => String(value).toLowerCase().includes(searchLower))
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage)

  // Generate page numbers for pagination
  const pageNumbers = []
  const maxPageButtons = 5

  if (totalPages <= maxPageButtons) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    // Always show first page
    pageNumbers.push(1)

    // Calculate start and end of page range
    let start = Math.max(2, page - 1)
    let end = Math.min(totalPages - 1, page + 1)

    // Adjust if at the beginning or end
    if (page <= 2) {
      end = Math.min(totalPages - 1, 4)
    } else if (page >= totalPages - 1) {
      start = Math.max(2, totalPages - 3)
    }

    // Add ellipsis if needed
    if (start > 2) {
      pageNumbers.push("...")
    }

    // Add page numbers
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i)
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pageNumbers.push("...")
    }

    // Always show last page
    pageNumbers.push(totalPages)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
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
          <CardTitle>Data Table</CardTitle>
          <CardDescription>Upload a CSV file or use demo data to view your data here.</CardDescription>
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
        <CardTitle>Data Table</CardTitle>
        <CardDescription>
          View and search your data. Showing {filteredData.length} of {data.length} rows.
        </CardDescription>
        <div className="mt-2">
          <Input
            placeholder="Search data..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // Reset to first page when searching
            }}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id}>{column.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column.id}`}>
                        {String(row[column.id] !== undefined ? row[column.id] : "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {pageNumbers.map((pageNum, index) => (
                <PaginationItem key={index}>
                  {pageNum === "..." ? (
                    <span className="px-4 py-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => typeof pageNum === "number" && setPage(pageNum)}
                      isActive={page === pageNum}
                      className={typeof pageNum === "number" ? "cursor-pointer" : ""}
                    >
                      {pageNum}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}
