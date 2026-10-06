
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { getXValue } from "../../utils/ChartDataUtil";

import {
	isDefined,
	isNotDefined,
	noop,
	hexToRGBA,
	getStrokeDasharray,
} from "../../utils";

class ClickableEllipse extends Component {
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

			const { center, bigAxis, smallAxis, angle } = getEllipse(startXY, nextXY, endXY, xScale, yScale);
			return isHoveringEllipse(center, bigAxis, smallAxis, angle, mouseXY, tolerance);
		}
		return false;
	}

	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fillOpacity, fill, isFill } = this.props;
		const { startXY, nextXY, endXY } = this.props;
		const { xScale, chartConfig: { yScale } } = moreProps;

		if (isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)) {
			const ellipse = getEllipse(startXY, nextXY, endXY, xScale, yScale);
			const { center, bigAxis, smallAxis, angle } = ellipse;
			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
			ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));
			ctx.beginPath();
			ctx.save();
			ctx.translate(center[0], center[1]);
			ctx.rotate(angle);
			ctx.scale(1, smallAxis / bigAxis);
			ctx.arc(0, 0,  bigAxis, 0,  Math.PI * 2);
			ctx.restore();
			ctx.stroke();
			ctx.closePath();
			if (isFill) {
				ctx.fillStyle = hexToRGBA(fill, fillOpacity);
				ctx.fill();
			}
		}
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, fillOpacity, fill, isFill, startXY, nextXY, endXY } = this.props;

		const xScale = moreProps.xScale;
		const yScale = moreProps.chartConfig.yScale;

		if (isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)) {
			const { center, bigAxis, smallAxis, angle } = getEllipse(startXY, nextXY, endXY, xScale, yScale);

			return React.createElement("ellipse", {
				className: "test",
				cx: center[0],
				cy: center[1],
				rx: bigAxis,
				ry: smallAxis,
				stroke: stroke,
				strokeWidth: strokeWidth,
				strokeDasharray: getStrokeDasharray(strokeDasharray),
				strokeOpacity: strokeOpacity,
				fill: fill,
				fillOpacity: isFill ? fillOpacity : 0,
				transform: "rotate(" + (angle / Math.PI * 180) + " " + center[0] + " " + center[1] + ")",
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

function isHoveringEllipse(center, bigAxis, smallAxis, angle, mouseXY, tolerance) {
	const [mx, my] = mouseXY;
	const c_mx = mx - center[0];
	const c_my = my - center[1];
	const r_mx = c_mx * Math.cos(angle) + c_my * Math.sin(angle);
	const r_my = c_my * Math.cos(angle) - c_mx * Math.sin(angle);
	const t_mx = r_mx;
	const t_my = r_my * bigAxis / smallAxis;
	const r = bigAxis;
	const hover = (Math.abs(t_mx) < (r + tolerance)) && (Math.abs(t_my) < (r + tolerance));
	return hover;
}


function getEllipse(startXY, nextXY, endXY, xScale, yScale) {
	if (isNotDefined(startXY) || isNotDefined(nextXY)) {
		return {};
	}
	const { top, bottom } = helperEllipse(startXY, nextXY, endXY, xScale, yScale);
	const xStart =  xScale(startXY[0]);
	const yStart =  yScale(startXY[1]);
	const xNext =  xScale(nextXY[0]);
	const yNext =  yScale(nextXY[1]);
	const xTop =  top[0];
	const yTop =  top[1];
	const xBottom =  bottom[0];
	const yBottom =  bottom[1];

	const xCenter =  (xStart + xNext) / 2;
	const yCenter =  (yStart + yNext) / 2;
	const center = [xCenter, yCenter];
	const bigAxis  = Math.sqrt((yNext - yStart) * (yNext - yStart) + (xNext - xStart) * (xNext - xStart)) / 2;
	const smallAxis  = Math.sqrt((yTop - yBottom) * (yTop - yBottom) + (xTop - xBottom) * (xTop - xBottom)) / 2;
	const angle = (xNext !== xStart) ? Math.atan((yStart - yNext) / (xStart - xNext)) : Math.PI / 2;
	return {
		center,
		bigAxis,
		smallAxis,
		angle,
	};
}

export function helperEllipse(startXY, nextXY, endXY, xScale, yScale) {
	if (isNotDefined(startXY) || isNotDefined(nextXY) || isNotDefined(endXY)) {
		return {};
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
	const xTop = xRT - (xNext - xStart) / 2;
	const yTop = yRT - (yNext - yStart) / 2;
	const xBottom = xRB - (xNext - xStart) / 2;
	const yBottom = yRB - (yNext - yStart) / 2;
	const top = [xTop, yTop];
	const bottom = [xBottom, yBottom];
	return {
		top,
		bottom,
	};
}

export function helperPoint(startXY, nextXY, endXY, xScale, yScale, xAccessor, fullData) {
	if (isNotDefined(startXY) || isNotDefined(nextXY) || isNotDefined(endXY)) {
		return undefined;
	}
	const { top, bottom } = helperEllipse(startXY, nextXY, endXY, xScale, yScale);
	const newXTop = getXValue(xScale, xAccessor, [top[0], top[1]], fullData);
	const newYTop = yScale.invert(top[1]);
	const newXBottom = getXValue(xScale, xAccessor, [bottom[0], bottom[1]], fullData);
	const newYBottom = yScale.invert(bottom[1]);
	const newTop = [newXTop, newYTop];
	const newBottom = [newXBottom, newYBottom];
	return {
		top: newTop,
		bottom: newBottom,
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
ClickableEllipse.propTypes = {
	centerXY: PropTypes.any,
	bigAxis: PropTypes.any,
	endXY: PropTypes.any,
	startXY: PropTypes.any,
	nextXY: PropTypes.any,
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

ClickableEllipse.defaultProps = {
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

export default ClickableEllipse;
