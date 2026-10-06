
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

class RectangleSimple extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}
	isHover(moreProps) {
		const { tolerance, onHover } = this.props;

		if (isDefined(onHover)) {
			const { x1Value, x2Value, y1Value, y2Value, type } = this.props;
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;

			const hovering = isHovering({
				x1Value, y1Value,
				x2Value, y2Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
			});
			return hovering;
		}
		return false;
	}
	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fill, fillOpacity, isFill } = this.props;

		const { x1, y1, x2, y2 } = helper(this.props, moreProps);

		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
		ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

		const width = (x2 - x1);
		const height = (y2 - y1);

		ctx.beginPath();
		ctx.rect(x1, y1, width, height);
		ctx.stroke();
		if (isFill) {
			ctx.fillStyle = hexToRGBA(fill, fillOpacity);
			ctx.fill();
		}

	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fill, isFill, fillOpacity } = this.props;
		const { x1, y1, x2, y2 } = helper(this.props, moreProps);

		return React.createElement("polygon", {
			points: x1 + "," + y1 + " " + x2 + "," + y1 + " " + x2 + "," + y2 + " " + x1 + "," + y2,
			stroke: stroke,
			strokeWidth: strokeWidth,
			strokeOpacity: strokeOpacity,
			strokeDasharray: strokeDasharray,
			fill: fill,
			fillOpacity: isFill ? fillOpacity : 0,
		});
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

export function isHovering({
	x1Value, y1Value,
	x2Value, y2Value,
	mouseXY,
	tolerance,
	xScale,
	yScale,
}) {
	const start = [xScale(x1Value), yScale(y1Value)];
	const end = [xScale(x2Value), yScale(y2Value)];

	const [mouseX, mouseY] = mouseXY;

	const is_top_line = mouseY <=  end[1] + tolerance
			&& mouseY > (end[1] - tolerance)
			&& mouseX > Math.min(start[0], end[0]) - tolerance
			&& mouseX < Math.max(start[0], end[0]) + tolerance;
	if (is_top_line === true) return true;

	const is_buttom_line = mouseY <=  start[1] + tolerance
			&& mouseY > (start[1] - tolerance)
			&& mouseX > Math.min(start[0], end[0]) - tolerance
			&& mouseX < Math.max(start[0], end[0]) + tolerance;
	if (is_buttom_line === true) return true;

	const is_left_line = mouseX <=  start[0] + tolerance
			&& mouseX > (start[0] - tolerance)
			&& mouseY < Math.max(start[1], end[1]) + tolerance
			&& mouseY > Math.min(start[1], end[1]) - tolerance;
	if (is_left_line === true) return true;

	const is_right_line = mouseX <=  end[0] + tolerance
			&& mouseX > (end[0] - tolerance)
			&& mouseY < Math.max(start[1], end[1]) + tolerance
			&& mouseY > Math.min(start[1], end[1]) - tolerance;
	if (is_right_line === true) return true;
}

function helper(props, moreProps) {
	const { x1Value, x2Value, y1Value, y2Value } = props;

	const { xScale, chartConfig: { yScale } } = moreProps;

	const x1 = xScale(x1Value);
	const y1 = yScale(y1Value);
	const x2 = xScale(x2Value);
	const y2 = yScale(y2Value);

	return {
		x1, y1, x2, y2
	};
}

export function getSlope(start, end) {
	const m /* slope */ = end[0] === start[0]
		? undefined
		: (end[1] - start[1]) / (end[0] - start[0]);
	return m;
}
export function getYIntercept(m, end) {
	const b /* y intercept */ = -1 * m * end[0] + end[1];
	return b;
}

RectangleSimple.propTypes = {
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,
	fill: PropTypes.any,
	fillOpacity: PropTypes.any,
	isFill: PropTypes.any,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	type: PropTypes.oneOf([
		"RECTANGLE", // extends between the set bounds
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

RectangleSimple.defaultProps = {
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

export default RectangleSimple;
