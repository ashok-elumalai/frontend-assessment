// library import goes here.
import React, { useEffect, useState, useRef, Fragment } from 'react';

// Using material UI's component, but we are importing it with particular component name
// so that it will only utilise that particular lib inspect of whole lib 
// and it avoid unused components while bundling

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Button from '@mui/material/Button';
import ColorSwatch from '../../common/ColorSwatch'
import EditOutlined from '@mui/icons-material/EditOutlined';
import Search from '@mui/icons-material/Search';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { blue } from '@mui/material/colors';


//  adding seprator constant to combine parent and child UUIDS. 
//  It's helps to identify the relation between parent-child table
export const separator = '__'


function getSizesText(sizesArr = [], threshold = 3) {
	let text = ''

	sizesArr.forEach((eachSize, i) => {
		if (i < threshold) {
			text += text ? ', ' + eachSize[0] : eachSize[0]
		}
	})

	text = text + ` +${sizesArr.length - threshold}`

	return text
}

// DefaultColumn component will allows you to edit each fields in the table
export const DefaultColumn = (props) => {
	const { getValue, row: { index }, column: { id }, table, cell, prepend, append } = props
	const initialValue = getValue()
	const [value, setValue] = useState(initialValue)
	const [beingEdited, setIsBeingEdited] = useState(false)
	const inputRef = useRef({})

	// After editing the column fields we send the edited cell and row details to UpdateData
	const onBlur = () => {
		table.options.meta?.updateData(index, id, value, cell)
		setIsBeingEdited(false)
	}

	//  added useRef to focus on editing field
	useEffect(() => {
		if (beingEdited && inputRef.current) {
			inputRef.current.focus()
		}
	}, [beingEdited])

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	const theme = createTheme({
		palette: {
			primary: {
				main: blue[900]
			},
		}
	});

	return !beingEdited ?
		<div className="editable-column" style={{width: id !== 'name' ? "95px" : null}}>
			<p className="cell-value" title={initialValue}>
				{prepend}{initialValue}{append}
			</p>
			{props.children || null}
			<ThemeProvider theme={theme}>
				<Button className="cell-edit-icon" size="small" sx={{ color: "blue" }} startIcon={<EditOutlined />} onClick={() => setIsBeingEdited(true)}>Edit</Button>
			</ThemeProvider>
		</div>
		: (
			<input
				className="editable-input"
				ref={inputRef}
				autofocus
				value={value}
				onChange={e => setValue(e.target.value)}
				onBlur={onBlur}
			/>
		)
}

// added debounce for search box for better performance in searching ordername
// Note: Now we have 10 rows so no need of debounce, but if we using this component for realtime data 
//       debounce is good to have.
export const DebouncedInput = (props) => {
	const {
		value: initialValue,
		onChange,
		debounce = 500,
		...restProps
	} = props
	const [value, setValue] = useState(initialValue)

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	useEffect(() => {
		// debounce implementation
		const timeout = setTimeout(() => {
			onChange(value)
		}, debounce)

		return () => clearTimeout(timeout)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value])

	return (
		<OutlinedInput style={{ width: 300 }} className="editable-input" {...restProps} value={value} onChange={e => setValue(e.target.value)}

			startAdornment={
				<InputAdornment position="start">
					<IconButton
					>
						<Search />
					</IconButton>
				</InputAdornment>
			}

			endAdornment={
				<InputAdornment position="end">
					<IconButton
					>
						<DocumentScannerIcon />
					</IconButton>
				</InputAdornment>
			}
		/>
	)
}

// colorcell will add the color circle in colour column in the table
export const ColorCell = ({ row }) => {
	return (
		<div className='color-cell cell-value'>
			{
				row.original.primary_variants?.map((each, index) => {
					return index < 2 ? <ColorSwatch value={each.name} /> : <p>{`+${row.original.primary_variants?.length - 2}`}</p>
				})
			}
		</div>
	)
}


// SizesCell is a custom component for rendering "Size" column in the Table
// it will give the sizes of each orders data
export const SizesCell = ({ row }) => {
	let cellVal = ''
	if (row?.original.parentUUID?.split(separator).length === 1) {
		let availableSizes = []
		row.original.primary_variants.forEach(eachPriVar => {
			eachPriVar.secondary_variants.forEach(eachSecVar => {
				if (!availableSizes.includes(eachSecVar.name)) {
					availableSizes.push(eachSecVar.name)
				}
			})
		})
		cellVal = getSizesText(availableSizes)
	} else if (row.original.parentUUID.split(separator).length === 2) {
		let availableSizes = []
		row.original.secondary_variants.forEach(eachSecVar => {
			if (!availableSizes.includes(eachSecVar.name)) {
				availableSizes.push(eachSecVar.name)
			}
		})
		cellVal = getSizesText(availableSizes)
	}

	return (
		<Fragment>
			<p className="cell-value">{cellVal}</p>
		</Fragment>
	)
}

// OrderNameWithImage will render the ordername cell in the table with image, order name, colour count and accordianIcon
// will render the image only for Parent row and Active button for child row
export const OrderNameWithImage = ({ row, getValue, column, table, cell }) => {

	const originalRow = row.original
	let component = null

	if (!originalRow.primary_variants && !originalRow.secondary_variants) {
		// then it is Secondary row
		component = (
			<div className="ordername-cell secondary-name-cell">
				<DefaultColumn getValue={getValue} row={row} column={column} table={table} cell={cell} />
			</div>
		)
	} else if (!originalRow.primary_variants && originalRow.secondary_variants) {
		// then it is Primary row
		component = (
			<div className="ordername-cell primary-name-cell">
				<DefaultColumn getValue={getValue} row={row} column={column} table={table} cell={cell}>
					<p className="lite-text">{row.original.secondary_variants?.length} sizes</p>
					<div
						{...{
							onClick: row.getToggleExpandedHandler()
						}}
						className="dd-icon"
					>
						{row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					</div>
					{row.original.active && <div className="chip-btn">Active</div>}
				</DefaultColumn>
			</div>
		)
	} else if (originalRow.primary_variants && !originalRow.secondary_variants) {
		// then it is Parent cell
		component = (
			<div className="ordername-cell parent-name-cell">
				{row.original.image &&
					<div className="order-img-wrapper">
						<img height="30px" width="30px" src={row.original.image} alt="order" />
					</div>
				}
				<DefaultColumn getValue={getValue} row={row} column={column} table={table} cell={cell}>
					<p className="lite-text">{row.original.primary_variants?.length} colours</p>
					{row.getCanExpand() && (
						<div
							{...{
								onClick: row.getToggleExpandedHandler()
							}}
							className="dd-icon"
						>
							{row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
						</div>
					)}
				</DefaultColumn>
			</div>
		)
	}


	return (
		<div
			style={{
				paddingLeft: `${row.depth * 2}rem`,
			}}
		>
			<div className="ordername-cell-wrapper">
				{component}
			</div>
		</div>
	)
};