import React, { Fragment } from 'react'

// ColorSwatch will gives circle styles to the fields under the colour column.
function ColorSwatch({value})
{
	return (
		<Fragment>
			<div style={{
				display: "inline-block",
				width: "25px",
				height: "25px",
				marginRight: 5,
				backgroundColor: value,
				borderRadius: "50%",
				border: "1px solid #8b8a8a",
			}}></div>
		</Fragment>
	)
}

export default ColorSwatch