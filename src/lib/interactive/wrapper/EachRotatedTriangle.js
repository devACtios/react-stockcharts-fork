import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddlePointFromArray, isDefined, noop } from "../../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";

import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";
import ClickableTriangle from "../components/ClickableTriangle";

class EachRotatedTriangle extends Component {
	constructor(props) {
		super(props);

		this.handleEdgeStartDrag = this.handleEdgeStartDrag.bind(this);
		this.handleEdgeNextDrag = this.handleEdgeNextDrag.bind(this);
		this.handleEdgeEndDrag = this.handleEdgeEndDrag.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleTriangleDrag = this.handleTriangleDrag.bind(this);

		this.getEdgeCircle = this.getEdgeCircle.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleUnHover = this.handleUnHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.onZoomPanCallBack = this.onZoomPanCallBack.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
		};

		this.zooming = false;
	}
	handleHover(moreProps) {
		const { index, onDrag } = this.props;
		const {	startXY, nextXY, endXY } = this.props;
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
			if (this.zooming) {
				this.zooming = false;
				onDrag(index, {
					startXY: startXY,
					nextXY: nextXY,
					endXY: endXY,
				});
			}
		}
	}
	handleUnHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
		}
	}
	handleDragStart() {
		const {
			startXY, nextXY, endXY
		} = this.props;

		this.dragStart = {
			startXY, nextXY, endXY
		};
	}
	handleTriangleDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			startXY, nextXY, endXY,
		} = this.dragStart;
		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];
		if ((Math.abs(dx) < 1) && (Math.abs(dy)) < 1) {
			return;
		}

		const startX = xScale(startXY[0]);
		const startY = yScale(startXY[1]);
		const nextX = xScale(nextXY[0]);
		const nextY = yScale(nextXY[1]);
		const endX = xScale(endXY[0]);
		const endY = yScale(endXY[1]);

		const newStartXValue = getXValue(xScale, xAccessor, [startX - dx, startY - dy], fullData);
		const newStartYValue = yScale.invert(startY - dy);
		const newNextXValue = getXValue(xScale, xAccessor, [nextX - dx, nextY - dy], fullData);
		const newNextYValue = yScale.invert(nextY - dy);
		const newEndXValue = getXValue(xScale, xAccessor, [endX - dx, endY - dy], fullData);
		const newEndYValue = yScale.invert(endY - dy);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: [newNextXValue, newNextYValue],
			endXY: [newEndXValue, newEndYValue],
		});
	}
	handleEdgeStartDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, endXY
		} = this.dragStart;
		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - yScale(doMagnetY(moreProps));
		if ((Math.abs(dx) < 1) && (Math.abs(dy)) < 1) {
			return;
		}
		const startX = xScale(startXY[0]);
		const startY = yScale(startXY[1]);
		const newStartXValue = getXValue(xScale, xAccessor, [startX - dx, startY - dy], fullData);
		const newStartYValue = yScale.invert(startY - dy);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: nextXY,
			endXY: endXY,
		});
	}
	handleEdgeNextDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, endXY
		} = this.dragStart;
		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - yScale(doMagnetY(moreProps));
		if ((Math.abs(dx) < 1) && (Math.abs(dy)) < 1) {
			return;
		}
		const nextX = xScale(nextXY[0]);
		const nextY = yScale(nextXY[1]);
		const newNextXValue = getXValue(xScale, xAccessor, [nextX - dx, nextY - dy], fullData);
		const newNextYValue = yScale.invert(nextY - dy);
		onDrag(index, {
			startXY: startXY,
			nextXY: [newNextXValue, newNextYValue],
			endXY: endXY,
		});
	}
	handleEdgeEndDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, endXY
		} = this.dragStart;
		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - yScale(doMagnetY(moreProps));
		if ((Math.abs(dx) < 1) && (Math.abs(dy)) < 1) {
			return;
		}
		const endX = xScale(endXY[0]);
		const endY = yScale(endXY[1]);
		const newEndXValue = getXValue(xScale, xAccessor, [endX - dx, endY - dy], fullData);
		const newEndYValue = yScale.invert(endY - dy);
		onDrag(index, {
			startXY: startXY,
			nextXY: nextXY,
			endXY: [newEndXValue, newEndYValue],
		});
	}
	getEdgeCircle({ xy, dragHandler, cursor, fill, edge, middlePoint }) {

		const { hover } = this.state;
		const { appearance } = this.props;
		const { edgeStroke, edgeStrokeWidth, r } = appearance;
		const { selected } = this.props;
		const { onDragComplete } = this.props;

		return <ClickableCircle
			ref={this.saveNodeType(edge)}

			show={(selected || hover) && (this.zooming === false)}
			cx={xy[0]}
			cy={xy[1]}
			r={r}
			fill={fill}
			stroke={edgeStroke}
			strokeWidth={edgeStrokeWidth}
			interactiveCursorClass={cursor}

			onDragStart={this.handleDragStart}
			onDrag={dragHandler}
			onDragComplete={onDragComplete}
			middlePoint={middlePoint}/>;
	}
	onZoomPanCallBack() {
		this.zooming = true;
	}

	render() {
		const { startXY, nextXY, endXY } = this.props;
		const { interactive, hoverText, appearance } = this.props;
		const {
			edgeFill,
			stroke, strokeWidth, strokeOpacity, strokeDasharray,
			fill, fillOpacity, isFill,
		} = appearance;
		const { selected } = this.props;
		const { onDragComplete } = this.props;
		const { hover } = this.state;
		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleUnHover }
			: {};
		const edgeStart = isDefined(startXY)
			? <g>
				{this.getEdgeCircle({
					xy: startXY,
					dragHandler: this.handleEdgeStartDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeStart",
				})}
			</g>
			: null;
		const edgeNext = isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)
			? <g>
				{this.getEdgeCircle({
					xy: nextXY,
					dragHandler: this.handleEdgeNextDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeNext",
				})}
			</g>
			: null;
		const edgeEnd = isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)
			? <g>
				{this.getEdgeCircle({
					xy: endXY,
					dragHandler: this.handleEdgeEndDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeEnd",
				})}
			</g>
			: null;
		const middlePoint = isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)
			? <g>
				{this.getEdgeCircle({
					xy: calcMiddlePointFromArray(startXY, nextXY, endXY),
					dragHandler: this.handleTriangleDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "middlePoint",
					middlePoint: true
				})}
			</g>
			: null;
		return <g>
			<ClickableTriangle
				ref={this.saveNodeType("triangle")}
				selected={selected || (isTouchDevice() ? false : hover)}

				{...hoverHandler}

				startXY={startXY}
				nextXY={nextXY}
				endXY={endXY}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}
				isFill={isFill}
				fill={fill}
				fillOpacity={fillOpacity}
				interactiveCursorClass="react-stockcharts-move-cursor"
				onZoomPanCallBack={this.onZoomPanCallBack}

				onDragStart={this.handleDragStart}
				onDrag={this.handleTriangleDrag}
				onDragComplete={onDragComplete}
			/>
			{edgeStart}
			{edgeNext}
			{edgeEnd}
			{middlePoint}
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

EachRotatedTriangle.propTypes = {
	startXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	nextXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	endXY: PropTypes.arrayOf(PropTypes.number),

	interactive: PropTypes.bool.isRequired,
	selected: PropTypes.bool.isRequired,
	hoverText: PropTypes.object.isRequired,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		fillOpacity: PropTypes.number.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
		edgeStroke: PropTypes.string.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeStrokeWidth: PropTypes.number.isRequired,
		r: PropTypes.number.isRequired,
		strokeDasharray: PropTypes.any,
		isFill: PropTypes.any,
	}).isRequired,

	index: PropTypes.number,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
};

EachRotatedTriangle.defaultProps = {
	yDisplayFormat: d => d.toFixed(2),
	interactive: true,
	selected: false,

	onDrag: noop,
	onDragComplete: noop,
	hoverText: {
		enable: false,
	}
};

export default EachRotatedTriangle;
