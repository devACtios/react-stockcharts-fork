import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import { isDefined, noop, hexToRGBA } from "../../utils";

class CircleTrendAngel extends Component {
	constructor(props) {
		super(props);
		this.saveNode = this.saveNode.bind(this);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.isHover = this.isHover.bind(this);
	}
	saveNode(node) {
		this.node = node;
	}
	isHover(moreProps) {
		const { mouseXY } = moreProps;
		const r = this.props.r + 7;
		const [x2, y2] = helper(this.props, moreProps);

		const [mx, my] = mouseXY;
		const hover = (x2 - r) < mx && mx < (x2 + r)
			&& (y2 - r) < my && my < (y2 + r);

		return hover;
	}
	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, fill, coordinate_scale } = this.props;

		const { fillOpacity, strokeOpacity } = this.props;
		const { r } = this.props;

		if (isDefined(coordinate_scale)) {
			const [x2, y2] = helper(this.props, moreProps);

			ctx.lineWidth = strokeWidth;
			ctx.fillStyle = hexToRGBA(fill, fillOpacity);
			ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

			ctx.beginPath();
			ctx.arc(x2, y2, r, 0, 2 * Math.PI, false);

			ctx.fill();
			ctx.stroke();
		}
	}

	renderSVG(moreProps) {
		const { stroke, strokeWidth, fill } = this.props;
		const { fillOpacity, strokeOpacity } = this.props;
		const { r } = this.props;

		const [x, y] = helper(this.props, moreProps);

		const rotateIcon = (
			<g className="rotateIcon">
				<rect
					x="0.701266"
					y="17.5648"
					width="27"
					height="27"
					rx="13.5"
					transform="rotate(-37.6307 0.701266 17.5648)"
					fill="#08101B"
					fillOpacity="0.8"
					stroke="#03A9F4"
				/>
				<path
					d="M25.135 18.8648H20.9917L22.6661 17.1414C20.9978 15.4914 18.2967 15.4303 16.6283 17.0803C14.96 18.7364 14.96 21.407 16.6283 23.0631C18.2967 24.7192 20.9978 24.7192 22.6661 23.0631C23.4972 22.2442 23.9128 21.2848 23.9128 20.0748H25.135C25.135 21.2848 24.5972 22.8553 23.5217 23.9187C21.3767 26.0453 17.8933 26.0453 15.7483 23.9187C13.6094 21.7981 13.5911 18.3514 15.7361 16.2309C17.8811 14.1103 21.3217 14.1103 23.4667 16.2309L25.135 14.5137V18.8648Z"
					fill="#03A9F4"
				/>
			</g>
		);

		return (
			<g className="dragCircle">
				<circle className="clickableCircle" cx={x} cy={y} r={r}
					strokeWidth={strokeWidth}
					stroke={stroke}
					strokeOpacity={strokeOpacity}
					fill={fill}
					fillOpacity={fillOpacity}
				/>
				<svg
					width={40}
					height={40}
					x={x - 20}
					y={y - 20}
				>
					{rotateIcon}
				</svg>
			</g>
		);
	}

	render() {
		const { interactiveCursorClass } = this.props;
		const { show } = this.props;
		const { onDragStart, onDrag, onDragComplete } = this.props;

		return show
			? <GenericChartComponent ref={this.saveNode}
				interactiveCursorClass={interactiveCursorClass}
				selected
				isHover={this.isHover}

				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragComplete={onDragComplete}

				svgDraw={this.renderSVG}

				canvasDraw={this.drawOnCanvas}
				canvasToDraw={getMouseCanvas}

				drawOn={["pan", "mousemove", "drag"]}
			/>
			: null;
	}
}

function helper(props, moreProps) {
	const { xyProvider, coordinate_scale, x1Value, y1Value } = props;
	const { xScale, chartConfig: { yScale } } = moreProps;

	if (isDefined(xyProvider)) {
		return xyProvider(moreProps);
	}

	const x1 = xScale(x1Value);
	const y1 = yScale(y1Value);

	const angle_r = coordinate_scale.angle_r;
	const d = coordinate_scale.hypotenuse;

	const x2 = x1 + d * Math.cos(angle_r);
	const y2 = y1 - d * Math.sin(angle_r);

	return [x2, y2];
}
CircleTrendAngel.propTypes = {
	xyProvider: PropTypes.func,

	onDragStart: PropTypes.func.isRequired,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	stroke: PropTypes.string.isRequired,
	fill: PropTypes.string.isRequired,
	r: PropTypes.number.isRequired,

	cx: PropTypes.number,
	cy: PropTypes.number,

	className: PropTypes.string.isRequired,
	show: PropTypes.bool.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	fillOpacity: PropTypes.number.isRequired,
	interactiveCursorClass: PropTypes.string,
	coordinate_scale: PropTypes.object,
};


CircleTrendAngel.defaultProps = {
	className: "react-stockcharts-interactive-line-edge",
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,
	onMove: noop,
	show: false,
	fillOpacity: 1,
	strokeOpacity: 1,
};

export default CircleTrendAngel;
