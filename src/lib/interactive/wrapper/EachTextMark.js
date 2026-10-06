import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, noop, strokeDashTypes, within } from "../../utils";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";

import HoverTextNearMouse from "../components/HoverTextNearMouse";
import { textWidth } from "../../utils/text";
import OneTextMark from "../components/OneTextMark";

class EachTextMark extends Component {

	constructor(props) {
		super(props);

		this.handleLineDragStart = this.handleLineDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge1DragStart = this.handleEdge1DragStart.bind(this);

		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);
		this.handleEdge2DragStart = this.handleEdge2DragStart.bind(this);

		this.handleDragComplete = this.handleDragComplete.bind(this);

		this.handleHover = this.handleHover.bind(this);

		this.isHover = isHover.bind(this);
		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};

		const confinestWidth = EachTextMark.confinestWidth(props);

		this.state = {
			hover: false,
			settedwidth: undefined,
			...confinestWidth,
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { minWidth, maxWidth } = EachTextMark.confinestWidth(props);
		const { settedwidth } = state;
		const width = within([minWidth, maxWidth], settedwidth);

		return {
			...state,
			settedwidth: width,
			minWidth,
			maxWidth,
		};
	}

	static confinestWidth(props) {
		const { maxRowSize, minRowSize, strokeWidth, font, fixInacuracy } = props;
		const maxRowText = "W".repeat(maxRowSize);
		const maxWidth = textWidth({ strokeWidth, font }, maxRowText) - fixInacuracy;
		const minRowText = "W".repeat(minRowSize);
		const minWidth = textWidth({ strokeWidth, font }, minRowText) + fixInacuracy;

		return {
			minWidth,
			maxWidth,
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
	handleDragComplete(...rest) {
		this.setState({
			anchor: undefined
		});
		this.props.onDragComplete(...rest);
	}
	handleEdge1DragStart() {
		this.setState({
			anchor: "edge1"
		});
	}
	handleEdge1Drag({ dx, dy }) {
		return function(moreProps) {
			const { index, onDrag } = this.props;
			const [x1Value, y1Value] = getNewXY(moreProps, { dx, dy });

			onDrag(index, {
				x1Value: x1Value,
				y1Value: y1Value,
			});
		}.bind(this);
	}
	handleEdge2DragStart() {
		this.setState({
			anchor: "edge2"
		});
	}
	handleEdge2Drag({ width }) {
		return function(moreProps) {
			const { settedwidth, minWidth, maxWidth } = this.state;
			const { mouseXY, prevMouseXY } = moreProps;

			const diffWidth = mouseXY[0] - prevMouseXY[0];
			const nextWidth = within([minWidth, maxWidth], (settedwidth || width) + diffWidth);

			this.setState({
				settedwidth: nextWidth,
			});
		}.bind(this);
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
			text,
			font,
			stroke,
			strokeWidth,
			strokeOpacity,
			strokeDasharray,
			bgFill,
			r1, r2,
			edgeStrokeWidth,
			edgeFill,
			edgeStroke,
			edgeInteractiveCursor,
			lineInteractiveCursor,
			hoverText,
			selected,
			onDragComplete,
			lineHeight,
			maxRows,
			fixInacuracy,
			padding,
		} = this.props;
		const { hover, anchor, settedwidth, maxWidth } = this.state;

		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

		return <g>
			<OneTextMark
				ref={this.saveNodeType("oneTextMarkeach")}
				x1Value={x1Value}
				y1Value={y1Value}
				width={settedwidth}

				enableWidthChange={this.props.enableWidthChange}
				selected={selected || (isTouchDevice() ? false : hover)}
				handleHover={this.handleHover}

				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete}
				anchor={anchor}

				text={text}
				font={font}
				stroke={stroke}
				strokeWidth={strokeWidth}
				lineHeight={lineHeight}
				padding={padding}
				fixInacuracy={fixInacuracy}
				bgFill={bgFill}
				strokeOpacity={strokeOpacity}
				maxWidth={maxWidth}
				maxRows={maxRows}
				strokeDasharray={strokeDasharray}
				// edge1
				edgeInteractiveCursor={edgeInteractiveCursor}
				handleEdge1DragStart={this.handleEdge1DragStart}
				handleEdge1Drag={this.handleEdge1Drag}
				// edge2
				handleEdge2DragStart={this.handleEdge2DragStart}
				handleEdge2Drag={this.handleEdge2Drag}

				handleDragComplete={this.handleDragComplete}

				edge1show={selected || (isTouchDevice() ? false : hover)}
				my={strokeWidth * -1}
				r1={r1}
				r2={r2}
				fill={edgeFill}
				edgeFill={edgeFill}
				edgeStroke={edgeStroke}
				edgeStrokeWidth={edgeStrokeWidth}
			/>

			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

export function getNewXY(moreProps, data) {
	const dx = isDefined(data.dx) ? data.dx : 0;

	const { xScale, xAccessor, plotData, mouseXY } = moreProps;

	const x = getXValue(xScale, xAccessor, [mouseXY[0] - dx], plotData);
	const y = doMagnetY(moreProps);

	return [x, y];
}

EachTextMark.propTypes = {
	bgFill: PropTypes.string.isRequired,
	x1Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	enableWidthChange: PropTypes.bool,

	index: PropTypes.number,

	onDrag: PropTypes.func.isRequired,
	onEdge1Drag: PropTypes.func.isRequired,
	onDragComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onUnSelect: PropTypes.func.isRequired,

	r1: PropTypes.number.isRequired,
	r2: PropTypes.number.isRequired,
	rFill: PropTypes.string,
	strokeOpacity: PropTypes.number.isRequired,
	defaultClassName: PropTypes.string,

	selected: PropTypes.bool,

	font: PropTypes.string.isRequired,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),

	edgeStrokeWidth: PropTypes.number.isRequired,
	edgeStroke: PropTypes.string.isRequired,
	edgeInteractiveCursor: PropTypes.string.isRequired,
	lineInteractiveCursor: PropTypes.string.isRequired,
	edgeFill: PropTypes.string.isRequired,
	hoverText: PropTypes.object.isRequired,

	lineHeight: PropTypes.number,
	padding: PropTypes.number,
	minRowSize: PropTypes.number,
	maxRowSize: PropTypes.number,
	maxRows: PropTypes.number,
	fixInacuracy: PropTypes.number,
	text: PropTypes.string,
};

EachTextMark.defaultProps = {
	onDrag: noop,
	onEdge1Drag: noop,
	onDragComplete: noop,
	onSelect: noop,
	onUnSelect: noop,

	selected: false,

	edgeStroke: "#FFFFFF",
	edgeFill: "#15A4F2",
	edgeStrokeWidth: 3,
	r1: 5,
	r2: 7,
	strokeWidth: 14,
	strokeOpacity: 1,
	strokeDasharray: "Solid",
	hoverText: {
		enable: false,
	},

	lineHeight: 1.1, // em
	padding: 11.5,

	minRowSize: 16,
	maxRowSize: 48,
	maxRows: 15,

	fixInacuracy: 1,
};

export default EachTextMark;
