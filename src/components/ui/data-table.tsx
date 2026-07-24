import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  sortField?: string
  align?: 'left' | 'center' | 'right'
  width?: string
  render: (row: T) => ReactNode
  renderSkeleton?: () => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string | number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyState?: ReactNode
  sortBy?: string
  order?: 'asc' | 'desc'
  onSortChange?: (field: string) => void
  skeletonRows?: number
  highlightRow?: (row: T) => boolean
}

const alignStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const DataTable = <T,>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  error = null,
  onRetry,
  emptyState,
  sortBy,
  order = 'asc',
  onSortChange,
  skeletonRows = 8,
  highlightRow,
}: DataTableProps<T>) => {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (!isLoading && rows.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-4xl">
        <TableHeader>
          <TableRow className="bg-muted/60">
            {columns.map((column) => {
              const isSorted = Boolean(column.sortField) && column.sortField === sortBy
              const isSortable = Boolean(column.sortField && onSortChange)
              const SortIcon = isSorted ? (order === 'asc' ? ArrowUpIcon : ArrowDownIcon) : ChevronsUpDownIcon

              return (
                <TableHead
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  aria-sort={isSorted ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cn(
                    'text-xs font-semibold tracking-wide uppercase',
                    alignStyles[column.align ?? 'left'],
                  )}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(column.sortField as string)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded transition-colors hover:text-pru-red',
                        isSorted && 'text-pru-red',
                      )}
                    >
                      {column.header}
                      <SortIcon className={cn('size-3.5', !isSorted && 'opacity-40')} />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.renderSkeleton ? column.renderSkeleton() : <Skeleton className="h-4 w-24" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow key={getRowId(row)} className={cn(highlightRow?.(row) && 'bg-pru-red-50')}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={alignStyles[column.align ?? 'left']}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
