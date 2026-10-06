
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

class OneArrowMark extends Component {
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
			const { chartConfig: { yScale } } = moreProps;

			const hovering = isHovering({
				x1Value, y1Value,
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
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, type, fillOpacity, text, font } = this.props;

		const { x1, y1 } = helper(this.props, moreProps);

		ctx.lineWidth = strokeWidth;
		ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

		ctx.beginPath();
		ctx.translate(x1, y1);

		switch (type) {
			case "ARROW_MARK_UP":
				ctx.fillStyle = hexToRGBA("#318757", fillOpacity);
				ctx.moveTo(0, 0);
				ctx.lineTo(10, 12);
				ctx.lineTo(-10, 12);
				ctx.rect(-4, 10, 8, 15);
				ctx.fill();
				if (text !== undefined) {
					ctx.fillStyle = hexToRGBA(stroke, strokeOpacity);
					ctx.font = strokeWidth + "px " + font;
					ctx.fillText(text, -10, 45);
				}
				break;
			case "ARROW_MARK_DOWN":
				ctx.fillStyle = hexToRGBA("#db563e", fillOpacity);
				ctx.moveTo(0, 0);
				ctx.lineTo(10, -12);
				ctx.lineTo(-10, -12);
				ctx.rect(-4, -10, 8, -15);
				ctx.fill();
				if (text !== undefined) {
					ctx.fillStyle = hexToRGBA(stroke, strokeOpacity);
					ctx.font = strokeWidth + "px " + font;
					ctx.fillText(text, -10, 19);
				}
				break;
			case "ARROW_MARK_FLAG":
				ctx.fillStyle = hexToRGBA("#318757", fillOpacity);
				ctx.rect(-1, 0, 1, -20);
				ctx.rect(0, -10, 15, -10);
				ctx.fill();
				break;
			default:
				ctx.fillStyle = hexToRGBA("#318757", fillOpacity);
				ctx.moveTo(0, 0);
				ctx.lineTo(10, 12);
				ctx.lineTo(-10, 12);
				ctx.rect(-4, 10, 8, 15);
				if (text !== undefined) {
					ctx.font = strokeWidth + "px " + font;
					ctx.fillText(text, -10, 45);
				}
				ctx.fill();
		}

		ctx.closePath();
	}
	renderSVG(moreProps) {
		const { strokeOpacity, type, text, stroke, strokeWidth, font } = this.props;
		const { x1, y1 } = helper(this.props, moreProps);

		switch (type) {
			case "ARROW_MARK_UP":
				return (
					<g>
						<path d = {"M 18.617188 8.460938 L 10.28125 0.121094 C 10.203125 0.0429688 10.097656 0 9.988281 0 C 9.875 0 9.769531 0.0429688 9.691406 0.121094 L 1.382812 8.460938 C 1.265625 8.578125 1.230469 8.757812 1.292969 8.914062 C 1.359375 9.070312 1.511719 9.171875 1.679688 9.171875 L 6.261719 9.171875 L 6.261719 19.582031 C 6.261719 19.8125 6.445312 20 6.675781 20 L 13.339844 20 C 13.570312 20 13.757812 19.8125 13.757812 19.582031 L 13.757812 9.171875 L 18.320312 9.171875 C 18.488281 9.171875 18.640625 9.070312 18.707031 8.914062 C 18.773438 8.757812 18.734375 8.578125 18.617188 8.460938 Z M 18.617188 8.460938"}
							fill = {hexToRGBA("#318757", strokeOpacity)}
							transform = {"translate(" + (x1 - 10) + " ," + y1 + ")"}
						/>
						<text
							x={x1 - 10}
							y={y1 + 35}
							fontFamily={font}
							fontSize={strokeWidth + "px"}
							fill={stroke}>{text}</text>
					</g>
				);
			case "ARROW_MARK_DOWN":
				return (
					<g>
						<path d = {"M 18.707031 11.085938 C 18.640625 10.929688 18.488281 10.828125 18.320312 10.828125 L 13.757812 10.828125 L 13.757812 0.417969 C 13.757812 0.1875 13.570312 0 13.339844 0 L 6.675781 0 C 6.445312 0 6.261719 0.1875 6.261719 0.417969 L 6.261719 10.828125 L 1.679688 10.828125 C 1.507812 10.828125 1.359375 10.929688 1.292969 11.085938 C 1.230469 11.242188 1.265625 11.421875 1.382812 11.539062 L 9.691406 19.878906 C 9.769531 19.957031 9.875 20 9.988281 20 C 10.097656 20 10.203125 19.957031 10.28125 19.878906 L 18.617188 11.542969 C 18.734375 11.421875 18.769531 11.242188 18.707031 11.085938 Z M 18.707031 11.085938"}
							fill = {hexToRGBA("#db563e", strokeOpacity)}
							transform = {"translate(" + (x1 - 10) + " ," + y1 + ")"}
						/>
						<text
							x={x1 - 10}
							y={y1 + 35}
							fontFamily={font}
							fontSize={strokeWidth + "px"}
							fill={stroke}>{text}</text>
					</g>
				);
			case "ARROW_MARK_FLAG":
				return (
					<g>
						<path d = {"M 17.5 1 L 2.832031 1 L 2.832031 0.332031 C 2.832031 0.148438 2.683594 0 2.5 0 C 2.316406 0 2.167969 0.148438 2.167969 0.332031 L 2.167969 19.667969 C 2.167969 19.851562 2.316406 20 2.5 20 C 2.683594 20 2.832031 19.851562 2.832031 19.667969 L 2.832031 12.332031 L 17.5 12.332031 C 17.683594 12.332031 17.832031 12.183594 17.832031 12 L 17.832031 1.332031 C 17.832031 1.148438 17.683594 1 17.5 1 Z M 17.5 1"}
							fill = {hexToRGBA("#318757", strokeOpacity)}
							transform = {"translate(" + (x1 - 10) + " ," + y1 + ")"}
						/>
						<text
							x={x1 - 10}
							y={y1 + 35}
							fontFamily={font}
							fontSize={strokeWidth + "px"}
							fill={stroke}>{text}</text>
					</g>
				);
			default:
				return (
					<g>
						<path d = {"M 17.5 1 L 2.832031 1 L 2.832031 0.332031 C 2.832031 0.148438 2.683594 0 2.5 0 C 2.316406 0 2.167969 0.148438 2.167969 0.332031 L 2.167969 19.667969 C 2.167969 19.851562 2.316406 20 2.5 20 C 2.683594 20 2.832031 19.851562 2.832031 19.667969 L 2.832031 12.332031 L 17.5 12.332031 C 17.683594 12.332031 17.832031 12.183594 17.832031 12 L 17.832031 1.332031 C 17.832031 1.148438 17.683594 1 17.5 1 Z M 17.5 1"}
							fill = {hexToRGBA("#318757", strokeOpacity)}
							transform = {"translate(" + (x1 - 10) + " ," + y1 + ")"}
						/>
					</g>
				);
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

			drawOn={["mousemove", "pan", "drag"]}
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
}) {

	const line = generateLine({
		type,
		start: [x1Value, y1Value],
		xScale,
		yScale,
	});

	const start = [xScale(line.x1), yScale(line.y1)];

	const [mouseX, mouseY] = mouseXY;
	if (type === "ARROW_MARK_UP") {
		return mouseY >= start[1] + tolerance - 20
			&& mouseY < start[1] - tolerance + 35
			&& mouseX < start[0] + tolerance - 5
			&& mouseX > start[0] - tolerance + 5;
	}
	if (type === "ARROW_MARK_DOWN") {
		return mouseY >= start[1] + tolerance - 20
			&& mouseY < start[1] - tolerance + 35
			&& mouseX < start[0] + tolerance - 5
			&& mouseX > start[0] - tolerance + 5;
	}
	if (type === "ARROW_MARK_FLAG") {
		return mouseY >= start[1] + tolerance - 40
			&& mouseY < start[1] - tolerance  + 10
			&& mouseX < start[0] + tolerance + 10
			&& mouseX > start[0] - tolerance;
	}
}

function helper(props, moreProps) {
	const { x1Value, y1Value, type } = props;

	const { xScale, chartConfig: { yScale } } = moreProps;

	const modLine = generateLine({
		type,
		start: [x1Value, y1Value],
		xScale,
		yScale,
	});

	const x1 = xScale(modLine.x1);
	const y1 = yScale(modLine.y1);

	return {
		x1, y1
	};

}

export function generateLine({
	type, start
}) {
	switch (type) {
		case "ARROW_MARK_UP":
		case "ARROW_MARK_DOWN":
		case "ARROW_MARK_FLAG":
			return getArrowLineCoordinates({ start });
	}
}

function getArrowLineCoordinates({
	start
}) {
	const [x1, y1] = start;

	return {
		x1, y1,
	};
}

OneArrowMark.propTypes = {
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	fillOpacity: PropTypes.any,
	text: PropTypes.any,
	font: PropTypes.any,

	interactiveCursorClass: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	type: PropTypes.oneOf([
		"ARROW_MARK_UP",
		"ARROW_MARK_DOWN",
		"ARROW_MARK_FLAG",
	]).isRequired,

	onEdge1Drag: PropTypes.func.isRequired,
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

OneArrowMark.defaultProps = {
	onEdge1Drag: noop,
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,

	edgeStrokeWidth: 3,
	edgeStroke: "#000000",
	edgeFill: "#FFFFFF",
	r: 10,
	withEdge: false,
	strokeWidth: 14,
	strokeDasharray: "Solid",
	children: noop,
	tolerance: 7,
	selected: false,
};

export default OneArrowMark;
