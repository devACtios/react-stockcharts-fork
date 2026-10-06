import React, { Component } from "react";
import PropTypes from "prop-types";

import { pairs } from "d3-array";
import { path as d3Path } from "d3-path";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { generateLine, isHovering2 } from "./StraightLine";

import {
	isDefined, isNotDefined,
	noop, hexToRGBA,
	getStrokeDasharray,
} from "../../utils";

class GannFan extends Component {
	constructor(props) {
		super(props);

		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}
	isHover(moreProps) {
		const { fans, tolerance, onHover } = this.props;
		const { mouseXY } = moreProps;
		const [mouseX, mouseY] = mouseXY;

		let hovering = false;
		if (isDefined(onHover)) {

			const lines = helper(this.props, moreProps, fans);

			for (let i = 0; i < lines.length; i++) {
				const line1 = lines[i];

				const left = Math.min(line1.x1, line1.x2);
				const right = Math.max(line1.x1, line1.x2);
				const top = Math.min(line1.y1, line1.y2);
				const bottom = Math.max(line1.y1, line1.y2);

				const isWithinLineBounds = mouseX >= left && mouseX <= right
					&& mouseY >= top && mouseY <= bottom;

				hovering = isWithinLineBounds
					&& isHovering2(
						[line1.x1, line1.y1],
						[line1.x2, line1.y2],
						mouseXY,
						tolerance);

				if (hovering) break;
			}
		}
		return hovering;
	}
	drawOnCanvas(ctx, moreProps) {
		const {
			fans, strokeWidth, strokeOpacity,
			fillOpacity, strokeDasharray,
			fontFamily, fontSize, fontFill
		} = this.props;

		const lines = helper(this.props, moreProps, fans);

		ctx.lineWidth = strokeWidth;


		ctx.font = `${ fontSize }px ${fontFamily}`;
		ctx.fillStyle = fontFill;
		ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

		lines.forEach((line, idx) => {
			const {
				x1, y1, x2, y2, label
			} = line;

			ctx.strokeStyle = hexToRGBA(fans[idx].stroke, strokeOpacity);
			ctx.fillStyle = fans[idx].stroke;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			ctx.beginPath();
			ctx.fillText(label.text, label.x, label.y);
		});
		const pairsOfLines = pairs(lines);

		pairsOfLines.filter((line, idx) => fans[idx].isStroke).forEach(([line1, line2], idx) => {
			ctx.fillStyle = hexToRGBA(fans[idx].stroke, fillOpacity);

			ctx.beginPath();
			ctx.moveTo(line1.x1, line1.y1);
			ctx.lineTo(line1.x2, line1.y2);
			ctx.lineTo(line2.x2, line2.y2);
			ctx.closePath();
			ctx.fill();
		});
	}
	renderSVG(moreProps) {
		const { fans, strokeWidth, strokeOpacity, fillOpacity, strokeDasharray, fontFamily, fontSize } = this.props;

		const lines = helper(this.props, moreProps, fans);
		const pairsOfLines = pairs(lines);

		return React.createElement(
			"g",
			null,
			lines.map(function(each, idx) {
				const { x1, y1, x2, y2 } = each;

				return React.createElement("line", {
					key: idx,
					x1: x1, y1: y1, x2: x2, y2: y2,
					stroke: fans[idx].stroke,
					strokeWidth: strokeWidth,
					strokeOpacity: strokeOpacity,
					strokeDasharray: getStrokeDasharray(strokeDasharray).split(","),
				});
			}),
			lines.map(function(each, idx) {
				const { label } = each;

				return React.createElement("text", {
					key: idx,
					x: label.x, y: label.y,
					fontSize: fontSize,
					fontFamily: fontFamily,
					fill: fans[idx].stroke
				}, label.text);
			}),
			pairsOfLines.map(function(each, idx) {
				const line1 = each[0];
				const line2 = each[1];

				const ctx = d3Path();
				ctx.moveTo(line1.x1, line1.y1);
				ctx.lineTo(line1.x2, line1.y2);
				ctx.lineTo(line2.x2, line2.y2);
				ctx.closePath();

				return React.createElement("path", {
					key: idx,
					stroke: "none",
					fill: fans[idx].stroke,
					fillOpacity: fillOpacity,
					d: ctx.toString()
				});
			})
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

			drawOn={["mousemove", "mouseleave", "pan", "drag"]}
		/>;
	}
}

function getLineCoordinates(start, endX, endY, text) {
	const end = [
		endX,
		endY
	];
	return {
		start, end, text
	};
}

function helper(props, moreProps, fans) {
	const { startXY, endXY } = props;

	const {
		xScale,
		chartConfig: { yScale },
		width,
	} = moreProps;
	if (isNotDefined(startXY) || isNotDefined(endXY)) {
		return [];
	}
	const [x1, y1] = startXY;
	const [x2, y2] = endXY;

	const dx = x2 - x1;
	const dy = y2 - y1;

	if (dx !== 0 && dy !== 0) {
		const halfY = getLineCoordinates(
			startXY,
			x2,
			y1 + dy / 2,
			"2/1"
		);
		const oneThirdY = getLineCoordinates(
			startXY,
			x2,
			y1 + dy / 3,
			"3/1"
		);
		const oneFourthY = getLineCoordinates(
			startXY,
			x2,
			y1 + dy / 4,
			"4/1"
		);
		const oneEighthY = getLineCoordinates(
			startXY,
			x2,
			y1 + dy / 8,
			"8/1"
		);
		const halfX = getLineCoordinates(
			startXY,
			x1 + dx / 2,
			y2,
			"1/2"
		);
		const oneThirdX = getLineCoordinates(
			startXY,
			x1 + dx / 3,
			y2,
			"1/3"
		);
		const oneFourthX = getLineCoordinates(
			startXY,
			x1 + dx / 4,
			y2,
			"1/4"
		);
		const oneEighthX = getLineCoordinates(
			startXY,
			x1 + dx / 8,
			y2,
			"1/8"
		);
		const lines = [
			{ fan: oneEighthX, isFan: fans[0].isStroke },
			{ fan: oneFourthX, isFan: fans[1].isStroke },
			{ fan: oneThirdX, isFan: fans[2].isStroke },
			{ fan: halfX, isFan: fans[3].isStroke },
			{ fan: { start: startXY, end: endXY, text: "1/1" }, isFan: fans[4].isStroke },
			{ fan: halfY, isFan: fans[5].isStroke },
			{ fan: oneThirdY, isFan: fans[6].isStroke },
			{ fan: oneFourthY, isFan: fans[7].isStroke },
			{ fan: oneEighthY, isFan: fans[8].isStroke },
		];
		const lineCoods = lines.filter(each => each.isFan).map(line => {
			const { x1, y1, x2, y2 } = generateLine({
				type: "RAY",
				start: line.fan.start,
				end: line.fan.end,
				xScale,
				yScale,
				width,
			});
			return {
				x1: xScale(x1),
				y1: yScale(y1),
				x2: xScale(x2),
				y2: yScale(y2),
				label: {
					x: xScale(line.fan.end[0]),
					y: yScale(line.fan.end[1]),
					text: line.fan.text
				}
			};
		});
		return lineCoods;
	}
	return [];
}


GannFan.propTypes = {
	interactiveCursorClass: PropTypes.string,
	fans: PropTypes.arrayOf(PropTypes.any).isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.any,
	fillOpacity: PropTypes.number.isRequired,

	fontFamily: PropTypes.string.isRequired,
	fontSize: PropTypes.number.isRequired,
	fontFill: PropTypes.string.isRequired,

	onDragStart: PropTypes.func.isRequired,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onHover: PropTypes.func,
	onUnHover: PropTypes.func,

	defaultClassName: PropTypes.string,

	tolerance: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,
};

GannFan.defaultProps = {
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,

	strokeWidth: 1,
	tolerance: 4,
	selected: false,
};

export default GannFan;
