// library import goes here.
import React, { useEffect, useState, useMemo } from 'react'

import shortId from 'short-uuid';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import mockApi from '../../Authentication'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
// Added cloneDeep to avoid mutating state
import cloneDeep from 'clone-deep';

// local file import goes here.
import './index.css'
import { ColorCell, DebouncedInput, DefaultColumn, OrderNameWithImage, SizesCell, separator } from './CustomComponents'

// column sort icon only visible on clik of column header.
const sortColumnIconObj = {
  asc: <ExpandLessIcon />,
  desc: <ExpandMoreIcon />,
}

const NOOP = () => { }

// ReacTable is used to render whole the table.
function ReactTable() {
  const [tableData, setTableData] = useState([])
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expanded, setExpanded] = useState({})

  // dataConverter is used to convert the MockAPI response data to reactTable data format.
  // it's easier to render table specifically for tables like parent-child relation table
  const dataConverter = (data) => {
    return data.map(each => {

      //Used shortId from short-uuid to generate uniqueIDs for each rows to identifiy the relation between parent-child relations
      const levelOneUUID = shortId.generate()

      let primarySubRows = each?.primary_variants.map(each => {
        const levelTwoUUID = shortId.generate()
        return {
          ...each,
          UUID: levelTwoUUID,
          parentUUID: levelOneUUID + separator + levelTwoUUID,
          subRows: each.secondary_variants.map(each => {
            const levelThreeUUID = shortId.generate()
            return {
              ...each,
              UUID: levelThreeUUID,
              parentUUID: levelOneUUID + separator + levelTwoUUID + separator + levelThreeUUID,
            }
          })
        }
      })

      return {
        ...each,
        name: each.title,
        colour: "colour",
        size: "S M",
        subRows: primarySubRows,
        UUID: levelOneUUID,
        parentUUID: levelOneUUID
      }
    })
  }

  useEffect(() => {
    // Getting data from sessiomStorage. which holds the edited data after refreshing the browser.
    const sessionData = sessionStorage.getItem("tableData")
    if (sessionData) {
      setTableData(JSON.parse(sessionData))
    } else {
      // if sessionData don't have the data then we call the MockAPI to get the table JSON data .
      mockApi.get('/bb73dafb-52f5-48df-9b2f-c8d399c678f0').then((response) => {
        setTableData(dataConverter(response.data))
      });
    }
  }, []);

  // All data along with the changes where stored in session storage.
  useEffect(() => {
    if (tableData?.length) {
      sessionStorage.setItem("tableData", JSON.stringify(tableData));
    }
  }, [tableData])


  // AntSwitch component is MUI'S component which renders swith component onhover of row.
  const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 15,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)',
      },
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#0d47a1',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
      width: 12,
      height: 12,
      borderRadius: 6,
      transition: theme.transitions.create(['width'], {
        duration: 200,
      }),
    },
    '& .MuiSwitch-track': {
      borderRadius: 16 / 2,
      opacity: 1,
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
      boxSizing: 'border-box',
    },
  }));


  //  React table use columns array as a props to render all column name.
  //  It allows us to customize each cell 
  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'active',
        id: 'active',
        header: '',
        cell: <div className='radio-btn'><AntSwitch defaultChecked inputProps={{ 'aria-label': 'ant design' }} /></div>,
      },
      {
        accessorKey: 'name',
        id: 'name',
        header: 'Name',
        cell: OrderNameWithImage,
      },
      // Since there is no data for the stock column in the JSON so I'm using inventory as a ID for Stock column.
      {
        accessorFn: "inventory",
        id: 'inventory',
        header: "Stock",
      },
      {
        accessorKey: 'price',
        id: 'price',
        header: 'WHS',
        cell: props => <DefaultColumn prepend='$' {...props} />,
      },
      {
        accessorKey: 'discountPercentage',
        id: 'discountPercentage',
        header: "Discounts%",
        cell: props => <DefaultColumn append='%' {...props} />,
      },
      {
        accessorFn: row => row.colour,
        id: 'colour',
        cell: ColorCell,
        header: "Colour",
      },
      {
        accessorFn: row => row.size,
        id: 'size',
        cell: SizesCell,
        header: "Sizes",
      },
      {
        accessorKey: 'inventory',
        id: 'inventory',
        header: 'Inventory',
      },
      {
        accessorKey: 'leadTime',
        id: 'leadTime',
        header: 'Lead Time',
      },
      {
        accessorKey: 'UUID',
        id: 'UUID',
        cell: '',
        header: ''
      },
      {
        accessorKey: 'parentUUID',
        id: 'parentUUID',
        cell: '',
        header: ''
      },
    ]
  },[])

  // intialising reactTable by passing there props
  const table = useReactTable({
    data: tableData,
    columns,
    defaultColumn: {
      cell: DefaultColumn
    },
    state: {
      expanded,
      sorting,
      globalFilter
    },
    // updateData is used to update all modified cell value to the tabledata(state) to show modified changes in the table.
    meta: {
      updateData: (rowIndex, columnId, value, cell) => {
        const { original } = cell.row
        // using separator to split the parent- child ID's.
        const accordianLevel = original?.parentUUID?.split(separator)
        setTableData(oldTableData => {
          // Added cloneDeep to avoid mutating table data
          const previousData = cloneDeep(oldTableData)
          return previousData?.map((row, index) => {
            if (index === rowIndex && previousData[rowIndex] !== null) {
              // Update if parent cell is edited.
              if (accordianLevel?.length === 1) {
                return {
                  ...previousData[rowIndex],
                  [columnId]: value,
                }
              }
              // Update if primary child cell is edited.
              else if (accordianLevel?.length === 2) {
                const parentRow = previousData.filter(eachRow => eachRow.parentUUID === accordianLevel[0])
                parentRow[0].subRows.filter(eachPrimarySubRow => {
                  return eachPrimarySubRow.UUID === accordianLevel[1] ? eachPrimarySubRow.name = value : null
                })
                const updatedData = {
                  ...parentRow[0],
                  subRows: parentRow[0].subRows
                }
                return {
                  ...previousData[rowIndex],
                  updatedData
                }
              }
              // Update if secondary child cell is edited.
              else {
                const parentRow = previousData.filter(eachRow => eachRow.parentUUID === accordianLevel[0])
                parentRow[0].subRows.filter(eachPrimarySubRow => {
                  return eachPrimarySubRow.subRows.filter(eachSecondarySubRow => {
                    return eachSecondarySubRow.UUID === accordianLevel[2] ? eachSecondarySubRow.name = value : null
                  })
                })
                const updatedData = {
                  ...parentRow[0],
                  subRows: parentRow[0].subRows
                }
                return {
                  ...previousData[rowIndex],
                  updatedData
                }
              }
            }
            return row
          })
        })
      },
    },
    onExpandedChange: setExpanded,
    getSubRows: row => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    debugTable: true,
  })

  return (
    <TableContainer className="table-container p-2">
      <Table className="data-table">
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow className="table-header-row" key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  // rendering column headers
                  <TableCell key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : '',
                          onClick: header.column.id !== "name" ? header.column.getToggleSortingHandler() : NOOP,
                        }}
                        style={{ display: 'flex', cursor: 'pointer' }}
                      >
                        {header.column.id !== "name" && flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.id === "name" && <DebouncedInput
                          value={globalFilter ?? ''}
                          onChange={value => setGlobalFilter(String(value))}
                          className="p-2 font-lg shadow border border-block"
                          placeholder="Search all orders"
                        />}
                        {sortColumnIconObj[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => {
            return (
              // rendering table rows.
              <TableRow className="table-body-row" key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ReactTable;