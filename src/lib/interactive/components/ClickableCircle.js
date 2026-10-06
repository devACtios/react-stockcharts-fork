import React, { Component } from "react";
import PropTypes from "prop-types";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import { isDefined, noop, hexToRGBA } from "../../utils";

class ClickableCircle extends Component {
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
		const [x, y] = helper(this.props, moreProps);

		const [mx, my] = mouseXY;
		const hover = (x - r) < mx && mx < (x + r)
			&& (y - r) < my && my < (y + r);
		return hover;
	}
	drawOnCanvas(ctx, moreProps) {
		const { stroke, strokeWidth, fill } = this.props;
		const { fillOpacity, strokeOpacity } = this.props;
		const { r } = this.props;

		const [x, y] = helper(this.props, moreProps);

		ctx.lineWidth = strokeWidth;
		ctx.fillStyle = hexToRGBA(fill, fillOpacity);
		ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
	}
	renderSVG(moreProps) {
		const { stroke, strokeWidth, fill, middlePoint } = this.props;
		const { fillOpacity, strokeOpacity } = this.props;
		const { r, icon } = this.props;

		const [x, y] = helper(this.props, moreProps);
		const offset = r / 2;

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

		return (
			<g className={`dragCircle${middlePoint ? " dragCircle--middlePoint" : ""}${icon ? " dragCircle--withIcon" : ""}`}>
				<circle className="clickableCircle" cx={x} cy={y} r={r}
					strokeWidth={strokeWidth}
					stroke={stroke}
					strokeOpacity={strokeOpacity}
					fill={fill}
					fillOpacity={fillOpacity}
				/>

				<svg
					width={icon ? r : 40}
					height={icon ? r : 40}
					x={icon ? (x - offset) : x - 20}
					y={icon ? (y - offset) : y - 20}
				>
					{icon ? icon : middlePoint ? dragIcon : rotateIcon}
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
	const { xyProvider, cx, cy, dx, dy } = props;

	if (isDefined(xyProvider)) {
		return xyProvider(moreProps);
	}

	const { xScale, chartConfig: { yScale } } = moreProps;

	const x = xScale(cx) + dx;
	const y = yScale(cy) + dy;
	return [x, y];

}
ClickableCircle.propTypes = {
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
	icon: PropTypes.element,
	show: PropTypes.bool.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	fillOpacity: PropTypes.number.isRequired,
	interactiveCursorClass: PropTypes.string,
	middlePoint: PropTypes.bool,
};


ClickableCircle.defaultProps = {
	className: "react-stockcharts-interactive-line-edge",
	onDragStart: noop,
	onDrag: noop,
	onDragComplete: noop,
	onMove: noop,
	icon: null,
	show: false,
	fillOpacity: 1,
	strokeOpacity: 1,
	dx: 0,
	dy: 0,
	middlePoint: false,
};

export default ClickableCircle;
