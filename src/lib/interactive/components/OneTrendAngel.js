
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

class OneTrendAngel extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}

	isHover(moreProps) {
		const { tolerance, onHover } = this.props;

		if (isDefined(onHover)) {
			const { x1Value, y1Value, coordinate_scale, type } = this.props;
			const { mouseXY, xScale } = moreProps;
			const { chartConfig: { yScale } } = moreProps;

			const hovering = isHovering({
				x1Value, y1Value,
				mouseXY,
				type,
				tolerance,
				xScale,
				yScale,
				coordinate_scale,
			});
			return hovering;
		}
		return false;
	}

	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, coordinate_scale } = this.props;

		const { x1, y1 } = helper(this.props, moreProps);

		if (isDefined(coordinate_scale)) {

			const angle_r = coordinate_scale.angle_r;
			const d = coordinate_scale.hypotenuse;

			const x2 = x1 + d * Math.cos(angle_r);
			const y2 = y1 - d * Math.sin(angle_r);

			ctx.lineWidth = strokeWidth;
			ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
			ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();

			ctx.save();
			ctx.beginPath();
			ctx.translate(x1, y1);
			ctx.font = "14px Arial";
			let text = Math.round(coordinate_scale.angle_r  * 180 / Math.PI);
			if (isNaN(coordinate_scale.angle_r)) text = 0;
			if (text === "-180") text = "180";
			if (text === "NaN") text = "0";
			ctx.fillStyle = hexToRGBA(stroke, strokeOpacity);
			ctx.fillText(text, 35, -15);
			ctx.setLineDash([3, 7]);
			ctx.lineWidth = 1;
			if (y1 >= y2) {
				ctx.arc(0, 0, 30, -1 * coordinate_scale.angle_r, 0);
			} else {
				ctx.arc(0, 0, 30, 0, -1 * coordinate_scale.angle_r);
			}
			ctx.scale(0.5, 0.5);
			ctx.moveTo(0, 0);
			ctx.lineTo(90, 0);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, coordinate_scale } = this.props;

		const lineWidth = strokeWidth;

		const { x1, y1 } = helper(this.props, moreProps);
		if (isDefined(coordinate_scale)) {

			const angle_r = coordinate_scale.angle_r;
			const d = coordinate_scale.hypotenuse;

			const x2 = x1 + d * Math.cos(angle_r);
			const y2 = y1 - d * Math.sin(angle_r);

			let text = Math.round(coordinate_scale.angle_r * 180 / Math.PI);
			if (isNaN(coordinate_scale.angle_r)) text = 0;
			if (text === "-180") text = "180";
			if (text === "NaN") text = "0";

			let x3, y3, x4, y4, x_text, y_text;
			if (coordinate_scale.angle_r >= 0) {
				x3 = x1 + 30 * Math.cos(angle_r);
				y3 = y1 - 30 * Math.sin(angle_r);
				x4 = x1 + 30;
				y4 = y1;
				x_text = x1 + 35;
				y_text = y1 - 15;
			} else {
				x3 = x1 + 30;
				y3 = y1;
				x4 = x1 + 30 * Math.cos(angle_r);
				y4 = y1 - 30 * Math.sin(angle_r);
				x_text = x1 + 35;
				y_text = y1 + 25;
			}
			const x5 = x1 + 45;

			return (
				<g>
					<line
						x1={x1} y1={y1} x2={x2} y2={y2}
						stroke={stroke} strokeWidth={lineWidth}
						strokeDasharray={getStrokeDasharray(strokeDasharray).split(",")}
						strokeOpacity={strokeOpacity}/>
					<text
						x={x_text}
						y={y_text}
						fontFamily={"Arial"}
						fontSize={"14px"}
						fill={stroke}>{text}</text>
					<path d={"M" + x3 + "," + y3 + " A30,30 " + coordinate_scale.angle_r + " 0,1 " + x4 + "," + y4}
						strokeWidth={1}
						stroke={stroke}
						strokeOpacity={strokeOpacity}
						strokeDasharray={getStrokeDasharray("ShortDash2").split(",")}
						fill={stroke}
						fillOpacity={0}
					/>
					<line
						x1={x1} y1={y1} x2={x5} y2={y1}
						stroke={stroke} strokeWidth={1}
						strokeDasharray={getStrokeDasharray("ShortDash2").split(",")}
						strokeOpacity={strokeOpacity}/>
				</g>
			);
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

export function isHovering({
	x1Value, y1Value,
	mouseXY,
	type,
	tolerance,
	xScale,
	yScale,
	coordinate_scale,
}) {

	const line = generateLine({
		type,
		start: [x1Value, y1Value],
		xScale,
		yScale,
		coordinate_scale
	});

	const start = [xScale(line.x1), yScale(line.y1)];

	const angle_r = coordinate_scale.angle_r;
	const d = coordinate_scale.hypotenuse;

	const x2 = start[0] + d * Math.cos(angle_r);
	const y2 = start[1] - d * Math.sin(angle_r);

	const end = [x2, y2];

	const m = getSlope(start, end);
	const [mouseX, mouseY] = mouseXY;

	if (isDefined(m)) {
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
	const { x1Value, y1Value } = props;

	const { xScale, chartConfig: { yScale } } = moreProps;

	const x1 = xScale(x1Value);
	const y1 = yScale(y1Value);

	return {
		x1, y1
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

export function generateLine({
	start, coordinate_scale
}) {
	const end = coordinate_scale.end;

	return getTrendAngelCoordinates({
		start, end
	});

}

function getTrendAngelCoordinates({
	start, end
}) {

	const [x1, y1] = start;
	const [x2, y2] = end;
	if (end[0] === start[0]) {
		return {
			x1,
			y1: start[1],
			x2: x1,
			y2: end[1],
		};
	}

	return {
		x1, y1,
		x2, y2,
	};
}

OneTrendAngel.propTypes = {
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	coordinate_scale: PropTypes.any,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	type: PropTypes.oneOf([
		"XLINE", // extends from -Infinity to +Infinity
		"RAY", // extends to +/-Infinity in one direction
		"LINE", // extends between the set bounds
		"ARROWLINE",
		"TRENDANGEL",
	]).isRequired,

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

OneTrendAngel.defaultProps = {
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

export default OneTrendAngel;
