import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop, strokeDashTypes } from "../../utils";
import { saveNodeType, isHover, isTouchDevice } from "../utils";
import { doMagnetY, getXValue } from "../../utils/ChartDataUtil";

import Brush from "../components/Brush";
import HoverTextNearMouse from "../components/HoverTextNearMouse";

class EachInteractiveBrush extends Component {
	constructor(props) {
		super(props);

		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = {};
		this.isHover = isHover.bind(this);
		this.handleHover = this.handleHover.bind(this);
		this.handleUnHover = this.handleUnHover.bind(this);
		this.handleLineDragStart = this.handleLineDragStart.bind(this);
		this.handleLineDrag = this.handleLineDrag.bind(this);

		this.state = {
			hover: false,
		};
	}
	handleLineDragStart() {
		const {
			x1Value, y1Value,
			x2Value, y2Value,
			points,
		} = this.props;

		this.dragStart = {
			x1Value, y1Value,
			x2Value, y2Value,
			points,
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
			points,
		} = this.dragStart;

		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
		const { startPos, mouseXY } = moreProps;

		const x1 = xScale(x1Value);
		const y1 = yScale(y1Value);
		const x2 = xScale(x2Value);
		const y2 = yScale(y2Value);
		const scaledPoints = points.map(point => [xScale(point[0]), yScale(point[1])]);

		const dx = startPos[0] - mouseXY[0];
		const dy = startPos[1] - yScale(doMagnetY(moreProps));

		const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
		const newY1Value = yScale.invert(y1 - dy);
		const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
		const newY2Value = yScale.invert(y2 - dy);

		const newPoints = scaledPoints.map(point => {
			const [x, y] = point;
			return [
				getXValue(xScale, xAccessor, [x - dx, y - dy], fullData),
				yScale.invert(y - dy),
			];
		});

		onDrag(index, {
			x1Value: newX1Value,
			y1Value: newY1Value,
			x2Value: newX2Value,
			y2Value: newY2Value,
			points: newPoints,
		});
	}
	handleHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering
			});
		}
	}
	handleUnHover(moreProps) {
		if (this.state.hover !== moreProps.hovering) {
			this.setState({
				hover: moreProps.hovering,
			});
		}
	}
	render() {
		const {
			x1Value,
			y1Value,
			x2Value,
			y2Value,
			stroke,
			strokeWidth,
			strokeOpacity,
			strokeDasharray,
			edgeFill,
			edgeStroke,
			edgeDasharray,
			edgeStrokeWidth,
			lineInteractiveCursor,
			hoverText,
			selected,
			points,
			onDragComplete,
		} = this.props;
		const { hover } = this.state;

		const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;
		return <g>
			<Brush
				ref={this.saveNodeType("line")}
				selected={selected || (isTouchDevice() ? false : hover)}
				onHover={this.handleHover}
				onUnHover={this.handleUnHover}
				x1Value={x1Value}
				y1Value={y1Value}
				x2Value={x2Value}
				y2Value={y2Value}
				points={points}
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeOpacity={strokeOpacity}
				strokeDasharray={strokeDasharray}
				edgeFill={edgeFill}
				edgeStroke={edgeStroke}
				edgeDasharray={edgeDasharray}
				edgeStrokeWidth={edgeStrokeWidth}
				interactiveCursorClass={lineInteractiveCursor}
				onDragStart={this.handleLineDragStart}
				onDrag={this.handleLineDrag}
				onDragComplete={onDragComplete}
			/>
			<HoverTextNearMouse
				show={hoverTextEnabled && (hover && !isTouchDevice()) && !selected}
				{...restHoverTextProps} />
		</g>;
	}
}

EachInteractiveBrush.propTypes = {
	x1Value: PropTypes.any.isRequired,
	x2Value: PropTypes.any.isRequired,
	y1Value: PropTypes.any.isRequired,
	y2Value: PropTypes.any.isRequired,
	points: PropTypes.array,
	edgeDasharray: PropTypes.array,

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

EachInteractiveBrush.defaultProps = {
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

export default EachInteractiveBrush;
