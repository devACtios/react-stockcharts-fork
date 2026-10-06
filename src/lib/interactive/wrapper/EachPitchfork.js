import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddleValue, noop } from "../../utils";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";

import StraightLine from "../components/StraightLine";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachPitchFork extends Component {
	constructor(props) {
		super(props);

		this.handleEdgeStartDrag = this.handleEdgeStartDrag.bind(this);
		this.handleEdgeSupportDrag = this.handleEdgeSupportDrag.bind(this);
		this.handleEdgeResistanceDrag = this.handleEdgeResistanceDrag.bind(this);
		this.handleLineDragStart = this.handleLineDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.handleEdgeStartDragStart = this.handleEdgeStartDragStart.bind(this);
		this.handleEdgeSupportDragStart = this.handleEdgeSupportDragStart.bind(this);
		this.handleEdgeResistanceDragStart = this.handleEdgeResistanceDragStart.bind(this);

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
			xStart, yStart,
			xSupport, ySupport,
			xResistance, yResistance,
		} = this.props;

		this.dragStart = {
			xStart, yStart,
			xSupport, ySupport,
			xResistance, yResistance,
		};
	}
	handleLineDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			xStart, yStart,
			xSupport, ySupport,
			xResistance, yResistance,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const xStart_ = xScale(xStart);
		const yStart_ = yScale(yStart);
		const xSupport_ = xScale(xSupport);
		const ySupport_ = yScale(ySupport);
		const xResistance_ = xScale(xResistance);
		const yResistance_ = yScale(yResistance);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newxStart = getXValue(xScale, xAccessor, [xStart_ - dx, yStart_ - dy], fullData);
		const newyStart = yScale.invert(yStart_ - dy);
		const newxSupport = getXValue(xScale, xAccessor, [xSupport_ - dx, ySupport_ - dy], fullData);
		const newySupport = yScale.invert(ySupport_ - dy);
		const newxResistance = getXValue(xScale, xAccessor, [xResistance_ - dx, yResistance_ - dy], fullData);
		const newyResistance = yScale.invert(yResistance_ - dy);

		onDrag(index, {
			xStart: newxStart,
			yStart: newyStart,
			xSupport: newxSupport,
			ySupport: newySupport,
			xResistance: newxResistance,
			yResistance: newyResistance,
		});
	}
	handleEdgeStartDragStart() {
		this.setState({
			anchor: "EdgeStart"
		});
	}
	handleEdgeSupportDragStart() {
		this.setState({
			anchor: "EdgeSupport"
		});
	}
	handleEdgeResistanceDragStart() {
		this.setState({
			anchor: "EdgeResistance"
		});
	}
	handleDragComplete(...rest) {
		this.setState({
			anchor: undefined
		});
		this.props.onDragComplete(...rest);
	}
	handleEdgeStartDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			xSupport, ySupport,
			xResistance, yResistance,
		} = this.props;

		const [xStart, yStart] = getNewXY(moreProps);

		onDrag(index, {
			xStart,
			yStart,
			xSupport,
			ySupport,
			xResistance,
			yResistance,
		});
	}
	handleEdgeSupportDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			xStart, yStart,
			xResistance, yResistance,
		} = this.props;

		const [xSupport, ySupport] = getNewXY(moreProps);

		onDrag(index, {
			xStart,
			yStart,
			xSupport,
			ySupport,
			xResistance,
			yResistance,
		});
	}
	handleEdgeResistanceDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			xStart, yStart,
			xSupport, ySupport,
		} = this.props;

		const [xResistance, yResistance] = getNewXY(moreProps);

		onDrag(index, {
			xStart,
			yStart,
			xSupport,
			ySupport,
			xResistance,
			yResistance,
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
			xStart,
			yStart,
			xMedian,
			yMedian,
			xSupport,
			ySupport,
			xSupportEnd,
			ySupportEnd,
			xResistance,
			yResistance,
			xResistanceEnd,
			yResistanceEnd,
			stroke,
			strokePitch,
			strokeWidth,
			strokeOpacity,
			strokePitchWidth,
			strokePitchDasharray,
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
			<StraightLine
				ref={this.saveNodeType("lineMedian")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleHover}
				x1Value={xStart}
				y1Value={yStart}
				x2Value={xMedian}
				y2Value={yMedian}
				type={"RAY"}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete} />
			<StraightLine
				ref={this.saveNodeType("lineFork")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleHover}
				x1Value={xSupport}
				y1Value={ySupport}
				x2Value={xResistance}
				y2Value={yResistance}
				type={"LINE"}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete} />
			<StraightLine
				ref={this.saveNodeType("lineSupport")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleHover}
				x1Value={xSupport}
				y1Value={ySupport}
				x2Value={xSupportEnd}
				y2Value={ySupportEnd}
				type={"LINE"}
				stroke={strokePitch}
				strokeWidth={strokePitchWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokePitchDasharray}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete} />
			<StraightLine
				ref={this.saveNodeType("lineResistance")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleHover}
				x1Value={xResistance}
				y1Value={yResistance}
				x2Value={xResistanceEnd}
				y2Value={yResistanceEnd}
				type={"LINE"}
				stroke={strokePitch}
				strokeWidth={strokePitchWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokePitchDasharray}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edgeStart")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={xStart}
				cy={yStart}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edgeStart" ? edgeStroke : stroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={this.handleEdgeStartDragStart}
				onDrag={this.handleEdgeStartDrag}
				onDragComplete={this.handleDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edgeSupport")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={xSupport}
				cy={ySupport}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edgeSupport" ? edgeStroke : stroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={this.handleEdgeSupportDragStart}
				onDrag={this.handleEdgeSupportDrag}
				onDragComplete={this.handleDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edgeResistance")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={xResistance}
				cy={yResistance}
				r={r}
				fill={edgeFill}
				stroke={anchor === "edgeResistance" ? edgeStroke : stroke}
				strokeWidth={edgeStrokeWidth}
				strokeOpacity={1}
				interactiveCursorClass={edgeInteractiveCursor}
				onDragStart={this.handleEdgeResistanceDragStart}
				onDrag={this.handleEdgeResistanceDrag}
				onDragComplete={this.handleResistanceComplete} />

			<ClickableCircle key="pointMiddle"
				ref={this.saveNodeType("pointMiddle")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={calcMiddleValue(xSupport, xResistance)}
				cy={calcMiddleValue(ySupport, yResistance)}
				r={r}
				fill={edgeFill}
				stroke={anchor === "pointMiddle" ? edgeStroke : stroke}
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

EachPitchFork.propTypes = {
	xStart: PropTypes.any.isRequired,
	yStart: PropTypes.any.isRequired,
	xMedian: PropTypes.any.isRequired,
	yMedian: PropTypes.any.isRequired,
	xSupport: PropTypes.any.isRequired,
	ySupport: PropTypes.any.isRequired,
	xSupportEnd: PropTypes.any.isRequired,
	ySupportEnd: PropTypes.any.isRequired,
	xResistance: PropTypes.any.isRequired,
	yResistance: PropTypes.any.isRequired,
	xResistanceEnd: PropTypes.any.isRequired,
	yResistanceEnd: PropTypes.any.isRequired,
	strokePitch: PropTypes.any,
	strokePitchWidth: PropTypes.any,
	strokePitchDasharray: PropTypes.any,
	strokeDasharray: PropTypes.any,

	index: PropTypes.number,

	onDrag: PropTypes.func.isRequired,
	onEdgeStartDrag: PropTypes.func.isRequired,
	onEdgeSupportDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onUnSelect: PropTypes.func.isRequired,

	r: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	defaultClassName: PropTypes.string,

	selected: PropTypes.bool,

	stroke: PropTypes.string.isRequired,
	strokeChannels: PropTypes.arrayOf(PropTypes.any).isRequired,
	strokeWidth: PropTypes.number.isRequired,

	edgeStrokeWidth: PropTypes.number.isRequired,
	edgeStroke: PropTypes.string.isRequired,
	edgeInteractiveCursor: PropTypes.string.isRequired,
	lineInteractiveCursor: PropTypes.string.isRequired,
	edgeFill: PropTypes.string.isRequired,
	hoverText: PropTypes.object.isRequired,
};

EachPitchFork.defaultProps = {
	onDrag: noop,
	onEdgeStartDrag: noop,
	onEdgeSupportDrag: noop,
	onDragComplete: noop,
	onSelect: noop,
	onUnSelect: noop,

	selected: false,

	edgeStroke: "#000000",
	strokeChannels: [{ stroke: "#758696" }],
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

export default EachPitchFork;
