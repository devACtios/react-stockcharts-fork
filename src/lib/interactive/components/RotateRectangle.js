
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { getXValue } from "../../utils/ChartDataUtil";
import { getSlope, getYIntercept }  from "../components/StraightLine";

import {
	isDefined,
	isNotDefined,
	noop,
	hexToRGBA,
} from "../../utils";

class RotateRectangle extends Component {
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

			const { line1, line2, line3, line4 } = getLines(startXY, nextXY, endXY, xScale, yScale);
			const line1Hovering = isHoveringRectangle([line1.x1, line1.y1], [line1.x2, line1.y2], mouseXY, tolerance);
			const line2Hovering = isHoveringRectangle([line2.x1, line2.y1], [line2.x2, line2.y2], mouseXY, tolerance);
			const line3Hovering = isHoveringRectangle([line3.x1, line3.y1], [line3.x2, line3.y2], mouseXY, tolerance);
			const line4Hovering = isHoveringRectangle([line4.x1, line4.y1], [line4.x2, line4.y2], mouseXY, tolerance);
			return line1Hovering || line2Hovering || line3Hovering || line4Hovering;
		}
		return false;
	}

	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, fillOpacity, fill, isFill } = this.props;
		const { startXY, nextXY, endXY } = this.props;
		const { xScale, chartConfig: { yScale } } = moreProps;

		const { line1, line2 } = getLines(startXY, nextXY, endXY, xScale, yScale);
		if (isDefined(line1)) {
			const { x1, y1, x2, y2 } = line1;

			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

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
				ctx.lineTo(x3, y3);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(x2, y2);
				ctx.lineTo(x4, y4);
				ctx.stroke();

				if (isFill) {
					ctx.fillStyle = hexToRGBA(fill, fillOpacity);
					ctx.beginPath();
					ctx.moveTo(x1, y1);
					ctx.lineTo(x2, y2);
					ctx.lineTo(x4, y4);
					ctx.lineTo(x3, y3);
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
				const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;
				points += " " + x4 + "," + y4 + " " + x3 + "," + y3;
			}

			return React.createElement("polygon", {
				points: points,
				stroke: stroke,
				strokeWidth: strokeWidth,
				strokeOpacity: strokeOpacity,
				strokeDasharray: strokeDasharray,
				fill: fill,
				fillOpacity: isFill ? fillOpacity : 0,
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

function isHoveringRectangle(start, end, [mouseX, mouseY], tolerance) {
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

function getLines(startXY, nextXY, endXY, xScale, yScale, xAccessor, fullData) {
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
	const { LB, LT, RT, RB } = helperRectangle(startXY, nextXY, endXY, xScale, yScale, xAccessor, fullData);
	const line1 = {
		x1: LB[0],
		y1: LB[1],
		x2: RB[0],
		y2: RB[1],
	};
	const line2 = {
		x1: LT[0],
		y1: LT[1],
		x2: RT[0],
		y2: RT[1],
	};
	const line3 = {
		x1: LB[0],
		y1: LB[1],
		x2: LT[0],
		y2: LT[1],
	};
	const line4 = {
		x1: RB[0],
		y1: RB[1],
		x2: RT[0],
		y2: RT[1],
	};
	return {
		line1,
		line2,
		line3,
		line4,
	};
}

export function helperRectangle(startXY, nextXY, endXY, xScale, yScale) {
	if (isNotDefined(startXY) || isNotDefined(nextXY) || isNotDefined(endXY)) {
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
	const xStart =  xScale(startXY[0]);
	const xNext =  xScale(nextXY[0]);
	const xEnd =  xScale(endXY[0]);
	const yStart =  yScale(startXY[1]);
	const yNext =  yScale(nextXY[1]);
	const yEnd =  yScale(endXY[1]);
	const gip = Math.sqrt((xEnd - xNext) * (xEnd - xNext) + (yEnd - yNext) * (yEnd - yNext));
	const angle_a = (xNext !== xStart) ? Math.atan((yStart - yNext) / (xNext - xStart)) * 180 / Math.PI : 90;
	const angle_b = (xEnd !== xNext) ? Math.atan((yNext - yEnd) / (xEnd - xNext)) * 180 / Math.PI : 90;
	const angle_c = 90 - (angle_b - angle_a);
	const katet = gip * Math.cos(angle_c * Math.PI / 180);
	const xRT  = xNext - katet * Math.sin(angle_a * Math.PI / 180);
	const yRT  = yNext - katet * Math.cos(angle_a * Math.PI / 180);
	const xRB  = 2 * xNext - xRT;
	const yRB  = 2 * yNext - yRT;
	const xLB = xRB - (xNext - xStart);
	const yLB = yRB - (yNext - yStart);
	const xLT = xRT - (xNext - xStart);
	const yLT = yRT - (yNext - yStart);
	const LB = [xLB, yLB];
	const RB = [xRB, yRB];
	const LT = [xLT, yLT];
	const RT = [xRT, yRT];
	return {
		LB,
		RB,
		LT,
		RT,
	};
}

export function helperPoint(startXY, nextXY, endXY, xScale, yScale, xAccessor, fullData) {
	if (isNotDefined(startXY) || isNotDefined(nextXY) || isNotDefined(endXY)) {
		return undefined;
	}
	const { LB, LT, RT, RB } = helperRectangle(startXY, nextXY, endXY, xScale, yScale);
	const newXRT = getXValue(xScale, xAccessor, [RT[0], RT[1]], fullData);
	const newYRT = yScale.invert(RT[1]);
	const newXLT = getXValue(xScale, xAccessor, [LT[0], LT[1]], fullData);
	const newYLT = yScale.invert(LT[1]);
	const newXLB = getXValue(xScale, xAccessor, [LB[0], LB[1]], fullData);
	const newYLB = yScale.invert(LB[1]);
	const newXRB = getXValue(xScale, xAccessor, [RB[0], RB[1]], fullData);
	const newYRB = yScale.invert(RB[1]);
	const newLB = [newXLB, newYLB];
	const newRB = [newXRB, newYRB];
	const newLT = [newXLT, newYLT];
	const newRT = [newXRT, newYRT];
	return {
		LB: newLB,
		RB: newRB,
		LT: newLT,
		RT: newRT,
	};
}

export function helperPoint2(XY, moreProps) {
	if (isNotDefined(XY)) {
		return undefined;
	}
	const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
	const newX = getXValue(xScale, xAccessor, [XY[0], XY[1]], fullData);
	const newY = yScale.invert(XY[1]);
	const newXY = [newX, newY];
	return newXY;
}
RotateRectangle.propTypes = {
	startXY: PropTypes.any,
	nextXY: PropTypes.any,
	endXY: PropTypes.any,
	fillOpacity: PropTypes.any,
	fill: PropTypes.any,
	isFill: PropTypes.any,
	strokeDasharray: PropTypes.any,

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

RotateRectangle.defaultProps = {
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

export default RotateRectangle;
