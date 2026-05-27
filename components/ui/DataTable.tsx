'use client'

import { useEffect, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  Loader2,
  Search,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type ServerPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  search: string
  isValidating?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSearchChange: (search: string) => void
}

type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
  /** Client-side global filter key (ignored when serverPagination is provided) */
  searchKey?: string
  /** Pass to switch into server-side pagination/search mode */
  serverPagination?: ServerPagination
  /** Hide the built-in search input (e.g. when the page renders its own filters) */
  hideSearch?: boolean
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  searchPlaceholder = 'Search...',
  searchKey,
  serverPagination,
  hideSearch = false,
}: DataTableProps<T>) {
  const isServer = Boolean(serverPagination)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Local search input mirrors server search; debounce calls back into the parent
  const [searchInput, setSearchInput] = useState(serverPagination?.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 350)
  useEffect(() => {
    if (!serverPagination) return
    if (debouncedSearch === serverPagination.search) return
    serverPagination.onSearchChange(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // Keep input in sync if parent resets external state
  useEffect(() => {
    if (!serverPagination) return
    if (serverPagination.search !== searchInput) {
      setSearchInput(serverPagination.search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPagination?.search])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: isServer ? '' : globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: isServer,
    pageCount: isServer ? serverPagination!.totalPages : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: isServer ? undefined : getPaginationRowModel(),
    getFilteredRowModel: isServer ? undefined : getFilteredRowModel(),
    globalFilterFn:
      !isServer && searchKey
        ? (row, _columnId, filterValue) => {
            const value = row.getValue(searchKey)
            return String(value ?? '')
              .toLowerCase()
              .includes(String(filterValue).toLowerCase())
          }
        : 'includesString',
    initialState: { pagination: { pageSize: 10 } },
  })

  const showSkeleton = isLoading && data.length === 0
  const showOverlay = (isLoading || serverPagination?.isValidating) && data.length > 0

  // ── First load: full skeleton ────────────────────────────
  if (showSkeleton) {
    return (
      <div className="space-y-4">
        {!hideSearch && <Skeleton className="h-10 w-72" />}
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // ── Pagination footer values ─────────────────────────────
  const currentPage = isServer
    ? serverPagination!.page
    : table.getState().pagination.pageIndex + 1
  const totalPages = isServer
    ? serverPagination!.totalPages
    : table.getPageCount() || 1
  const totalRows = isServer
    ? serverPagination!.total
    : table.getFilteredRowModel().rows.length
  const pageSize = isServer
    ? serverPagination!.pageSize
    : table.getState().pagination.pageSize
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRow = Math.min(totalRows, currentPage * pageSize)

  const goToPage = (next: number) => {
    if (isServer) serverPagination!.onPageChange(next)
    else table.setPageIndex(next - 1)
  }
  const changePageSize = (size: number) => {
    if (isServer) serverPagination!.onPageSizeChange(size)
    else table.setPageSize(size)
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {!hideSearch && (
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={isServer ? searchInput : globalFilter}
              onChange={(e) =>
                isServer ? setSearchInput(e.target.value) : setGlobalFilter(e.target.value)
              }
              className="pl-9"
            />
          </div>
          {showOverlay && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Refreshing…
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-card',
          showOverlay && 'pointer-events-none',
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex cursor-pointer select-none items-center gap-1'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <>
                            {header.column.getIsSorted() === 'asc' && (
                              <ChevronUp className="h-3 w-3" />
                            )}
                            {header.column.getIsSorted() === 'desc' && (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            {!header.column.getIsSorted() && (
                              <ChevronsUpDown className="h-3 w-3 text-muted-foreground/60" />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-8 w-8" />
                    <p className="text-sm">No results found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'transition-colors hover:bg-muted/30',
                    showOverlay && 'opacity-60',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Subtle progress bar across the top when refreshing */}
        {showOverlay && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-primary/10">
            <div className="h-full w-1/3 animate-[shimmer_1.2s_linear_infinite] bg-primary" />
          </div>
        )}
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Rows per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => changePageSize(Number(v))}>
            <SelectTrigger className="h-8 w-[78px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden sm:inline">
            • {totalRows === 0 ? '0' : `${startRow}–${endRow}`} of {totalRows}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage <= 1}
            onClick={() => goToPage(1)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(totalPages)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
