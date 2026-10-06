import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop, calcMiddleValue } from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { timeFormat } from "d3-time-format";
import { getNewXY } from "./EachTrendLine";
import StraightLine from "../components/StraightLine";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";
import Text from "../components/Text";

class EachFibTimeZone extends Component {
	constructor(props) {
		super(props);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

		this.handleLineMove = this.handleLineMove.bind(this);

		this.handleLineDragStart = this.handleLineDragStart.bind(this);

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
	handleLineDragStart() {

		const {
			x1, y1, x2, y2,
		} = this.props;

		this.dragStart = {
			x1, y1, x2, y2,
		};
	}
	handleLineMove(moreProps) {
		const { index, onDrag, selected } = this.props;
		if (!selected) {
			return false;
		}

		const {
			x1: x1Value, y1: y1Value, x2: x2Value, y2: y2Value,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const x1 = xScale(x1Value);
		const y1 = yScale(y1Value);
		const x2 = xScale(x2Value);
		const y2 = yScale(y2Value);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - mouseXY[1];

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = yScale.invert(y1 - dy);
		const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
		const newY2Value = yScale.invert(y2 - dy);

		onDrag(moreProps, index, {
			x1: newX1Value,
			y1: newY1Value,
			x2: newX2Value,
			y2: newY2Value,
		});
	}
	handleEdge1Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x2, y2,
		} = this.props;

		const [x1, y1] = getNewXY(moreProps);

		onDrag(moreProps, index, {
			x1,
			y1,
			x2,
			y2,
		});
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x1, y1,
		} = this.props;

		const [x2, y2] = getNewXY(moreProps);

		onDrag(moreProps, index, {
			x1,
			y1,
			x2,
			y2,
		});
	}
	render() {
		const { x1, x2, y1, y2 } = this.props;
		const { xScale } = this.props;
		const { interactive, appearance } = this.props;
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, strokeZone, strokeZoneWidth, strokeZoneDasharray } = appearance;
		const { fontFamily, fontSize, fontFill } = appearance;
		const { edgeStroke, edgeFill, edgeStrokeWidth, r } = appearance;
		const { hoverText, selected } = this.props;
		const { hover } = this.state;
		const { onDragComplete } = this.props;
		const lines = helper({ x1, x2, y1, y2 }, xScale);
		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		const lineType = "XLINE";
		const interactiveCursorClass = "react-stockcharts-move-cursor";
		const interactiveEdgeCursorClass = "react-stockcharts-move-cursor";
		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleHover }
			: {};
		return <g>
			{lines.map((line, j) => {
				const text = `${line.seq}`;

				const xyProvider = ({ xScale, chartConfig }) => {
					const { yScale } = chartConfig;
					// eslint-disable-next-line no-unused-vars
					const [yBegin, yFinish] = yScale.domain();
					const x = xScale(line.x) + 4;
					const y = yScale(yFinish) + 8;
					return [x, y];
				};
				return <g key={j}>
					<StraightLine
						ref={this.saveNodeType(`line_${j}`)}
						selected={selected || (isTouchDevice() ? false : hover)}

						{...hoverHandler}

						type={lineType}
						x1Value={line.x}
						y1Value={line.y1}
						x2Value={line.x}
						y2Value={line.y2}
						stroke={(j === 0) ? stroke : strokeZone}
						strokeWidth={(j === 0) ? strokeWidth : strokeZoneWidth}
						strokeDasharray={(j === 0) ? strokeDasharray : strokeZoneDasharray}
						strokeOpacity={strokeOpacity}
						interactiveCursorClass={interactiveCursorClass}

						onDragStart={this.handleLineDragStart}
						onDrag={this.handleLineMove}
						onDragComplete={onDragComplete}
					/>
					<Text
						selected={selected}
						/* eslint-disable */
						xyProvider={xyProvider}
						/* eslint-enable */
						fontFamily={fontFamily}
						fontSize={fontSize}
						fill={fontFill}>{text}</Text>
					<HoverTextNearMouse
						show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
						{...restHoverTextProps} />
				</g>;
			})}
			<StraightLine
				ref={this.saveNodeType("line")}
				selected={selected || (isTouchDevice() ? false : hover)}
				{...hoverHandler}
				type={"LINE"}
				x1Value={x1}
				y1Value={y1}
				x2Value={x2}
				y2Value={y2}
				stroke={"#000"}
				strokeWidth={1}
				strokeOpacity={strokeOpacity}
				strokeDasharray={"ShortDash3"}
				interactiveCursorClass={interactiveEdgeCursorClass}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineMove}
				onDragComplete={onDragComplete}
			/>
			<ClickableCircle
				ref={this.saveNodeType("edge1")}
				show={(selected || (isTouchDevice() ? false : hover))}
				cx={x1}
				cy={y1}
				r={r}
				fill={edgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				interactiveCursorClass={interactiveEdgeCursorClass}
				onDrag={this.handleEdge1Drag}
				onDragComplete={onDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("edge2")}
				show={(selected || (isTouchDevice() ? false : hover))}
				cx={x2}
				cy={y2}
				r={r}
				fill={edgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				interactiveCursorClass={interactiveEdgeCursorClass}
				onDrag={this.handleEdge2Drag}
				onDragComplete={onDragComplete} />
			<ClickableCircle
				ref={this.saveNodeType("middlePoint")}
				show={(selected || (isTouchDevice() ? false : hover))}
				cx={calcMiddleValue(x1, x2)}
				cy={calcMiddleValue(y1, y2)}
				r={r}
				fill={edgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				interactiveCursorClass={interactiveCursorClass}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineMove}
				onDragComplete={onDragComplete}
				middlePoint/>
		</g>;
	}
}


function helper({ x1, y1, x2, y2 }) {
	if (x2 === x1) {
		return [{ y1, y2, x: x1, seq: 0 }, { y1, y2, x: x2, seq: 1 }];
	}
	const dx = x2 - x1;
	const fib = [0, 1];
	let i = 0;
	let curX = x1;
	const timeZones = [{ y1, y2, x: x1, seq: 0 }];
	do {
		// eslint-disable-next-line const-immutable/no-mutation
		fib[i + 2] = fib[i + 1] + fib[i];
		curX = x1 + (fib[i + 2]) * dx;
		// eslint-disable-next-line const-immutable/no-mutation
		timeZones[i + 1] = {
			y1,
			y2,
			x: curX,
			seq: fib[i + 2],
		};
		i++;
	} while (i < 11);
	return timeZones;
}

EachFibTimeZone.propTypes = {
	x1: PropTypes.any.isRequired,
	x2: PropTypes.any.isRequired,
	y1: PropTypes.number.isRequired,
	y2: PropTypes.number.isRequired,
	xScale: PropTypes.any,

	xDisplayFormat: PropTypes.func.isRequired,
	yDisplayFormat: PropTypes.func.isRequired,
	selected: PropTypes.bool.isRequired,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		fontFamily: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		fontFill: PropTypes.string.isRequired,
		edgeStroke: PropTypes.string.isRequired,
		edgeFill: PropTypes.string.isRequired,
		nsEdgeFill: PropTypes.string.isRequired,
		edgeStrokeWidth: PropTypes.number.isRequired,
		r: PropTypes.number.isRequired,
		strokeDasharray: PropTypes.any,
		strokeZone: PropTypes.any,
		strokeZoneWidth: PropTypes.any,
		strokeZoneDasharray: PropTypes.any,
	}).isRequired,

	interactive: PropTypes.bool.isRequired,
	hoverText: PropTypes.object.isRequired,

	index: PropTypes.number,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
};

EachFibTimeZone.defaultProps = {
	xDisplayFormat: timeFormat("%Y-%m-%d"),
	yDisplayFormat: d => d.toFixed(2),
	interactive: true,

	appearance: {
		stroke: "#000000",
		strokeWidth: 1,
		strokeOpacity: 1,
		fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
		fontSize: 10,
		fontFill: "#000000",
		edgeStroke: "#000000",
		edgeFill: "#FFFFFF",
		nsEdgeFill: "#000000",
		edgeStrokeWidth: 1,
		r: 5,
	},
	selected: false,

	onDrag: noop,
	onDragComplete: noop,

	hoverText: {
		enable: false,
	}
};

export default EachFibTimeZone;
