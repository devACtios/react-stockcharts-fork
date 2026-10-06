
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import {
	isDefined,
	noop,
	strokeDashTypes,
} from "../../utils";

class MultilineText extends Component {

	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.isHover = this.isHover.bind(this);
	}

	isHover(moreProps) {
		const { onHover, height, width, padding } = this.props;
		if (
			isDefined(onHover)
		) {
			const rect = this.getPosition(moreProps);
			const { mouseXY: [x, y] } = moreProps;

			if (
				x >= rect.x - padding
				&& y >= rect.y - padding
				&& x <= rect.x + width + padding
				&& y <= rect.y + height + padding
			) {
				return true;
			}
		} else {
			return false;
		}

	}

	getPosition(moreProps) {
		const { xScale, chartConfig: { yScale } } = moreProps;
		const { x1Value, y1Value, width, dx, dy } = this.props;

		const x = xScale(x1Value) - (width / 2) + dx;
		const y = yScale(y1Value) + dy;

		return { x, y };
	}

	renderRows(rows, position) {
		return (
			<text>
				{rows.map((row, index) => {
					return this.renderRow(row, position, index);
				})}
			</text>
		);
	}

	renderRow(row, position, index) {
		const {
			stroke,
			strokeWidth,
			font,
			lineHeight,
		} = this.props;
		const { x, y } = position;

		return (
			<tspan
				key={"row-" + index}
				x={x}
				y={y + (lineHeight * strokeWidth) - 4}
				dy={(index * lineHeight * strokeWidth)}
				fontSize={strokeWidth}
				fontFamily={font}
				strokeWidth={strokeWidth}
				fill={stroke}
			>
				{Array.isArray(row) ? row.join("") : row}
			</tspan>
		);
	}

	renderSVG(moreProps) {
		const {
			textRows, width, height, rx,
			stroke, strokeWidth, strokeDasharray, bgFill, selected, padding, tolerance,
		} = this.props;

		const position = this.getPosition(moreProps);
		const { x, y } = position;

		let currentStroke = stroke;

		if (!selected) {
			currentStroke = "";
		}
		const multiPudding = (padding * 2);

		const trianglePoints = function() {
			const basePoint = [x - padding + width / 2 + tolerance / 3, y - padding + height + multiPudding - 2];

			return `
				${basePoint[0]} ${basePoint[1]},
				${basePoint[0] + 16} ${basePoint[1]},
				${basePoint[0] + 8} ${basePoint[1] + 8},
				${basePoint[0]} ${basePoint[1]},
			`;
		}();

		return (
			<g>
				<polygon
					points={trianglePoints}
					fill={bgFill}
					stroke={currentStroke}
				/>
				<rect
					x={x - padding}
					y={y - padding}
					width={width + multiPudding}
					height={height + multiPudding}
					stroke={currentStroke}
					strokeWidth={strokeWidth}
					strokeDasharray={strokeDasharray}
					fill={bgFill}
					rx={rx}
				/>
				{(textRows.length) ? this.renderRows(textRows, position) : null}
			</g >
		);
	}
	render() {
		const { selected, interactiveCursorClass, className } = this.props;
		const { onDragStart, onDrag, onDragComplete, onHover, onUnHover, isHover } = this.props;

		return <GenericChartComponent
			className={className}
			isHover={isDefined(isHover) ? isHover : this.isHover}

			svgDraw={this.renderSVG}
			canvasToDraw={getMouseCanvas}
			canvasDraw={this.drawOnCanvas}

			interactiveCursorClass={interactiveCursorClass}
			selected={selected}

			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragComplete={onDragComplete}

			onHover={onHover}
			onUnHover={onUnHover}

			drawOn={["mousemove", "pan", "drag"]}
		/>;
	}
}

export function isHovering({
	x1Value, y1Value,
	mouseXY,
	tolerance,
	xScale,
	yScale,
}) {

	const line = generateLine({
		start: [x1Value, y1Value],
		xScale,
		yScale,
	});

	const start = [xScale(line.x1), yScale(line.y1)];

	const [mouseX, mouseY] = mouseXY;
	return mouseY >= start[1] + tolerance
		&& mouseY < start[1] - tolerance + 40
		&& mouseX < start[0] + tolerance
		&& mouseX > start[0] - tolerance;
}

export function generateLine({
	start
}) {
	return getArrowLineCoordinates({ start });
}

function getArrowLineCoordinates({
	start
}) {
	const [x1, y1] = start;

	return {
		x1, y1,
	};
}

MultilineText.propTypes = {
	className: PropTypes.string,
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	dx: PropTypes.number,
	dy: PropTypes.number,
	rx: PropTypes.number,
	textRows: PropTypes.array,
	bgFill: PropTypes.string,
	font: PropTypes.string,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	onDragStart: PropTypes.func.isRequired,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onHover: PropTypes.func,
	onUnHover: PropTypes.func,

	tolerance: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,
	isHover: PropTypes.bool.isRequired,
	lineHeight: PropTypes.number.isRequired,
	padding: PropTypes.number,
};

MultilineText.defaultProps = {
	className: "MultilineText",
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,
	textRows: [],
	bgFill: "withe",
	font: "Arial",

	padding: 0,
	strokeWidth: 14,
	strokeDasharray: "Solid",
	tolerance: 7,
	selected: false,
	dx: 0,
	dy: 0,
	rx: 5,
};

export default MultilineText;
