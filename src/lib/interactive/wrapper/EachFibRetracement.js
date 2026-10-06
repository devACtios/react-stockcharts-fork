import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddleValue, head, last, noop } from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";
import { saveNodeType, isHover, isTouchDevice } from "../utils";

import { getNewXY } from "./EachTrendLine";
import StraightLine, { generateLine } from "../components/StraightLine";
import ClickableCircle from "../components/ClickableCircle";
import HoverTextNearMouse from "../components/HoverTextNearMouse";
import Text from "../components/Text";

class EachFibRetracement extends Component {
	constructor(props) {
		super(props);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

		this.handleLineNSResizeTop = this.handleLineNSResizeTop.bind(this);
		this.handleLineNSResizeBottom = this.handleLineNSResizeBottom.bind(this);
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

		onDrag(index, {
			x1: newX1Value,
			y1: newY1Value,
			x2: newX2Value,
			y2: newY2Value,
		});
	}
	handleLineNSResizeTop(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x1, x2, y2,
		} = this.props;

		const [, y1] = getNewXY(moreProps);

		onDrag(index, {
			x1,
			y1,
			x2,
			y2,
		});
	}
	handleLineNSResizeBottom(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x1, y1, x2,
		} = this.props;

		const [, y2] = getNewXY(moreProps);

		onDrag(index, {
			x1,
			y1,
			x2,
			y2,
		});
	}
	handleEdge1Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			y1, x2, y2,
		} = this.props;

		const [x1] = getNewXY(moreProps);

		onDrag(index, {
			x1,
			y1,
			x2,
			y2,
		});
	}
	handleEdge2Drag(moreProps) {
		const { index, onDrag } = this.props;
		const {
			x1, y1, y2,
		} = this.props;

		const [x2] = getNewXY(moreProps);

		onDrag(index, {
			x1,
			y1,
			x2,
			y2,
		});
	}
	render() {
		const { x1, x2, y1, y2 } = this.props;
		const { interactive, yDisplayFormat, type, appearance } = this.props;
		const { stroke, strokeWidth, strokeOpacity, strokeDasharray, isTrend, strokeTrend, strokeTrendWidth, strokeTrendDasharray } = appearance;
		const { fontFamily, fontSize, fontFill } = appearance;
		const { edgeStroke, edgeFill, nsEdgeFill, edgeStrokeWidth, r } = appearance;
		const { hoverText, selected } = this.props;
		const { hover } = this.state;
		const { onDragComplete } = this.props;
		const lines = helper({ x1, x2, y1, y2 });
		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		const lineType = type === "EXTEND" ? "XLINE" : type === "BOUND" ? "LINE" : type;
		const dir = head(lines).y1 > last(lines).y1 ? 3 : -1.3;

		const hoverHandler = interactive
			? { onHover: this.handleHover, onUnHover: this.handleHover }
			: {};
		const trendline = isTrend ?
			<StraightLine
				ref={this.saveNodeType("trendline")}
				selected={selected || (isTouchDevice() ? false : hover)}

				{...hoverHandler}

				type={"LINE"}
				x1Value={x1}
				y1Value={y1}
				x2Value={x2}
				y2Value={y2}
				stroke={strokeTrend}
				strokeWidth={strokeTrendWidth}
				strokeDasharray={strokeTrendDasharray}
				strokeOpacity={strokeOpacity}
				interactiveCursorClass={"react-stockcharts-move-cursor"}

				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineMove}
				onDragComplete={onDragComplete}
			/>
			: null;

		const middlePoint = interactive ?
			<ClickableCircle
				ref={this.saveNodeType("middlePoint")}
				show={selected || (isTouchDevice() ? false : hover)}
				cx={calcMiddleValue(...lines.map((line) => calcMiddleValue(line.x1, line.x2)))}
				cy={calcMiddleValue(...lines.map((line) => line.y))}
				r={r}
				fill={nsEdgeFill}
				stroke={edgeStroke}
				strokeWidth={edgeStrokeWidth}
				interactiveCursorClass={"react-stockcharts-move-cursor"}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineMove}
				onDragComplete={onDragComplete}
				middlePoint/>
			: null;

		return <g>
			{lines.map((line, j) => {
				const text = `${yDisplayFormat(line.y)} (${line.percent.toFixed(2)}%)`;

				const xyProvider = ({ xScale, chartConfig }) => {
					const { yScale } = chartConfig;
					const { x1, y1, x2 } = generateLine({
						type: lineType,
						start: [line.x1, line.y],
						end: [line.x2, line.y],
						xScale,
						yScale,
					});

					const x = xScale(Math.min(x1, x2)) + 10;
					const y = yScale(y1) + dir * 4;
					return [x, y];
				};

				const firstOrLast = (j === 0) || (j === lines.length - 1);

				const interactiveCursorClass = firstOrLast
					? "react-stockcharts-ns-resize-cursor"
					: "react-stockcharts-move-cursor";

				const interactiveEdgeCursorClass = firstOrLast
					? "react-stockcharts-ns-resize-cursor"
					: "react-stockcharts-ew-resize-cursor";

				const dragHandler = j === 0
					? this.handleLineNSResizeTop
					: j === lines.length - 1
						? this.handleLineNSResizeBottom
						: this.handleLineMove;

				const edge1DragHandler = j === 0
					? this.handleLineNSResizeTop
					: j === lines.length - 1
						? this.handleLineNSResizeBottom
						: this.handleEdge1Drag;
				const edge2DragHandler = j === 0
					? this.handleLineNSResizeTop
					: j === lines.length - 1
						? this.handleLineNSResizeBottom
						: this.handleEdge2Drag;

				return <g key={j}>
					<StraightLine
						ref={this.saveNodeType(`line_${j}`)}
						selected={selected || (isTouchDevice() ? false : hover)}

						{...hoverHandler}

						type={lineType}
						x1Value={line.x1}
						y1Value={line.y}
						x2Value={line.x2}
						y2Value={line.y}
						stroke={stroke}
						strokeWidth={strokeWidth}
						strokeDasharray={strokeDasharray}
						strokeOpacity={strokeOpacity}
						interactiveCursorClass={interactiveCursorClass}

						onDragStart={this.handleLineDragStart}
						onDrag={dragHandler}
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
					<ClickableCircle
						ref={this.saveNodeType("edge1")}
						show={selected || (isTouchDevice() ? false : hover)}
						cx={line.x1}
						cy={line.y}
						r={r}
						fill={firstOrLast ? nsEdgeFill : edgeFill}
						stroke={edgeStroke}
						strokeWidth={edgeStrokeWidth}
						interactiveCursorClass={interactiveEdgeCursorClass}
						onDrag={edge1DragHandler}
						onDragComplete={onDragComplete} />
					<ClickableCircle
						ref={this.saveNodeType("edge2")}
						show={selected || (isTouchDevice() ? false : hover)}
						cx={line.x2}
						cy={line.y}
						r={r}
						fill={firstOrLast ? nsEdgeFill : edgeFill}
						stroke={edgeStroke}
						strokeWidth={edgeStrokeWidth}
						interactiveCursorClass={interactiveEdgeCursorClass}
						onDrag={edge2DragHandler}
						onDragComplete={onDragComplete} />
					<HoverTextNearMouse
						show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
						{...restHoverTextProps} />
				</g>;
			})}
			{trendline}
			{middlePoint}
		</g>;
	}
}


function helper({ x1, y1, x2, y2 }) {
	const dy = y2 - y1;
	const retracements = [100, 61.8, 50, 38.2, 23.6, 0]
		.map(each => ({
			percent: each,
			x1,
			x2,
			y: (y2 - (each / 100) * dy),
		}));

	return retracements;
}

EachFibRetracement.propTypes = {
	x1: PropTypes.any.isRequired,
	x2: PropTypes.any.isRequired,
	y1: PropTypes.number.isRequired,
	y2: PropTypes.number.isRequired,

	yDisplayFormat: PropTypes.func.isRequired,
	type: PropTypes.string.isRequired,
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
		isTrend: PropTypes.any,
		strokeTrend: PropTypes.any,
		strokeTrendWidth: PropTypes.any,
		strokeTrendDasharray: PropTypes.any,
	}).isRequired,

	interactive: PropTypes.bool.isRequired,
	hoverText: PropTypes.object.isRequired,

	index: PropTypes.number,
	onDrag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
};

EachFibRetracement.defaultProps = {
	yDisplayFormat: d => d.toFixed(5),
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

export default EachFibRetracement;
