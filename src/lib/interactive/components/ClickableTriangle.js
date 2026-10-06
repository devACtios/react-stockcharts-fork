
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { getSlope, getYIntercept }  from "../components/StraightLine";

import {
	isDefined,
	isNotDefined,
	noop,
	hexToRGBA,
	getStrokeDasharray,
} from "../../utils";

class ClickableTriangle extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}

	isHover(moreProps) {
		const { tolerance, onHover } = this.props;

		if (isDefined(onHover)) {
			const { startXY, nextXY, endXY } = this.props;
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;

			const { line1, line2, line3 } = getLines(startXY, nextXY, endXY, xScale, yScale);
			const line1Hovering = isHoveringTriangle([line1.x1, line1.y1], [line1.x2, line1.y2], mouseXY, tolerance);
			const line2Hovering = isHoveringTriangle([line2.x1, line2.y1], [line2.x2, line2.y2], mouseXY, tolerance);
			const line3Hovering = isHoveringTriangle([line3.x1, line3.y1], [line3.x2, line3.y2], mouseXY, tolerance);
			return line1Hovering || line2Hovering || line3Hovering;
		}
		return false;
	}

	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fillOpacity, fill, isFill } = this.props;
		const { startXY, nextXY, endXY } = this.props;
		const { xScale, chartConfig: { yScale } } = moreProps;

		const { line1, line2 } = getLines(startXY, nextXY, endXY, xScale, yScale);
		if (isDefined(line1)) {
			const { x1, y1, x2, y2 } = line1;

			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
			ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			if (isDefined(line2)) {
				const { x1: x3, y1: y3, x2: x4, y2: y4 } = line2;
				ctx.beginPath();
				ctx.moveTo(x3, y3);
				ctx.lineTo(x4, y4);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x4, y4);
				ctx.stroke();

				if (isFill) {
					ctx.fillStyle = hexToRGBA(fill, fillOpacity);
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.lineTo(x4, y4);
					ctx.closePath();
					ctx.fill();
				}
			}
		}
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fill, isFill, fillOpacity, startXY, nextXY, endXY } = this.props;

		const xScale = moreProps.xScale;
		const yScale = moreProps.chartConfig.yScale;

		const { line1, line2 } = getLines(startXY, nextXY, endXY, xScale, yScale);

		if (isDefined(line1)) {
			let points = "";

			const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
			points += x1 + "," + y1 + " " + x2 + "," + y2;

			if (isDefined(line2)) {
				const x4 = line2.x2, y4 = line2.y2;
				points += " " + x4 + "," + y4 + " " + x1 + "," + y1;
			}

			return React.createElement("polygon", {
				points: points,
				stroke: stroke,
				strokeWidth: strokeWidth,
				strokeOpacity: strokeOpacity,
				strokeDasharray: strokeDasharray,
				fill: fill,
				fillOpacity: isFill ? fillOpacity : 0
			});
		}
	}
	render() {
		const { selected, interactiveCursorClass } = this.props;
		const { onDragStart, onDrag, onDragComplete, onHover, onUnHover, onZoomPanCallBack } = this.props;

		return <GenericChartComponent
			onZoomPanCallBack={onZoomPanCallBack}
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

			drawOn={["mousemove", "pan", "drag", "zoom"]}
		/>;
	}
}

function isHoveringTriangle(start, end, [mouseX, mouseY], tolerance) {
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

function getLines(startXY, nextXY, endXY, xScale, yScale) {
	if (isNotDefined(startXY) || isNotDefined(nextXY)) {
		return {};
	}
	if (isNotDefined(endXY)) {
		const line1 = {
			x1: xScale(startXY[0]),
			y1: yScale(startXY[1]),
			x2: xScale(nextXY[0]),
			y2: yScale(nextXY[1]),
		};
		return {
			line1,
			undefined,
		};
	}
	const line1 = {
		x1: xScale(startXY[0]),
		y1: yScale(startXY[1]),
		x2: xScale(nextXY[0]),
		y2: yScale(nextXY[1]),
	};
	const line2 = {
		x1: xScale(nextXY[0]),
		y1: yScale(nextXY[1]),
		x2: xScale(endXY[0]),
		y2: yScale(endXY[1]),
	};
	const line3 = {
		x1: xScale(startXY[0]),
		y1: yScale(startXY[1]),
		x2: xScale(endXY[0]),
		y2: yScale(endXY[1]),
	};
	return {
		line1,
		line2,
		line3,
	};
}

ClickableTriangle.propTypes = {
	startXY: PropTypes.any,
	nextXY: PropTypes.any,
	endXY: PropTypes.any,
	strokeDasharray: PropTypes.any,
	fillOpacity: PropTypes.any,
	fill: PropTypes.any,
	isFill: PropTypes.any,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,

	onDragStart: PropTypes.func.isRequired,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onHover: PropTypes.func,
	onUnHover: PropTypes.func,
	onZoomPanCallBack: PropTypes.func,

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

ClickableTriangle.defaultProps = {
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

export default ClickableTriangle;
