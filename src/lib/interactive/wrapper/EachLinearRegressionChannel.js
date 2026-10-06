import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop } from "../../utils";
import { getCurrentItem } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";

import HoverTextNearMouse from "../components/HoverTextNearMouse";
import {
	default as LinearRegressionChannelWithArea,
	edge1Provider,
	edge2Provider
} from "../components/LinearRegressionChannelWithArea";

import ClickableCircle from "../components/ClickableCircle";

class EachLinearRegressionChannel extends Component {
	constructor(props) {
		super(props);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

		this.handleHover = this.handleHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
		};
	}
	handleEdge1Drag(moreProps) {
		const { index, onDrag, snapTo } = this.props;
		const {
			x2Value,
		} = this.props;

		const [x1Value] = getNewXY(moreProps, snapTo);

		onDrag(index, {
			x1Value,
			x2Value,
		});
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag, snapTo } = this.props;
		const {
			x1Value,
		} = this.props;

		const [x2Value] = getNewXY(moreProps, snapTo);

		onDrag(index, {
			x1Value,
			x2Value,
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
			x2Value,
			appearance,
			edgeInteractiveCursor,
			hoverText,
			interactive,
			selected,
			onDragComplete,
		} = this.props;
		const {
			stroke,
			stroke_base,
			stroke_up,
			stroke_down,
			strokeWidth_base,
			strokeWidth_up,
			strokeWidth_down,
			strokeDasharray_base,
			strokeDasharray_up,
			strokeDasharray_down,
			strokeOpacity,
			fill,
			fillOpacity,
			r,
			edgeStrokeWidth,
			edgeFill,
			edgeStroke,
			snapTo,
			source,
		} = appearance;
		const { hover } = this.state;

		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleHover }
			: {};
		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		return <g>
			<LinearRegressionChannelWithArea
				ref={this.saveNodeType("area")}
				selected={selected || (isTouchDevice() ? false : hover)}
				{...hoverHandler}

				x1Value={x1Value}
				x2Value={x2Value}
				fill={fill}
				source={source}
				snapTo={snapTo}
				stroke={stroke}
				stroke_base={stroke_base}
				stroke_up={stroke_up}
				stroke_down={stroke_down}
				strokeWidth_base={(hover || selected) ? strokeWidth_base + 1 : strokeWidth_base}
				strokeWidth_up={(hover || selected) ? strokeWidth_up + 1 : strokeWidth_up}
				strokeWidth_down={(hover || selected) ? strokeWidth_down + 1 : strokeWidth_down}
				strokeDasharray_base={strokeDasharray_base}
				strokeDasharray_up={strokeDasharray_up}
				strokeDasharray_down={strokeDasharray_down}
				strokeOpacity={strokeOpacity}
				appearance={appearance}
				fillOpacity={fillOpacity} />
			<ClickableCircle
				ref={this.saveNodeType("edge1")}
				show={selected || (isTouchDevice() ? false : hover)}
				xyProvider={edge1Provider(this.props)}
				r={r}
				fill={edgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				interactiveCursorClass={edgeInteractiveCursor}
				onDrag={this.handleEdge1Drag}
				onDragComplete={onDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edge2")}
				show={selected || (isTouchDevice() ? false : hover)}
				xyProvider={edge2Provider(this.props)}
				r={r}
				fill={edgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				interactiveCursorClass={edgeInteractiveCursor}
				onDrag={this.handleEdge2Drag}
				onDragComplete={onDragComplete} />
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

export function getNewXY(moreProps, snapTo) {
	const { xScale, xAccessor, plotData, mouseXY } = moreProps;

	const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
	const x = xAccessor(currentItem);
	const y = snapTo(currentItem);

	return [x, y];
}

EachLinearRegressionChannel.propTypes = {
	defaultClassName: PropTypes.string,

	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,

	index: PropTypes.number,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		fillOpacity: PropTypes.number.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
		edgeStrokeWidth: PropTypes.number.isRequired,
		edgeStroke: PropTypes.string.isRequired,
		edgeFill: PropTypes.string.isRequired,
		r: PropTypes.number.isRequired,
		stroke_base: PropTypes.any,
		stroke_up: PropTypes.any,
		stroke_down: PropTypes.any,
		strokeWidth_base: PropTypes.any,
		strokeWidth_up: PropTypes.any,
		strokeWidth_down: PropTypes.any,
		strokeDasharray_base: PropTypes.any,
		strokeDasharray_up: PropTypes.any,
		strokeDasharray_down: PropTypes.any,
		snapTo: PropTypes.any,
		source: PropTypes.any,
	}).isRequired,

	edgeInteractiveCursor: PropTypes.string,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	snapTo: PropTypes.func,
	interactive: PropTypes.bool.isRequired,
	selected: PropTypes.bool.isRequired,

	hoverText: PropTypes.object.isRequired,
};

EachLinearRegressionChannel.defaultProps = {
	onDrag: noop,
	onDragComplete: noop,

	appearance: {
		source: "close",
		stroke: "#000000",
		stroke_base: "#000000",
		stroke_up: "#000000",
		stroke_down: "#000000",
		strokeWidth_base: 1,
		strokeWidth_up: 1,
		strokeWidth_down: 1,
		strokeDasharray_base: "Solid",
		strokeDasharray_up: "Solid",
		strokeDasharray_down: "Solid",
		fillOpacity: 0.7,
		strokeOpacity: 1,
		strokeWidth: 1,
		fill: "#8AAFE2",
		edgeStrokeWidth: 2,
		edgeStroke: "#000000",
		edgeFill: "#FFFFFF",
		r: 5,
	},
	interactive: true,
	selected: false,
	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: !isTouchDevice(),
		bgHeight: 18,
		bgWidth: 175,
		text: "Click and drag the edge circles",
	}
};

export default EachLinearRegressionChannel;
