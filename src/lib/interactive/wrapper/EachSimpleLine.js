import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop, strokeDashTypes } from "../../utils";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";

import OneLine from "../components/OneLine";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachSimpleLine extends Component {
	constructor(props) {
		super(props);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleLineDragStart = this.handleLineDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.handleEdge1DragStart = this.handleEdge1DragStart.bind(this);

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
		} = this.props;

		this.dragStart = {
			x1Value, y1Value,
		};
	}
	handleLineDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			x1Value, y1Value,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const x1 = xScale(x1Value);
		const y1 = yScale(y1Value);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = yScale.invert(y1 - dy);

		onDrag(index, {
			x1Value: newX1Value,
			y1Value: newY1Value,
		});
	}
	handleEdge1DragStart() {
		this.setState({
			anchor: "edge1"
		});
	}
	handleDragComplete(...rest) {
		this.setState({
			anchor: undefined
		});
		this.props.onDragComplete(...rest);
	}
	handleEdge1Drag(moreProps) {
		const { index, onDrag } = this.props;
		const [x1Value, y1Value] = getNewXY(moreProps);

		onDrag(index, {
			x1Value,
			y1Value,
		});
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
			<OneLine
				ref={this.saveNodeType("line")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleHover}
				x1Value={x1Value}
				y1Value={y1Value}
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
				ref={this.saveNodeType("edge1")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={x1Value}
				cy={y1Value}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edge1" ? stroke : edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={this.handleEdge1DragStart}
				onDrag={this.handleEdge1Drag}
				onDragComplete={this.handleDragComplete}
				middlePoint/>
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

EachSimpleLine.propTypes = {
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,

	index: PropTypes.number,

	type: PropTypes.oneOf([
		"HORIZONTALLINE", // extends to horizontal line
		"VERTICALLINE", // extends to vertical line
		"HORIZONTALRAY", // extends between the set bounds
	]).isRequired,

	onDrag: PropTypes.func.isRequired,
	onEdge1Drag: PropTypes.func.isRequired,
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

EachSimpleLine.defaultProps = {
	onDrag: noop,
	onEdge1Drag: noop,
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

export default EachSimpleLine;
