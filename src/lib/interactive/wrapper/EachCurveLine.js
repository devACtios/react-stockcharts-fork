import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddleValue, noop, strokeDashTypes } from "../../utils";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";

import ClickableCurveLine from "../components/ClickableCurveLine";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachCurveLine extends Component {
	constructor(props) {
		super(props);

		this.handleLineDragStart = this.handleLineDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);
		this.handleEdge3Drag = this.handleEdge3Drag.bind(this);

		this.handleDragComplete = this.handleDragComplete.bind(this);

		this.handleHover = this.handleHover.bind(this);
		this.handleUnHover = this.handleUnHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
			color: props.color,
		};
		this.zooming = false;
	}
	handleHover(moreProps) {
		const { index, onDrag } = this.props;
		const {	x1Value, y1Value, x2Value, y2Value, x3Value, y3Value } = this.props;
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
			if (this.zooming) {
				this.zooming = false;
				onDrag(index, {
					x1Value: x1Value,
					y1Value: y1Value,
					x2Value: x2Value,
					y2Value: y2Value,
					x3Value: x3Value,
					y3Value: y3Value,
				});
			}
		}
	}
	handleUnHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering,
			});
		}
	}
	handleLineDragStart() {
		const {
			x1Value, y1Value,
			x2Value, y2Value,
			x3Value, y3Value,
		} = this.props;

		this.dragStart = {
			x1Value, y1Value,
			x2Value, y2Value,
			x3Value, y3Value,
		};
	}
	handleLineDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			x1Value, y1Value,
			x2Value, y2Value,
			x3Value, y3Value,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];
		if ((Math.abs(dx) < 1) && (Math.abs(dy)) < 1) {
			return;
		}
		const x1 = xScale(x1Value);
		const y1 = yScale(y1Value);
		const x2 = xScale(x2Value);
		const y2 = yScale(y2Value);
		const x3 = xScale(x3Value);
		const y3 = yScale(y3Value);

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = yScale.invert(y1 - dy);
		const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
		const newY2Value = yScale.invert(y2 - dy);
		const newX3Value = getXValue(xScale, xAccessor, [x3 - dx, y3 - dy], fullData);
		const newY3Value = yScale.invert(y3 - dy);


		onDrag(index, {
			x1Value: newX1Value,
			y1Value: newY1Value,
			x2Value: newX2Value,
			y2Value: newY2Value,
			x3Value: newX3Value,
			y3Value: newY3Value,
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
		const {
			x2Value, y2Value, x3Value, y3Value,
		} = this.props;

		const [x1Value, y1Value] = getNewXY(moreProps);

		onDrag(index, {
			x1Value,
			y1Value,
			x2Value,
			y2Value,
			x3Value,
			y3Value,
		});
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x1Value, y1Value, x3Value, y3Value,
		} = this.props;

		const [x2Value, y2Value] = getNewXY(moreProps);

		onDrag(index, {
			x1Value,
			y1Value,
			x2Value,
			y2Value,
			x3Value,
			y3Value,
		});
	}
	handleEdge3Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x1Value, y1Value, x2Value, y2Value,
		} = this.props;
		const { startPos, mouseXY } = moreProps;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];
		if ((Math.abs(dx) < 1) && (Math.abs(dy)) < 1) {
			return;
		}

		const [x3Value, y3Value] = getNewXY(moreProps);

		onDrag(index, {
			x1Value,
			y1Value,
			x2Value,
			y2Value,
			x3Value,
			y3Value,
		});
	}
	onZoomPanCallBack() {
		this.zooming = true;
	}
	render() {
		const {
			x1Value,
			y1Value,
			x2Value,
			y2Value,
			x3Value,
			y3Value,
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
			<ClickableCurveLine
				ref={this.saveNodeType("line")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleUnHover}
				x1Value={x1Value}
				y1Value={y1Value}
				x2Value={x2Value}
				y2Value={y2Value}
				x3Value={x3Value}
				y3Value={y3Value}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edge1")}
				show={(selected || hover) && (this.zooming === false)}
				cx={x1Value}
				cy={y1Value}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edge1" ? stroke : edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDrag={this.handleEdge1Drag}
				onDragComplete={this.handleDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edge3")}
				show={(selected || hover) && (this.zooming === false)}
				cx={x3Value}
				cy={y3Value}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edge1" ? stroke : edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDrag={this.handleEdge3Drag}
				onDragComplete={this.handleDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edge2")}
				show={(selected || hover) && (this.zooming === false)}
				cx={x2Value}
				cy={y2Value}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edge2" ? stroke : edgeStroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDrag={this.handleEdge2Drag}
				onDragComplete={this.handleDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("middlePoint")}
				show={(selected || hover) && (this.zooming === false)}
				cx={calcMiddleValue(x1Value, x2Value, x3Value)}
				cy={calcMiddleValue(y1Value, y2Value, y3Value)}
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

EachCurveLine.propTypes = {
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	x3Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,
	y3Value: PropTypes.any.isRequired,
	color: PropTypes.any,

	index: PropTypes.number,

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

EachCurveLine.defaultProps = {
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

export default EachCurveLine;
