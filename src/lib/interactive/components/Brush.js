
import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import {
	isDefined,
	noop,
	hexToRGBA,
	getStrokeDasharray, isNotDefined,
} from "../../utils";
import { isHovering2 } from "./StraightLine";

class Brush extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}

	isHover(moreProps) {
		const { tolerance, onHover } = this.props;

		if (isDefined(onHover)) {
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;
			const { points } =  helperLine(this.props.points, moreProps);

			const hovering = isHovering(
				points,
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
		const { stroke, strokeOpacity, strokeWidth, fill, fillOpacity, strokeDasharray, edgeFill, edgeStroke, edgeDasharray, edgeStrokeWidth } = this.props;
		const { xScale, chartConfig: { yScale } } = moreProps;
		const { x1Value, y1Value, x2Value, y2Value, r, selected } = this.props;
		const { points } =  helperLine(this.props.points, moreProps);

		ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
		ctx.fillStyle = hexToRGBA(fill, fillOpacity);
		ctx.lineWidth = strokeWidth;
		ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

		ctx.beginPath();
		if (isDefined(points)) {
			ctx.moveTo(points[0][0], points[0][1]);
			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i][0], points[i][1]);
			}
			ctx.stroke();
			if (selected) {
				ctx.strokeStyle = hexToRGBA(edgeStroke, strokeOpacity);
				ctx.fillStyle = hexToRGBA(edgeFill, fillOpacity);
				ctx.lineWidth = edgeStrokeWidth;
				ctx.setLineDash(getStrokeDasharray(edgeDasharray).split(","));
				ctx.beginPath();
				ctx.arc(xScale(x1Value), yScale(y1Value), r, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(xScale(x2Value), yScale(y2Value), r, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.stroke();
			}
		}
	}
	renderSVG(moreProps) {
		const { stroke, strokeOpacity, strokeWidth, strokeDasharray, fill, fillOpacity } = this.props;
		const { points } = helperLine(this.props.points, moreProps);
		const { xScale, chartConfig: { yScale } } = moreProps;
		const { x1Value, y1Value, x2Value, y2Value, selected } = this.props;

		const beginLine = selected
			? <circle cx={xScale(x1Value)} cy={yScale(y1Value)} r={2 * Math.PI}
				strokeWidth={strokeWidth}
				stroke={stroke}
				strokeOpacity={strokeOpacity}
				fill={fill}
				fillOpacity={fillOpacity}
			/>
			: null;

		const endLine = selected
			? <circle cx={xScale(x2Value)} cy={yScale(y2Value)} r={2 * Math.PI}
				strokeWidth={strokeWidth}
				stroke={stroke}
				strokeOpacity={strokeOpacity}
				fill={fill}
				fillOpacity={fillOpacity}
			/>
			: null;

		const dragIcon = (
			<g className="dragIcon">
				<rect
					x="1.40146"
					y="18.181"
					width="27"
					height="27"
					rx="13.5"
					transform="rotate(-37.6307 1.40146 18.181)"
					fill="#08101B"
					fillOpacity="0.8"
					stroke="#03A9F4"
				/>
				<g>
					<path
						d="M25.0026 18.2965L25.0026 20.0854L21.7626 20.0777V21.1821L25.0026 21.1743V22.9632L27.3359 20.6299L25.0026 18.2965ZM18.0026 15.9632H19.7915L19.7837 19.2032H20.8882L20.8804 15.9632H22.6693L20.3359 13.6299L18.0026 15.9632ZM15.6693 22.9632L15.6693 21.1743L18.9093 21.1821V20.0777L15.6693 20.0854L15.6693 18.2965L13.3359 20.6299L15.6693 22.9632ZM22.6693 25.2966H20.8804L20.8882 22.0566H19.7837L19.7915 25.2966H18.0026L20.3359 27.6299L22.6693 25.2966Z"
						fill="#03A9F4"
					/>
				</g>
			</g>
		);

		if (isDefined(points)) {
			return 	<g className="dragCircle">
				<polyline
					points = {points}
					stroke = {stroke}
					strokeWidth = {strokeWidth}
					strokeOpacity = {strokeOpacity}
					strokeDasharray = {getStrokeDasharray(strokeDasharray).split(",")}
					fill = {fill}
					fillOpacity = {0}
				/>;
				{beginLine}
				{endLine}
				<svg
					width={40}
					height={40}
					x={xScale(x1Value) - 20}
					y={yScale(y1Value) - 20}
				>
					{selected && dragIcon}
				</svg>
				<svg
					width={40}
					height={40}
					x={xScale(x2Value) - 20}
					y={yScale(y2Value) - 20}
				>
					{selected && dragIcon}
				</svg>
			</g>;
		}
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

			drawOn={["mousemove", "pan", "drag", "zoom"]}
		/>;
	}
}

function helperLine(points, moreProps) {
	const { xScale, chartConfig: { yScale } } = moreProps;
	if (isNotDefined(points)) {
		return {};
	}
	const newPoints = new Array();
	let px, py;
	for (let i = 0; i < points.length; i++) {
		if ((i > 0) && (i < points.length - 1)) {
			px = (xScale(points[i - 1][0]) + xScale(points[i][0]) + xScale(points[i + 1][0])) / 3;
			py = (yScale(points[i - 1][1]) + yScale(points[i][1]) + yScale(points[i + 1][1])) / 3;
		} else {
			px = xScale(points[i][0]);
			py = yScale(points[i][1]);
		}
		newPoints.push([px, py]);
	}
	return {
		points: newPoints,
	};
}

function isHovering(
	points,
	mouseXY,
	tolerance,
) {
	const [mouseX, mouseY] = mouseXY;
	for (let i = 0; i < points.length - 1; i++) {
		if (isHovering2(points[i], points[i + 1], [mouseX, mouseY], tolerance))
			return true;
	}
	return false;
}

Brush.propTypes = {
	points: PropTypes.any,
	fill: PropTypes.any,
	fillOpacity: PropTypes.any,
	strokeDasharray: PropTypes.any,
	edgeFill: PropTypes.any,
	edgeStroke: PropTypes.any,
	edgeDasharray: PropTypes.any,
	edgeStrokeWidth: PropTypes.any,
	r: PropTypes.any,
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,

	defaultClassName: PropTypes.string,

	withEdge: PropTypes.bool.isRequired,
	children: PropTypes.func.isRequired,
	tolerance: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,
	onDragStart: PropTypes.func,
	onDrag: PropTypes.func,
	onDragComplete: PropTypes.func,
	onHover: PropTypes.func,
	onUnHover: PropTypes.func,
};

Brush.defaultProps = {
	onEdge1Drag: noop,
	onEdge2Drag: noop,
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,

	edgeStrokeWidth: 3,
	stroke: "#000000",
	fill: "#FFFFFF",
	r: 4,
	withEdge: false,
	strokeWidth: 1,
	fillOpacity: 1,
	strokeOpacity: 1,
	children: noop,
	tolerance: 10,
	selected: false,
};

export default Brush;
