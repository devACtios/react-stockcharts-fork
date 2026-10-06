
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { isHovering2 } from "../components/StraightLine";

import {
	isDefined,
	noop,
	hexToRGBA,
	getStrokeDasharraySVG,
	getStrokeDasharrayCanvas,
} from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";

class ClickableCurveLine extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);

		this.start_point = undefined;
	}

	isHover(moreProps) {
		const { tolerance, onHover } = this.props;
		if (isDefined(onHover)) {
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;
			const { x1, y1, x2, y2, x4, y4 } = helper(this.props, moreProps);

			const hovering = isHovering(
				x1, y1,
				x2, y2,
				x4, y4,
				mouseXY,
				tolerance,
				xScale,
				yScale,
			);
			return hovering;
		}
		return false;
	}

	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray } = this.props;
		const { x1, y1, x2, y2, x4, y4 } = helper(this.props, moreProps);

		ctx.lineWidth = strokeWidth;
		ctx.lineWidth = strokeWidth;
		ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
		ctx.setLineDash(getStrokeDasharrayCanvas(strokeDasharray));

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.quadraticCurveTo(x4, y4, x2, y2);
		ctx.stroke();
		ctx.closePath();
	}
	renderSVG(moreProps) {
		const { stroke, strokeOpacity, strokeWidth, strokeDasharray, fill } = this.props;
		const { x1, y1, x2, y2, x4, y4 } = helper(this.props, moreProps);

		return <path d={"M" + x1 + "," + y1 + "Q" + x4 + "," + y4 + " " + x2 + "," + y2}
			strokeWidth={strokeWidth}
			stroke={stroke}
			strokeOpacity={strokeOpacity}
			strokeDasharray={getStrokeDasharraySVG(strokeDasharray)}
			fill={fill}
			fillOpacity={0}
		/>;
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

function isHovering(
	xStart, yStart,
	xEnd, yEnd,
	xControl, yControl,
	mouseXY,
	tolerance,
) {
	const [mouseX, mouseY] = mouseXY;
	const segments = new Array();
	makeCurve([[xStart, yStart], [xControl, yControl], [xEnd, yEnd]], segments);
	for (let i = 0; i < segments.length; i++) {
		if (isHovering2(segments[i][0], segments[i][2], [mouseX, mouseY], tolerance))
			return true;
	}
	return false;
}

function subdivide(curve) {
	const firstMidPoints = midPoints(curve);
	const secondMidPoints = midPoints(firstMidPoints);
	return [[curve[0], firstMidPoints[0], secondMidPoints[0]], [secondMidPoints[0], firstMidPoints[1], curve[2]]];
}

function midPoints(pointList) {
	const midPoint = function(p, q) {
		return [(p[0] + q[0]) / 2.0, (p[1] + q[1]) / 2.0];
	};
	const midPointList = new Array(pointList.length - 1);
	for (let i = 0; i < midPointList.length; i++) {
		// eslint-disable-next-line const-immutable/no-mutation
		midPointList[i] = midPoint(pointList[i], pointList[i + 1]);
	}
	return midPointList;
}

function makeCurve(curve, segments) {
	if (isFlat(curve)) {
		segments.push(curve);
	} else {
		const pieces = subdivide(curve);
		makeCurve(pieces[0], segments);
		makeCurve(pieces[1], segments);
	}
}

function isFlat(curve) {
	const tol = 2;
	const dx = curve[1][0] - (curve[0][0] + curve[2][0]) / 2;
	const dy = curve[1][1] - (curve[0][1] + curve[2][1]) / 2;
	return (Math.abs(dx) + Math.abs(dy) < tol);
}

function helper(props, moreProps) {
	const { x1Value, x2Value, y1Value, y2Value, x3Value, y3Value } = props;

	const { xScale, chartConfig: { yScale } } = moreProps;

	const x1 = xScale(x1Value);
	const y1 = yScale(y1Value);
	const x2 = xScale(x2Value);
	const y2 = yScale(y2Value);
	const x3 = xScale(x3Value);
	const y3 = yScale(y3Value);
	const cx = (x1 + x2) / 2;
	const cy = (y1 + y2) / 2;
	const x4 = 2 * x3 - cx;
	const y4 = 2 * y3 - cy;

	return {
		x1, y1, x2, y2, x3, y3, x4, y4,
	};
}

export function helperPoint(start, next, moreProps) {
	const { xScale, chartConfig: { yScale } } = moreProps;

	const x1 = xScale(start[0]);
	const y1 = yScale(start[1]);
	const x2 = xScale(next[0]);
	const y2 = yScale(next[1]);
	const cx = (x1 + x2) / 2;
	const cy = (y1 + y2) / 2;
	const dx = (x2 - x1) / 2;
	const dy = (y2 - y1) / 2;
	const x3 = cx + dy / 2;
	const y3 = cy - dx / 2;

	return [x3, y3];
}

export function helperPoint2(start, next, moreProps) {
	const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;

	const x1 = xScale(start[0]);
	const y1 = yScale(start[1]);
	const x2 = xScale(next[0]);
	const y2 = yScale(next[1]);
	const cx = (x1 + x2) / 2;
	const cy = (y1 + y2) / 2;
	const dx = (x2 - x1) / 2;
	const dy = (y2 - y1) / 2;
	const x3 = cx + dy / 2;
	const y3 = cy - dx / 2;
	const x3New = getXValue(xScale, xAccessor, [x3, y3], fullData);
	const y3New = yScale.invert(y3);

	return [x3New, y3New];
}

ClickableCurveLine.propTypes = {
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,
	strokeDasharray: PropTypes.any,
	fill: PropTypes.any,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,

	onEdge1Drag: PropTypes.func.isRequired,
	onEdge2Drag: PropTypes.func.isRequired,
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

ClickableCurveLine.defaultProps = {
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

export default ClickableCurveLine;
