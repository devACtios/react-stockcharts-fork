import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop, strokeDashTypes } from "../../utils";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";

import OneTrendAngel from "../components/OneTrendAngel";
import CircleTrendAngel from "../components/CircleTrendAngel";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachTrendAngel extends Component {
	constructor(props) {
		super(props);

		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);
		this.handleLineDragStart = this.handleLineDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.handleEdge2DragStart = this.handleEdge2DragStart.bind(this);

		this.handleDragComplete = this.handleDragComplete.bind(this);

		this.handleHover = this.handleHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
		};
	}
	handleLineDragStart() {
		const {
			x1Value, y1Value,
			coordinate_scale,
		} = this.props;

		this.dragStart = {
			x1Value, y1Value,
			coordinate_scale,
		};
	}

	handleLineDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			x1Value, y1Value,
			coordinate_scale,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const x1 = xScale(x1Value);
		const y1 = yScale(y1Value);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = doMagnetY(moreProps);

		const angle_r = coordinate_scale.angle_r;
		const d = coordinate_scale.hypotenuse;
		const x2 = x1 - dx + d * Math.cos(angle_r);
		const y2 = y1 - dy - d * Math.sin(angle_r);

		const point = { ...coordinate_scale, "start": [(x1 - dx), (y1 - dy)], "end": [x2, y2] };

		const newX2Value = x2;
		const newY2Value = y2;

		onDrag(index, {
			x1Value: newX1Value,
			y1Value: newY1Value,
			x2Value: newX2Value,
			y2Value: newY2Value,
			point: point,
		}, moreProps);
	}
	handleEdge2DragStart() {
		this.setState({
			anchor: "edge1"
		});
	}
	handleDragComplete(...rest) {
		this.setState({
			anchor: undefined,
		});
		this.props.onDragComplete(...rest);
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag } = this.props;
		const { chartConfig: { yScale }, mouseXY } = moreProps;

		const {
			x1Value, y1Value,
		} = this.props;

		const x2Value = mouseXY[0];
		const y2Value = yScale(doMagnetY(moreProps));

		onDrag(index, {
			x1Value,
			y1Value,
			x2Value,
			y2Value,
			point: undefined,
		}, moreProps);
	}

	handleHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
		}
	}

	render() {
		const {
			x1Value,
			y1Value,
			coordinate_scale,
			type,
			stroke,
			strokeWidth,
			strokeOpacity,
			strokeDasharray,
			r,
			edgeStrokeWidth,
			edgeFill,
			edgeStroke,
			edgeInteractiveCursor,
			lineInteractiveCursor,
			hoverText,
			selected,
			onDragComplete,
		} = this.props;
		const { hover, anchor } = this.state;

		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		return <g>
			<OneTrendAngel
				ref={this.saveNodeType("line")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleHover}
				x1Value={x1Value}
				y1Value={y1Value}
				coordinate_scale={coordinate_scale}
				type={type}
				stroke={stroke}
				strokeWidth={(hover || selected) ? strokeWidth + 1 : strokeWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("middlePoint")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={x1Value}
				cy={y1Value}
				r={r}
				fill={edgeFill}
				stroke={anchor === "middlePoint" ? stroke : edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete}
				middlePoint/>
			<CircleTrendAngel
				ref={this.saveNodeType("edge2")}
				show={selected || (isTouchDevice() ? false : hover)}
				x1Value={x1Value}
				y1Value={y1Value}
				coordinate_scale={coordinate_scale}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edge2" ? stroke : edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={this.handleEdge2DragStart}
				onDrag={this.handleEdge2Drag}
				onDragComplete={this.handleDragComplete} />
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

export function getNewXY(moreProps) {
	const { xScale, xAccessor, plotData, mouseXY } = moreProps;

	const x = getXValue(xScale, xAccessor, mouseXY, plotData);
	const y = doMagnetY(moreProps);

	return [x, y];
}

EachTrendAngel.propTypes = {
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	coordinate_scale: PropTypes.any,

	index: PropTypes.number,

	type: PropTypes.oneOf([
		"TRENDANGEL", // extends from -Infinity to +Infinity
	]).isRequired,

	onDrag: PropTypes.func.isRequired,
	onEdge1Drag: PropTypes.func.isRequired,
	onEdge2Drag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onUnSelect: PropTypes.func.isRequired,

	r: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	defaultClassName: PropTypes.string,

	selected: PropTypes.bool,

	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	edgeStrokeWidth: PropTypes.number.isRequired,
	edgeStroke: PropTypes.string.isRequired,
	edgeInteractiveCursor: PropTypes.string.isRequired,
	lineInteractiveCursor: PropTypes.string.isRequired,
	edgeFill: PropTypes.string.isRequired,
	hoverText: PropTypes.object.isRequired,
};

EachTrendAngel.defaultProps = {
	onDrag: noop,
	onEdge1Drag: noop,
	onEdge2Drag: noop,
	onDragComplete: noop,
	onSelect: noop,
	onUnSelect: noop,

	selected: false,

	edgeStroke: "#000000",
	edgeFill: "#FFFFFF",
	edgeStrokeWidth: 2,
	r: 5,
	strokeWidth: 1,
	strokeOpacity: 1,
	strokeDasharray: "Solid",
	hoverText: {
		enable: false,
	}
};

export default EachTrendAngel;
