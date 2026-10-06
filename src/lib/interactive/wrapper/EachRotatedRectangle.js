import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddlePointFromArray, isDefined, noop } from "../../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";

import ClickableCircle from "../components/ClickableCircle";
import ClickableCirclePix from "../components/ClickableCirclePix";
import RotateRectangle, { helperPoint } from "../components/RotateRectangle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachRotatedRectangle extends Component {
	constructor(props) {
		super(props);

		this.handleEdgeTopDrag = this.handleEdgeTopDrag.bind(this);
		this.handleEdgeBottomDrag = this.handleEdgeBottomDrag.bind(this);
		this.handleEdgeStartDrag = this.handleEdgeStartDrag.bind(this);
		this.handleEdgeNextDrag = this.handleEdgeNextDrag.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleRectangleDrag = this.handleRectangleDrag.bind(this);

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
		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const {	startXY, nextXY, endXY } = this.props;
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
			if (this.zooming) {
				this.zooming = false;
				const { RT, LT, RB, LB } = helperPoint(startXY, nextXY, endXY, xScale, yScale, xAccessor, fullData);
				onDrag(index, {
					startXY: startXY,
					nextXY: nextXY,
					endXY: endXY,
					RTXY: RT,
					RBXY: RB,
					LTXY: LT,
					LBXY: LB,
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
			startXY, nextXY, RTXY, RBXY, LTXY, LBXY
		} = this.props;

		const endXYNew = RTXY;
		this.dragStart = {
			startXY, nextXY, endXY: endXYNew, RTXY, RBXY, LTXY, LBXY
		};
	}
	handleRectangleDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			startXY, nextXY, endXY,
		} = this.dragStart;
		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const startX = xScale(startXY[0]);
		const startY = yScale(startXY[1]);
		const nextX = xScale(nextXY[0]);
		const nextY = yScale(nextXY[1]);
		const endX = xScale(endXY[0]);
		const endY = yScale(endXY[1]);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newStartXValue = getXValue(xScale, xAccessor, [startX - dx, startY - dy], fullData);
		const newStartYValue = yScale.invert(startY - dy);
		const newNextXValue = getXValue(xScale, xAccessor, [nextX - dx, nextY - dy], fullData);
		const newNextYValue = yScale.invert(nextY - dy);
		const newEndXValue = getXValue(xScale, xAccessor, [endX - dx, endY - dy], fullData);
		const newEndYValue = yScale.invert(endY - dy);
		const { RT, LT, RB, LB } = helperPoint([newStartXValue, newStartYValue], [newNextXValue, newNextYValue], [newEndXValue, newEndYValue],
			xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: [newNextXValue, newNextYValue],
			endXY: [newEndXValue, newEndYValue],
			RTXY: RT,
			RBXY: RB,
			LTXY: LT,
			LBXY: LB,
		});
	}
	handleEdgeStartDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, RTXY
		} = this.dragStart;
		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;

		const endNewXY = RTXY;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];
		const endx = xScale(endNewXY[0]);
		const endy = yScale(endNewXY[1]);
		const startx = xScale(startXY[0]);
		const starty = yScale(startXY[1]);
		const nextx = xScale(nextXY[0]);
		const nexty = yScale(nextXY[1]);

		const newAngleNext = ((startx - dx) !== nextx) ? Math.atan((nexty - starty + dy) / (startx - dx - nextx)) * 180 / Math.PI : 90;
		const newRadius = Math.sqrt((endy - starty + dy) * (endy - starty + dy) + (startx - endx - dx) * (startx - endx - dx));
		const katet = Math.sqrt((endy - nexty) * (endy - nexty) + (endx  - nextx) * (endx - nextx));
		const newAngleEnd = newAngleNext + ((newRadius !== 0) ? Math.atan(katet / newRadius) * 180 / Math.PI : 0);
		const newEndx = (startx - dx)  + newRadius * Math.cos(newAngleEnd * Math.PI / 180);
		const newEndy = (starty  - dy) - newRadius * Math.sin(newAngleEnd * Math.PI / 180);

		const newStartXValue = getXValue(xScale, xAccessor, [startx - dx, starty - dy], fullData);
		const newStartYValue = doMagnetY(moreProps);
		const newEndXValue = getXValue(xScale, xAccessor, [newEndx, newEndy], fullData);
		const newEndYValue = yScale.invert(newEndy);
		const { RT, LT, RB, LB } = helperPoint([newStartXValue, newStartYValue], nextXY, [newEndXValue, newEndYValue],
			xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: nextXY,
			endXY: RT,
			RTXY: RT,
			RBXY: RB,
			LTXY: LT,
			LBXY: LB,
		});
	}
	handleEdgeNextDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, RTXY
		} = this.dragStart;
		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;
		const endNewXY = RTXY;
		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];
		const endx = xScale(endNewXY[0]);
		const endy = yScale(endNewXY[1]);
		const startx = xScale(startXY[0]);
		const starty = yScale(startXY[1]);
		const nextx = xScale(nextXY[0]);
		const nexty = yScale(nextXY[1]);

		const newAngleNext = ((nextx - dx) !== startx) ? Math.atan((starty - nexty + dy) / (nextx - dx - startx)) * 180 / Math.PI : 90;
		const newRadius = Math.sqrt((starty - endy + dy) * (starty - endy + dy) + (endx - startx - dx) * (endx - startx - dx));
		const katet = Math.sqrt((endy - nexty) * (endy - nexty) + (endx  - nextx) * (endx - nextx));
		const newAngleEnd = newAngleNext +  ((newRadius !== 0) ? Math.atan(katet / newRadius) * 180 / Math.PI : 0);
		const newEndx = startx + newRadius * Math.cos(newAngleEnd * Math.PI / 180);
		const newEndy = starty - newRadius * Math.sin(newAngleEnd * Math.PI / 180);

		const newNextXValue = getXValue(xScale, xAccessor, [nextx - dx, nexty - dy], fullData);
		const newNextYValue = doMagnetY(moreProps);
		const newEndXValue = getXValue(xScale, xAccessor, [newEndx, newEndy], fullData);
		const newEndYValue = yScale.invert(newEndy);
		const { RT, LT, RB, LB } = helperPoint(startXY, [newNextXValue, newNextYValue], [newEndXValue, newEndYValue],
			xScale, yScale, xAccessor, fullData);
		onDrag(index, {
			startXY: startXY,
			nextXY: [newNextXValue, newNextYValue],
			endXY: RT,
			RTXY: RT,
			RBXY: RB,
			LTXY: LT,
			LBXY: LB,
		});
	}
	handleEdgeTopDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			endXY
		} = this.dragStart;

		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const endx = xScale(endXY[0]);
		const endy = yScale(endXY[1]);

		const newEndXValue = getXValue(xScale, xAccessor, [endx - dx, endy - dy], fullData);
		const newEndYValue = doMagnetY(moreProps);
		const { RT, LT, RB, LB } = helperPoint(this.dragStart.startXY, this.dragStart.nextXY, [newEndXValue, newEndYValue],
			xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: this.dragStart.startXY,
			nextXY: this.dragStart.nextXY,
			endXY: [newEndXValue, newEndYValue],
			RTXY: RT,
			RBXY: RB,
			LTXY: LT,
			LBXY: LB,
		});
	}
	handleEdgeBottomDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			endXY
		} = this.dragStart;

		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const endx = xScale(endXY[0]);
		const endy = yScale(endXY[1]);

		const newEndXValue = getXValue(xScale, xAccessor, [endx + dx, endy + dy], fullData);
		const newEndYValue = doMagnetY(moreProps);
		const { RT, LT, RB, LB } = helperPoint(this.dragStart.startXY, this.dragStart.nextXY, [newEndXValue, newEndYValue],
			xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: this.dragStart.startXY,
			nextXY: this.dragStart.nextXY,
			endXY: [newEndXValue, newEndYValue],
			RTXY: RT,
			RBXY: RB,
			LTXY: LT,
			LBXY: LB,
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
	getEdgeCirclePix({ xy, dragHandler, cursor, fill, edge }) {

		const { hover } = this.state;
		const { appearance } = this.props;
		const { edgeStroke, edgeStrokeWidth, r } = appearance;
		const { selected } = this.props;
		const { onDragComplete } = this.props;

		return <ClickableCirclePix
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
			onDragComplete={onDragComplete} />;
	}
	onZoomPanCallBack() {
		this.zooming = true;
	}

	render() {
		const { startXY, nextXY, endXY, RTXY, RBXY, LTXY, LBXY } = this.props;
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
		const edgeRT = isDefined(RTXY)
			? <g>
				{this.getEdgeCircle({
					xy: RTXY,
					dragHandler: this.handleEdgeTopDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeRB",
				})}
			</g>
			: null;

		const edgeRB = isDefined(RBXY)
			? <g>
				{this.getEdgeCircle({
					xy: RBXY,
					dragHandler: this.handleEdgeBottomDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeLB",
				})}
			</g>
			: null;
		const edgeLT = isDefined(LTXY)
			? <g>
				{this.getEdgeCircle({
					xy: LTXY,
					dragHandler: this.handleEdgeTopDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeLT",
				})}
			</g>
			: null;
		const edgeLB = isDefined(LBXY)  && (selected || hover)
			? <g>
				{this.getEdgeCircle({
					xy: LBXY,
					dragHandler: this.handleEdgeBottomDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeLB",
				})}
			</g>
			: null;
		const middlePoint = isDefined(RTXY) && isDefined(RBXY) && isDefined(LTXY) && isDefined(LBXY) && (selected || hover)
			? <g>
				{this.getEdgeCircle({
					xy: calcMiddlePointFromArray(RTXY, RBXY, LTXY, LBXY),
					dragHandler: this.handleRectangleDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeMD",
					middlePoint: true
				})}
			</g>
			: null;
		return <g>
			<RotateRectangle
				ref={this.saveNodeType("rectangle")}
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
				onDrag={this.handleRectangleDrag}
				onDragComplete={onDragComplete}
			/>
			{edgeStart}
			{edgeNext}
			{edgeRT}
			{edgeRB}
			{edgeLT}
			{edgeLB}
			{middlePoint}
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

EachRotatedRectangle.propTypes = {
	startXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	nextXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	endXY: PropTypes.arrayOf(PropTypes.number),
	RTXY: PropTypes.arrayOf(PropTypes.number),
	RBXY: PropTypes.arrayOf(PropTypes.number),
	LTXY: PropTypes.arrayOf(PropTypes.number),
	LBXY: PropTypes.arrayOf(PropTypes.number),

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

EachRotatedRectangle.defaultProps = {
	yDisplayFormat: d => d.toFixed(2),
	interactive: true,
	selected: false,

	onDrag: noop,
	onDragComplete: noop,
	hoverText: {
		enable: false,
	}
};

export default EachRotatedRectangle;
