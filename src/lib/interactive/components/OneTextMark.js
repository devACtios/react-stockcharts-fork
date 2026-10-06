import React, { Component } from "react";
import PropTypes from "prop-types";

import {
	noop,
	isDefined,
	strokeDashTypes,
} from "../../utils";
import { splitTextByRows } from "../../utils/text";
import MultilineText from "./MultilineText";
import ClickableCircle from "./ClickableCircle";
import { isHover, isTouchDevice, saveNodeType } from "../utils";

const dragIcon = (
	<path
		fill="white"
		d="M11.6664 4.66653L11.6664 6.45542L8.42639 6.44764V7.55208L11.6664 7.54431L11.6664 9.3332L13.9997 6.99986L11.6664 4.66653ZM4.66639 2.3332L6.45528 2.3332L6.4475 5.5732H7.55195L7.54417 2.3332H9.33306L6.99973
		-0.000137329L4.66639 2.3332ZM2.33306 9.3332L2.33306 7.54431L5.57306 7.55208V6.44764L2.33306 6.45542L2.33306 4.66653L-0.000274658 6.99986L2.33306 9.3332ZM9.33306 11.6665L7.54417 11.6665L7.55195
		8.42653H6.4475L6.45528 11.666H4.66639L6.99973 13.9999L9.33306 11.6665Z"
	/>
);

class OneTextMark extends Component {

	constructor(props) {
		super(props);
		this.nodes = {};
		this.saveNodeType = saveNodeType.bind(this);
		this.isHover = isHover.bind(this);
	}

	render() {
		const {
			selected,
			interactiveCursorClass, edgeInteractiveCursor,
			handleHover, handleLineDragStart, handleLineDrag,
			onDragComplete,

			hover,
			anchor,

			x1Value,
			y1Value,
			width,
			maxRows,

			text,
			strokeWidth, maxWidth, lineHeight,
			font,
			stroke,
			strokeOpacity,
			strokeDasharray,
			bgFill,
			r1, r2,
			edgeStrokeWidth,
			edgeFill,
			edgeStroke,
			padding,
			triangleHeight,

			handleEdge1DragStart, handleEdge1Drag,
			handleEdge2DragStart, handleEdge2Drag,
			handleDragComplete,
		} = this.props;

		const currentMaxWidth = width || maxWidth;

		const rect = helper({ width, strokeWidth, font, text, maxWidth: currentMaxWidth, maxRows, lineHeight, padding, triangleHeight });
		const CIRCLE_TOP_OFFSET_PERCENT = 10;
		const circleTopOffset = (r1 * 2) / 100 * CIRCLE_TOP_OFFSET_PERCENT;

		function getPosition(moreProps) {
			const { xScale, chartConfig: { yScale } } = moreProps;

			const x = xScale(x1Value) - (rect.width / 2);
			const y = yScale(y1Value) + rect.dy;

			return { x, y };
		}

		function isHover(moreProps) {

			if (isDefined(handleHover)) {
				const positionRect = getPosition(moreProps);
				const { mouseXY: [x, y] } = moreProps;

				const insideTextElement = () => (
					x >= positionRect.x - padding
					&& y >= positionRect.y - padding
					&& x <= positionRect.x + rect.width + padding
					&& y <= positionRect.y + rect.height + padding
				);
				const insideDragElement = () => (
					x >= (rect.width / 2) + positionRect.x - r1
					&& x <= (rect.width / 2) + positionRect.x + r1
					&& y >= positionRect.y - padding - r1 - circleTopOffset
					&& y <= positionRect.y
				);

				if (insideTextElement() || insideDragElement()) {
					return true;
				}
			} else {
				return false;
			}
		}

		return (<g>
			<MultilineText
				isHover={isHover()}
				ref={this.saveNodeType("multilineText")}

				x1Value={x1Value}
				y1Value={y1Value}
				dy={rect.dy}

				textRows={rect.rows}
				width={rect.width}
				height={rect.height}
				padding={padding}

				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={handleHover}
				onUnHover={handleHover}

				anchor={anchor}

				interactiveCursorClass={interactiveCursorClass}
				onDragStart={handleLineDragStart}
				onDrag={handleLineDrag}
				onDragComplete={onDragComplete}

				font={font}
				stroke={stroke}
				strokeWidth={strokeWidth}
				lineHeight={lineHeight}
				bgFill={bgFill}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}

				showTriangle={true}
			/>

			<ClickableCircle
				icon={dragIcon}
				ref={this.saveNodeType("edge1")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={x1Value}
				cy={y1Value}
				dy={rect.dy - padding - circleTopOffset}
				r={r1}
				fill={edgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={strokeOpacity}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={handleEdge1DragStart}
				onDrag={handleEdge1Drag({ dx: rect.dx, dy: rect.dy - padding })}
				onDragComplete={handleDragComplete}
			/>

			{this.props.enableWidthChange &&  (
				<ClickableCircle
					ref={this.saveNodeType("edge2")}
					show={selected || (isTouchDevice() ? false : hover)}
					cx={x1Value}
					cy={y1Value}
					dx={(rect.width / 2) + padding}
					dy={rect.dy + (rect.height / 2)}
					r={r2}
					fill={edgeFill}
					stroke={edgeStroke}
					strokeWidth={edgeStrokeWidth}
					strokeOpacity={strokeOpacity}
					interactiveCursorClass={edgeInteractiveCursor}
					onDragStart={handleEdge2DragStart}
					onDrag={handleEdge2Drag({ width: rect.width })}
					onDragComplete={handleDragComplete}
					middlePoint
				/>
			)}
		</g>);
	}
}

function helper({ width, strokeWidth, font, text, maxWidth, maxRows, lineHeight, padding, triangleHeight }) {

	const { rows, maxRow } = splitTextByRows({
		maxRowWidth: maxWidth,
		strokeWidth, font,
		maxRows,
	}, text);

	const offsetHeight = rows.length * (lineHeight * strokeWidth);

	return {
		width: width || maxRow,
		height: offsetHeight,
		rows,
		dx: 0,
		dy: 0 - offsetHeight - padding - triangleHeight,
	};
}

OneTextMark.propTypes = {
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	triangleHeight: PropTypes.number,

	enableWidthChange: PropTypes.bool,
	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	handleLineDragStart: PropTypes.func,
	handleHover: PropTypes.func,
	handleLineDrag: PropTypes.func,
	hover: PropTypes.bool,
	anchor: PropTypes.string,
	width: PropTypes.number,
	maxRows: PropTypes.number,
	text: PropTypes.string,
	font: PropTypes.string,
	bgFill: PropTypes.string,

	defaultClassName: PropTypes.string,

	r1: PropTypes.number,
	r2: PropTypes.number,
	edgeFill: PropTypes.string.isRequired,
	edgeStroke: PropTypes.string.isRequired,
	edgeStrokeWidth: PropTypes.number.isRequired,
	withEdge: PropTypes.bool.isRequired,
	children: PropTypes.func.isRequired,
	tolerance: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,
	lineHeight: PropTypes.number,
	padding: PropTypes.number.isRequired,
	maxWidth: PropTypes.number.isRequired,
	edgeInteractiveCursor: PropTypes.string.isRequired,
	handleEdge1DragStart: PropTypes.func,
	handleEdge1Drag: PropTypes.func,
	handleEdge2DragStart: PropTypes.func,
	handleEdge2Drag: PropTypes.func,
	handleDragComplete: PropTypes.func,
};

OneTextMark.defaultProps = {
	strokeOpacity: 1,
	onDragComplete: noop,
	triangleHeight: 6,
	enableWidthChange: true,

	edgeStrokeWidth: 3,
	edgeStroke: "#000000",
	edgeFill: "#FFFFFF",
	r1: 10,
	r2: 15,
	withEdge: false,
	strokeWidth: 14,
	strokeDasharray: "Solid",
	children: noop,
	tolerance: 7,
	selected: false,
};

export default OneTextMark;
