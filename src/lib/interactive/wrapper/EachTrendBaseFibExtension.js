import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddlePointFromArray, isDefined, isNotDefined, noop } from "../../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";

import ClickableCircle from "../components/ClickableCircle";
import FibChannelWithArea from "../components/FibChannelWithArea";
import HoverTextNearMouse from "../components/HoverTextNearMouse";
import StraightLine from "../components/StraightLine";
import Text from "../components/Text";

class EachTrendBaseFibExtension extends Component {
	constructor(props) {
		super(props);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);
		this.handleEdge3Drag = this.handleEdge3Drag.bind(this);

		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleChannelDrag = this.handleChannelDrag.bind(this);

		this.getEdgeCircle = this.getEdgeCircle.bind(this);
		this.handleHover = this.handleHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		this.state = {
			hover: false,
		};
	}
	handleHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
		}
	}
	handleDragStart() {
		const {
			startXY, nextXY, endXY,
		} = this.props;

		this.dragStart = {
			startXY, nextXY, endXY,
		};
	}
	handleChannelDrag(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			startXY, nextXY, endXY,
		} = this.dragStart;
		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const x1 = xScale(startXY[0]);
		const y1 = yScale(startXY[1]);
		const x2 = xScale(nextXY[0]);
		const y2 = yScale(nextXY[1]);
		const x3 = xScale(endXY[0]);
		const y3 = yScale(endXY[1]);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = yScale.invert(y1 - dy);
		const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
		const newY2Value = yScale.invert(y2 - dy);
		const newX3Value = getXValue(xScale, xAccessor, [x3 - dx, y3 - dy], fullData);
		const newY3Value = yScale.invert(y3 - dy);

		onDrag(index, {
			startXY: [newX1Value, newY1Value],
			nextXY: [newX2Value, newY2Value],
			endXY: [newX3Value, newY3Value],
		});
	}
	handleEdge1Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			startXY,
		} = this.dragStart;

		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const x1 = xScale(startXY[0]);
		const y1 = yScale(startXY[1]);

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = doMagnetY(moreProps);

		onDrag(index, {
			startXY: [newX1Value, newY1Value],
			nextXY: this.dragStart.nextXY,
			endXY: this.dragStart.endXY,
		});
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			nextXY,
		} = this.dragStart;

		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const x1 = xScale(nextXY[0]);
		const y1 = yScale(nextXY[1]);

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = doMagnetY(moreProps);

		onDrag(index, {
			startXY: this.dragStart.startXY,
			nextXY: [newX1Value, newY1Value],
			endXY: this.dragStart.endXY,
		});
	}

	handleEdge3Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			endXY,
		} = this.dragStart;

		const {
			startPos, mouseXY, xAccessor,
			xScale, fullData,
			chartConfig: { yScale }
		} = moreProps;

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const x1 = xScale(endXY[0]);
		const y1 = yScale(endXY[1]);

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = doMagnetY(moreProps);

		onDrag(index, {
			startXY: this.dragStart.startXY,
			nextXY: this.dragStart.nextXY,
			endXY: [newX1Value, newY1Value],
		});
	}
	getEdgeCircle({ xy, dragHandler, cursor, fill, edge, middlePoint }) {
		const { hover } = this.state;
		const { appearance, interactive } = this.props;
		const { edgeStroke, edgeStrokeWidth, r } = appearance;
		const { selected } = this.props;
		const { onDragComplete } = this.props;

		return <ClickableCircle
			ref={this.saveNodeType(edge)}

			show={selected || (isTouchDevice() ? false : hover) || !interactive}
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
	render() {
		const { startXY, nextXY, endXY } = this.props;
		const { interactive, yDisplayFormat, hoverText, appearance } = this.props;
		const { fontFamily, fontSize, isTrend, strokeTrend, strokeTrendWidth, strokeTrendDasharray } = appearance;
		const {
			edgeFill,
			strokeWidth, strokeOpacity,
			fillOpacity, strokeDasharray
		} = appearance;
		const { selected } = this.props;
		const { onDragComplete } = this.props;
		const { hover } = this.state;
		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleHover }
			: {};
		const line1 = isTrend
			? <StraightLine
				ref={this.saveNodeType("line1")}
				selected={selected || (isTouchDevice() ? false : hover)}
				{...hoverHandler}
				type={"LINE"}
				x1Value={startXY[0]}
				y1Value={startXY[1]}
				x2Value={nextXY[0]}
				y2Value={nextXY[1]}
				stroke={strokeTrend}
				strokeWidth={strokeTrendWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeTrendDasharray}
				interactiveCursorClass={"react-stockcharts-move-cursor"}
				onDragStart={this.handleDragStart}
				onDrag={this.handleChannelDrag}
				onDragComplete={onDragComplete}
			/>
			: null;
		const line2 = isDefined(nextXY) && isDefined(endXY) && isTrend
			? <StraightLine
				ref={this.saveNodeType("line2")}
				selected={selected || (isTouchDevice() ? false : hover)}
				{...hoverHandler}
				type={"LINE"}
				x1Value={nextXY[0]}
				y1Value={nextXY[1]}
				x2Value={endXY[0]}
				y2Value={endXY[1]}
				stroke={strokeTrend}
				strokeWidth={strokeTrendWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeTrendDasharray}
				interactiveCursorClass={"react-stockcharts-move-cursor"}
				onDragStart={this.handleDragStart}
				onDrag={this.handleChannelDrag}
				onDragComplete={onDragComplete}
			/>
			: null;
		const edge1 = isDefined(startXY)
			? <g>
				{this.getEdgeCircle({
					xy: startXY,
					dragHandler: this.handleEdge1Drag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edge1",
				})}
			</g>
			: null;
		const edge2 = isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)
			? <g>
				{this.getEdgeCircle({
					xy: nextXY,
					dragHandler: this.handleEdge2Drag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edge2",
				})}
			</g>
			: null;
		const edge3 = (interactive)
			? <g>
				{this.getEdgeCircle({
					xy: endXY,
					dragHandler: this.handleEdge3Drag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "edge3",
				})}
			</g>
			: null;
		const middlePoint = isDefined(startXY) && isDefined(nextXY) && isDefined(endXY)
			? <g>
				{this.getEdgeCircle({
					xy: calcMiddlePointFromArray(startXY, nextXY, endXY),
					dragHandler: this.handleChannelDrag,
					cursor: "react-stockcharts-move-cursor",
					fill: edgeFill,
					edge: "middlePoint",
					middlePoint: true
				})}
			</g>
			: null;
		const channels = helper(appearance.channels.filter(each => each.isStroke), { startXY, nextXY, endXY });
		return <g>
			{channels.map((channel, j) => {
				const text = `${(channel.value / 100).toFixed(3)} (${yDisplayFormat(channel.startXY[1])})`;
				const xyProvider = ({ xScale, chartConfig }) => {
					const { yScale } = chartConfig;

					const x = xScale(channel.endXY[0]) - 90;
					const y = yScale(channel.endXY[1]) + 2;
					return [x, y];
				};
				return <g key={j}>
					<FibChannelWithArea
						ref={this.saveNodeType(`channel_${j}`)}
						selected={selected || (isTouchDevice() ? false : hover)}

						{...hoverHandler}

						startXY={channel.startXY}
						nextXY={channel.nextXY}
						endXY={channel.endXY}
						stroke={channel.stroke}
						strokePrev={channel.strokePrev}
						strokeWidth={strokeWidth}
						strokeOpacity={strokeOpacity}
						fill={channel.strokePrev}
						fillOpacity={fillOpacity}
						strokeDasharray={strokeDasharray}
						interactiveCursorClass="react-stockcharts-move-cursor"

						onDragStart={this.handleDragStart}
						onDrag={this.handleChannelDrag}
						onDragComplete={onDragComplete}
					/>
					<Text
						selected={selected}
						/* eslint-disable */
						xyProvider={xyProvider}
						/* eslint-enable */
						fontFamily={fontFamily}
						fontSize={fontSize}
						fill={channel.stroke}>{text}
					</Text>
				</g>;
			})}
			{line1}
			{line2}
			{edge1}
			{edge2}
			{edge3}
			{middlePoint}
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

function helper( channels, { startXY, nextXY, endXY }) {
	if (isNotDefined(startXY) || isNotDefined(nextXY) || isNotDefined(endXY)) {
		return [];
	}
	const dy = nextXY[1] - startXY[1];
	const newChannels = channels.map((each, index, array) => ({
		startXY: index ? [nextXY[0], (isDefined(endXY) ? endXY[1] : nextXY[1]) + dy * array[index - 1].seq] : [nextXY[0], isDefined(endXY) ? endXY[1] : nextXY[1]],
		nextXY: index ? [isDefined(endXY) ? endXY[0] : nextXY[0], (isDefined(endXY) ? endXY[1] : nextXY[1]) + dy * array[index - 1].seq] : [isDefined(endXY) ? endXY[0] : nextXY[0], isDefined(endXY) ? endXY[1] : nextXY[1]],
		endXY: [nextXY[0], (isDefined(endXY) ? endXY[1] : nextXY[1]) + dy * each.seq],
		value: each.seq,
		stroke: each.stroke,
		strokePrev: isDefined(array[index - 1]) ? array[index - 1].stroke : array[index].stroke,
	}));
	return newChannels;
}

EachTrendBaseFibExtension.propTypes = {
	startXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	nextXY: PropTypes.arrayOf(PropTypes.number).isRequired,
	endXY: PropTypes.arrayOf(PropTypes.number),
	yDisplayFormat: PropTypes.any,

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
		fontFamily: PropTypes.any,
		fontSize: PropTypes.any,
		isTrend: PropTypes.any,
		strokeTrend: PropTypes.any,
		strokeTrendWidth: PropTypes.any,
		strokeTrendDasharray: PropTypes.any,
		strokeDasharray: PropTypes.any,
		channels: PropTypes.any,
	}).isRequired,

	index: PropTypes.number,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
};

EachTrendBaseFibExtension.defaultProps = {
	yDisplayFormat: d => d.toFixed(5),
	interactive: true,
	selected: false,

	onDrag: noop,
	onDragComplete: noop,
	hoverText: {
		enable: false,
	}
};

export default EachTrendBaseFibExtension;
