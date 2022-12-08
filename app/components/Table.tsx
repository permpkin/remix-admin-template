import {
  createColumnHelper,
  flexRender,
  CellContext,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ReactNode, useState } from 'react'
import { classNames } from '~/utils'
import { TableFilter } from './TableFilter'

interface TableProps {
  data: any[]
  cols: TableCol[]
}

type TableCol = {
  id: string
  header?: ReactNode | string
  cell?: (info: CellContext<TableCol, unknown>) => JSX.Element
}

export const Table = ({ data, cols }:TableProps) => {

  const columnHelper = createColumnHelper<TableCol>()

  const columns = cols.map((col) => {
    return columnHelper.display({
      id: col.id,
      header: () => col.header || col.id,
      cell: (info) => {
        if (col.cell) {
          return col.cell(info)
        } else {
          const value = info.row.original[col.id as keyof typeof info.row.original]
          if (Array.isArray(value)) {
            return <div key={col.id}>{
              value.map((seg) => (
                <span key={`${seg.id}-${seg.name}`}>{seg.name}</span>
              ))
            }</div>
          }
          return <span key={col.id}>{value}</span>
        }
      },
    })
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  return (
    <div className='border border-gray-200 rounded-lg'>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index, arr) => (
                <th key={header.id} scope="col" className={classNames(
                  "text-left text-xs font-semibold text-gray-900 py-2 px-4"
                )}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, index, arr) => (
                <td key={cell.id} className={classNames(
                  "font-medium whitespace-nowrap p-4 text-sm text-gray-500 py-2"
                )}>
                  {
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}