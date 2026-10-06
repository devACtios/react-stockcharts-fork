import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddlePointFromArray, isDefined, noop } from "../../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";

import ClickableCircle from "../components/ClickableCircle";
import ClickableCirclePix from "../components/ClickableCirclePix";
import ClickableEllipse, { helperPoint } from "../components/ClickableEllipse";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachRotatedEllipse extends Component {
	constructor(props) {
		super(props);

		this.handleEdgeTopDrag = this.handleEdgeTopDrag.bind(this);
		this.handleEdgeBottomDrag = this.handleEdgeBottomDrag.bind(this);
		this.handleEdgeStartDrag = this.handleEdgeStartDrag.bind(this);
		this.handleEdgeNextDrag = this.handleEdgeNextDrag.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleEllipseDrag = this.handleEllipseDrag.bind(this);

		this.getEdgeCircle = this.getEdgeCircle.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleUnHover = this.handleUnHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.onZoomPanCallBack = this.onZoomPanCallBack.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
			draw: true,
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
				const { top, bottom } = helperPoint(startXY, nextXY, endXY, xScale, yScale, xAccessor, fullData);

				onDrag(index, {
					startXY: startXY,
					nextXY: nextXY,
					endXY: endXY,
					topXY: top,
					bottomXY: bottom,
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
	handleDragStart() {
		const {
			startXY, nextXY, topXY, bottomXY, endXY
		} = this.props;

		this.dragStart = {
			startXY, nextXY, endXY, topXY, bottomXY
		};
	}
	handleEllipseDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			startXY, nextXY, topXY
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
		const endX = xScale(topXY[0]);
		const endY = yScale(topXY[1]);

		const newStartXValue = getXValue(xScale, xAccessor, [startX - dx, startY - dy], fullData);
		const newStartYValue = yScale.invert(startY - dy);
		const newNextXValue = getXValue(xScale, xAccessor, [nextX - dx, nextY - dy], fullData);
		const newNextYValue = yScale.invert(nextY - dy);
		const newEndXValue = getXValue(xScale, xAccessor, [endX - dx, endY - dy], fullData);
		const newEndYValue = yScale.invert(endY - dy);
		const { top, bottom } = helperPoint([newStartXValue, newStartYValue], [newNextXValue, newNextYValue], [newEndXValue, newEndYValue], xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: [newNextXValue, newNextYValue],
			endXY: [newEndXValue, newEndYValue],
			topXY: top,
			bottomXY: bottom,
		});
	}
	handleEdgeStartDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, topXY
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
		const endx = xScale(topXY[0]);
		const endy = yScale(topXY[1]);
		const startx = xScale(startXY[0]);
		const starty = yScale(startXY[1]);
		const nextx = xScale(nextXY[0]);
		const nexty = yScale(nextXY[1]);

		const centerx =  (startx + nextx) / 2;
		const centery =  (starty + nexty) / 2;
		const smallAxis = Math.sqrt((endy - centery) * (endy - centery) + (endx - centerx) * (endx - centerx));
		const newCenterx =  (startx + nextx - dx) / 2;
		const newCentery =  (starty + nexty - dy) / 2;
		const newAngle = ((nextx - dx) !== startx) ? Math.atan((starty - nexty - dy) / (startx - nextx - dx)) : Math.PI / 2;
		const newEndx = newCenterx + smallAxis * Math.sin(newAngle);
		const newEndy = newCentery - smallAxis * Math.cos(newAngle);

		const newStartXValue = getXValue(xScale, xAccessor, [startx - dx, starty - dy], fullData);
		const newStartYValue = yScale.invert(starty - dy);
		const newEndXValue = getXValue(xScale, xAccessor, [newEndx, newEndy], fullData);
		const newEndYValue = yScale.invert(newEndy);
		const { top, bottom } = helperPoint([newStartXValue, newStartYValue], nextXY, [newEndXValue, newEndYValue], xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: nextXY,
			endXY: [newEndXValue, newEndYValue],
			topXY: top,
			bottomXY: bottom,
		});
	}
	handleEdgeNextDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY, nextXY, topXY
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
		const endx = xScale(topXY[0]);
		const endy = yScale(topXY[1]);
		const startx = xScale(startXY[0]);
		const starty = yScale(startXY[1]);
		const nextx = xScale(nextXY[0]);
		const nexty = yScale(nextXY[1]);

		const centerx =  (startx + nextx) / 2;
		const centery =  (starty + nexty) / 2;
		const smallAxis = Math.sqrt((endy - centery) * (endy - centery) + (endx - centerx) * (endx - centerx));
		const newCenterx =  (startx + nextx - dx) / 2;
		const newCentery =  (starty + nexty - dy) / 2;
		const newAngle = ((nextx - dx) !== startx) ? Math.atan((nexty - starty - dy) / (nextx - startx - dx)) : Math.PI / 2;
		const newEndx = newCenterx + smallAxis * Math.sin(newAngle);
		const newEndy = newCentery - smallAxis * Math.cos(newAngle);
		const newNextXValue = getXValue(xScale, xAccessor, [nextx - dx, nexty - dy], fullData);
		const newNextYValue = yScale.invert(nexty - dy);
		const newEndXValue = getXValue(xScale, xAccessor, [newEndx, newEndy], fullData);
		const newEndYValue = yScale.invert(newEndy);
		const { top, bottom } = helperPoint(startXY, [newNextXValue, newNextYValue], [newEndXValue, newEndYValue], xScale, yScale, xAccessor, fullData);

		onDrag(index, {
			startXY: startXY,
			nextXY: [newNextXValue, newNextYValue],
			endXY: [newEndXValue, newEndYValue],
			topXY: top,
			bottomXY: bottom,
		});
	}
	handleEdgeTopDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			bottomXY, topXY, startXY, nextXY
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
		const bottomx = xScale(bottomXY[0]);
		const bottomy = yScale(bottomXY[1]);
		const topx = xScale(topXY[0]);
		const topy = yScale(topXY[1]);
		const startx = xScale(startXY[0]);
		const starty = yScale(startXY[1]);
		const nextx = xScale(nextXY[0]);
		const nexty = yScale(nextXY[1]);
		const newTopx = topx - dx;
		const newTopy = topy - dy;
		const bigAxis = Math.sqrt((nexty - starty) * (nexty - starty) + (nextx - startx) * (nextx - startx)) / 2;
		const newCenterx =  (bottomx + topx - dx) / 2;
		const newCentery =  (bottomy + topy - dy) / 2;
		const newAngle = ((topy - dy) !== bottomy) ? Math.atan((topx - bottomx - dx) / (topy - bottomy - dy)) : Math.PI / 2;

		const newStartx = newCenterx - bigAxis * Math.cos(newAngle);
		const newStarty = newCentery + bigAxis * Math.sin(newAngle);
		const newNextx = newCenterx + bigAxis * Math.cos(newAngle);
		const newNexty = newCentery - bigAxis * Math.sin(newAngle);

		const newStartXValue = getXValue(xScale, xAccessor, [newStartx, newStarty], fullData);
		const newStartYValue = yScale.invert(newStarty);
		const newNextXValue = getXValue(xScale, xAccessor, [newNextx, newNexty], fullData);
		const newNextYValue = yScale.invert(newNexty);
		const newEndXValue = getXValue(xScale, xAccessor, [newTopx, newTopy], fullData);
		const newEndYValue = yScale.invert(newTopy);
		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: [newNextXValue, newNextYValue],
			endXY: [newEndXValue, newEndYValue],
			topXY: [newEndXValue, newEndYValue],
			bottomXY: bottomXY,
		});
	}
	handleEdgeBottomDrag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			bottomXY, topXY, startXY, nextXY
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
		const bottomx = xScale(bottomXY[0]);
		const bottomy = yScale(bottomXY[1]);
		const topx = xScale(topXY[0]);
		const topy = yScale(topXY[1]);
		const startx = xScale(startXY[0]);
		const starty = yScale(startXY[1]);
		const nextx = xScale(nextXY[0]);
		const nexty = yScale(nextXY[1]);

		const newBottomx = bottomx - dx;
		const newBottomy = bottomy - dy;
		const bigAxis = Math.sqrt((nexty - starty) * (nexty - starty) + (nextx - startx) * (nextx - startx)) / 2;
		const newCenterx =  (bottomx + topx - dx) / 2;
		const newCentery =  (bottomy + topy - dy) / 2;
		const newAngle = ((bottomy - dy) !== topy) ? Math.atan((bottomx - topx - dx) / (bottomy - topy - dy)) : Math.PI / 2;
		const newStartx = newCenterx + bigAxis * Math.cos(newAngle);
		const newStarty = newCentery - bigAxis * Math.sin(newAngle);
		const newNextx = newCenterx - bigAxis * Math.cos(newAngle);
		const newNexty = newCentery + bigAxis * Math.sin(newAngle);

		const newStartXValue = getXValue(xScale, xAccessor, [newStartx, newStarty], fullData);
		const newStartYValue = yScale.invert(newStarty);
		const newNextXValue = getXValue(xScale, xAccessor, [newNextx, newNexty], fullData);
		const newNextYValue = yScale.invert(newNexty);
		const newEndXValue = getXValue(xScale, xAccessor, [newBottomx, newBottomy], fullData);
		const newEndYValue = yScale.invert(newBottomy);

		onDrag(index, {
			startXY: [newStartXValue, newStartYValue],
			nextXY: [newNextXValue, newNextYValue],
			endXY: [newEndXValue, newEndYValue],
			topXY: topXY,
			bottomXY: [newEndXValue, newEndYValue],
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
		const { startXY, nextXY, endXY, topXY, bottomXY } = this.props;
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
		const edgeTop = isDefined(topXY)
			? <g>
				{this.getEdgeCircle({
					xy: topXY,
					dragHandler: this.handleEdgeTopDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeTop",
				})}
			</g>
			: null;
		const edgeBottom = isDefined(bottomXY)
			? <g>
				{this.getEdgeCircle({
					xy: bottomXY,
					dragHandler: this.handleEdgeBottomDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edgeBottom",
				})}
			</g>
			: null;
		const middlePoint = isDefined(topXY) && isDefined(bottomXY)
			? <g>
				{this.getEdgeCircle({
					xy: calcMiddlePointFromArray(topXY, bottomXY),
					dragHandler: this.handleEllipseDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "middlePoint",
					middlePoint: true
				})}
			</g>
			: null;
		return <g>
			<ClickableEllipse
				ref={this.saveNodeType("ellipse")}
				selected={selected || (isTouchDevice() ? false : hover)}

				{...hoverHandler}

				startXY={startXY}
				nextXY={nextXY}
				endXY={endXY}
				topXY={topXY}
				bottomXY={bottomXY}
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
				onDrag={this.handleEllipseDrag}
				onDragComplete={onDragComplete}
			/>
			{edgeStart}
			{edgeNext}
			{edgeTop}
			{edgeBottom}
			{middlePoint}
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

EachRotatedEllipse.propTypes = {
	startXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	nextXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	endXY: PropTypes.arrayOf(PropTypes.number),
	topXY: PropTypes.arrayOf(PropTypes.number),
	bottomXY: PropTypes.arrayOf(PropTypes.number),

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

EachRotatedEllipse.defaultProps = {
	yDisplayFormat: d => d.toFixed(2),
	interactive: true,
	selected: false,

	onDrag: noop,
	onDragComplete: noop,
	hoverText: {
		enable: false,
	}
};

export default EachRotatedEllipse;
