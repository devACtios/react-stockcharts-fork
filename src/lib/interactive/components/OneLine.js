import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import {
	isDefined,
	noop,
	hexToRGBA,
	getStrokeDasharray,
	strokeDashTypes,
} from "../../utils";

class OneLine extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}
	isHover(moreProps) {
		const { tolerance, onHover } = this.props;

		if (isDefined(onHover)) {
			const { x1Value, y1Value, type } = this.props;
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale }, width } = moreProps;

			const hovering = isHovering({
				x1Value, y1Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
				width,
			});

			return hovering;
		}
		return false;
	}
	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray } = this.props;

		const { x1, y1, x2, y2 } = helper(this.props, moreProps);

		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
		ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray } = this.props;

		const lineWidth = strokeWidth;

		const { x1, y1, x2, y2 } = helper(this.props, moreProps);
		return (
			<line
				x1={x1} y1={y1} x2={x2} y2={y2}
				stroke={stroke} strokeWidth={lineWidth}
				strokeDasharray={getStrokeDasharray(strokeDasharray)}
				strokeOpacity={strokeOpacity} />
		);
	}
	render() {
		const { selected, interactiveCursorClass } = this.props;
		const { onDragStart, onDrag, onDragComplete, onHover, onUnHover } = this.props;

		return <GenericChartComponent
			isHover={this.isHover}

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

export function isHovering2(start, end, [mouseX, mouseY], tolerance) {
	const m = getSlope(start, end);

	if (isDefined(m)) {
		const b = getYIntercept(m, end);
		const y = m * mouseX + b;
		return (mouseY < y + tolerance)
			&& mouseY > (y - tolerance)
			&& mouseX > Math.min(start[0], end[0]) - tolerance
			&& mouseX < Math.max(start[0], end[0]) + tolerance;
	} else {
		return mouseY >= Math.min(start[1], end[1])
			&& mouseY <= Math.max(start[1], end[1])
			&& mouseX < start[0] + tolerance
			&& mouseX > start[0] - tolerance;
	}
}

export function isHovering({
	x1Value, y1Value,
	mouseXY,
	type,
	tolerance,
	xScale,
	yScale,
	width,
}) {

	const line = generateLine({
		type,
		start: [x1Value, y1Value],
		xScale,
		yScale,
		width,
	});

	const start = [xScale(line.x1), yScale(line.y1)];
	const end = [xScale(line.x2), yScale(line.y2)];

	const m = getSlope(start, end);

	const [mouseX, mouseY] = mouseXY;

	if (isDefined(m) && type !== "VERTICALLINE") {
		const b = getYIntercept(m, end);
		const y = m * mouseX + b;

		return mouseY < (y + tolerance)
			&& mouseY > (y - tolerance)
			&& mouseX > Math.min(start[0], end[0]) - tolerance
			&& mouseX < Math.max(start[0], end[0]) + tolerance;
	} else {
		return mouseY >= Math.min(start[1], end[1])
			&& mouseY <= Math.max(start[1], end[1])
			&& mouseX < start[0] + tolerance
			&& mouseX > start[0] - tolerance;
	}
}

function helper(props, moreProps) {
	const { x1Value, y1Value, type } = props;

	const { xScale, chartConfig: { yScale }, width } = moreProps;

	const modLine = generateLine({
		type,
		start: [x1Value, y1Value],
		xScale,
		yScale,
		width,
	});

	const x1 = xScale(modLine.x1);
	const y1 = yScale(modLine.y1);
	const x2 = xScale(modLine.x2);
	const y2 = yScale(modLine.y2);

	return {
		x1, y1, x2, y2
	};
}

export function getSlope(start, end) {
	const m /* slope */ = end[0] === start[0]
		? 0
		: (end[1] - start[1]) / (end[0] - start[0]);
	return m;
}
export function getYIntercept(m, end) {
	const b /* y intercept */ = -1 * m * end[0] + end[1];
	return b;
}

export function generateLine({
	type, start, xScale, yScale, width
}) {
	const m /* slope */ = getSlope(start, start);
	const b /* y intercept */ = getYIntercept(m, start);

	switch (type) {
		case "HORIZONTALLINE":
			return getHorizontalLineCoordinates({
				xScale, width, m, b
			});
		case "VERTICALLINE":
			return getVerticalLineCoordinates({
				start, yScale
			});
		case "HORIZONTALRAY":
			return getHorizontalRayCoordinates({
				start, xScale, width, m, b
			});
	}
}

function getHorizontalLineCoordinates({
	xScale, width, m, b
}) {
	const [xBegin, xFinish] = xScale.domain();

	const xWidth = (isDefined(width)) ? xScale.invert(width) : 0;

	const [x1, x2] = [xBegin, (xWidth > xFinish) ? xWidth : xFinish];
	return {
		x1, y1: m * x1 + b,
		x2, y2: m * x2 + b
	};
}

function getVerticalLineCoordinates({
	start, yScale
}) {
	const [yBegin, yFinish] = yScale.domain();

	const [x1, x2] = [start[0], start[0]];

	return {
		x1, y1: yBegin,
		x2, y2: yFinish
	};
}

function getHorizontalRayCoordinates({
	start, xScale,  width, m, b
}) {
	const [xFinish] = xScale.domain();

	const xWidth = (isDefined(width)) ? xScale.invert(width) : 0;

	const [x1, x2] = [start[0], (xWidth > xFinish) ? xWidth : xFinish];

	return {
		x1, y1: m * x1 + b,
		x2, y2: m * x2 + b
	};
}

OneLine.propTypes = {
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	type: PropTypes.oneOf([
		"HORIZONTALLINE", // extends to horizontal line
		"VERTICALLINE", // extends to vertical line
		"HORIZONTALRAY", // extends between the set bounds
	]).isRequired,

	onEdge1Drag: PropTypes.func.isRequired,
	onEdge2Drag: PropTypes.func.isRequired,
	onDragStart: PropTypes.func.isRequired,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onHover: PropTypes.func,
	onUnHover: PropTypes.func,

	defaultClassName: PropTypes.string,

	r: PropTypes.number.isRequired,
	edgeFill: PropTypes.string.isRequired,
	edgeStroke: PropTypes.string.isRequired,
	edgeStrokeWidth: PropTypes.number.isRequired,
	withEdge: PropTypes.bool.isRequired,
	children: PropTypes.func.isRequired,
	tolerance: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,
};

OneLine.defaultProps = {
	onEdge1Drag: noop,
	onEdge2Drag: noop,
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,

	edgeStrokeWidth: 3,
	edgeStroke: "#000000",
	edgeFill: "#FFFFFF",
	r: 10,
	withEdge: false,
	strokeWidth: 1,
	strokeDasharray: "Solid",
	children: noop,
	tolerance: 7,
	selected: false,
};

export default OneLine;
