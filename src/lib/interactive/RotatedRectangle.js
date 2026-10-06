

import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, isNotDefined, noop } from "../utils";
import {
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
	isTouchDevice,
} from "./utils";
import EachRotatedRectangle from "./wrapper/EachRotatedRectangle";
import { helperPoint } from "./components/RotateRectangle";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class RotatedRectangle extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawRectangle = this.handleDrawRectangle.bind(this);
		this.handleDragRectangle = this.handleDragRectangle.bind(this);
		this.handleDragRectangleComplete = this.handleDragRectangleComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("rectangles")
			.bind(this);

		this.nodes = [];
		this.state = {
		};

	}
	handleDragRectangle(index, newXYValue) {
		this.setState({
			override: {
				index,
				...newXYValue
			}
		});
	}
	handleDragRectangleComplete(moreProps) {
		const { override } = this.state;
		const { rectangles } = this.props;

		if (isDefined(override)) {
			const { index, ...rest } = override;
			const newRectangles = rectangles
				.map((each, idx) => idx === index
					? { ...each, ...rest, selected: true }
					: each);
			this.setState({
				override: null,
			}, () => {
				this.props.onComplete(newRectangles, moreProps);
			});
		}
	}
	handleDrawRectangle(xyValue, moreProps) {
		const { current } = this.state;
		const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;

		if (isDefined(current)
				&& isDefined(current.startXY)) {
			this.mouseMoved = true;
			if (isNotDefined(current.endXY)) {
				this.setState({
					current: {
						startXY: current.startXY,
						nextXY: xyValue,
						endXY: null,
					}
				});
			} else {
				const { RT, LT, RB, LB } = helperPoint(current.startXY, current.nextXY, xyValue, xScale, yScale, xAccessor, fullData);
				this.setState({
					current: {
						...current,
						endXY: xyValue,
						RTXY: RT,
						RBXY: RB,
						LBXY: LB,
						LTXY: LT,
					}
				});
			}
		}
	}
	handleStart(xyValue) {
		const { current } = this.state;

		if (isNotDefined(current) || isNotDefined(current.startXY)) {
			this.mouseMoved = false;
			this.setState({
				current: {
					startXY: xyValue,
					nextXY: null,
					endXY: null,
					RTXY: null,
					RBXY: null,
					LTXY: null,
					LBXY: null,				}
			}, () => {
				this.props.onStart();
			});
		}
	}
	handleEnd(xyValue, moreProps, e) {
		const { current } = this.state;
		let newCurrent = null;
		const { rectangles, appearance, type } = this.props;
		if (isNotDefined(current) || (xyValue[0] === current.startXY[0]) && (xyValue[1] === current.startXY[1])) {
			return false;
		}

		if (this.mouseMoved
			&& isDefined(current)
			&& isDefined(current.startXY)
		) {

			if (isNotDefined(current.endXY)) {
				this.setState({
					current: {
						...current,
						endXY: xyValue,
					}
				});
			} else {
				if (isNotDefined(current.RT) || isNotDefined(current.LT) || isNotDefined(current.RB) || isNotDefined(current.LB)) {
					const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
					const { RT, LT, RB, LB } = helperPoint(current.startXY, current.nextXY, xyValue, xScale, yScale, xAccessor, fullData);

					newCurrent = { ...current,
						endXY: xyValue,
						RTXY: RT,
						RBXY: RB,
						LBXY: LB,
						LTXY: LT,
					};
				}

				const newRectangles = [
					...rectangles.map(d => ({ ...d, selected: false })),
					{
						type,
						...current,
						...newCurrent,
						selected: true,
						hide: false,
						appearance,
					}
				];

				this.setState({
					current: null,
				}, () => {

					this.props.onComplete(newRectangles, moreProps, e);
				});
			}
		}
	}
	render() {
		const { appearance } = this.props;
		const { enabled } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionOpacity, currentPositionStrokeWidth } = this.props;
		const { rectangles, hoverText } = this.props;
		const { current, override } = this.state;
		const overrideIndex = isDefined(override) ? override.index : null;

		const tempRectangle = isDefined(current) && isDefined(current.nextXY)
			? <EachRotatedRectangle
				interactive={false}
				{...current}
				appearance={appearance}
				hoverText={hoverText} />
			: null;

		return <g>
			{rectangles.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				return <EachRotatedRectangle key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					selected={each.selected}
					hoverText={hoverText}
					{...(idx === overrideIndex ? override : each)}
					appearance={eachAppearance}
					onDrag={this.handleDragRectangle}
					onDragComplete={this.handleDragRectangleComplete}
				/>;
			})}
			{tempRectangle}
			<MouseLocationIndicator
				enabled={enabled}
				snap={false}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				opacity={currentPositionOpacity}
				strokeWidth={currentPositionStrokeWidth}
				onMouseDown={this.handleStart}
				onClick={this.handleEnd}
				onMouseMove={this.handleDrawRectangle} />
		</g>;
	}
}

RotatedRectangle.propTypes = {
	type: PropTypes.string.isRequired,
	enabled: PropTypes.bool.isRequired,

	onStart: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,

	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,

	hoverText: PropTypes.object.isRequired,
	rectangles: PropTypes.array.isRequired,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		fill: PropTypes.string.isRequired,
		fillOpacity: PropTypes.number.isRequired,
		edgeStroke: PropTypes.string.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeStrokeWidth: PropTypes.number.isRequired,
		r: PropTypes.number.isRequired,
	}).isRequired
};

RotatedRectangle.defaultProps = {
	type: "ROTATED_RECTANGLE",
	onStart: noop,
	onComplete: noop,
	onSelect: noop,

	currentPositionStroke: "#000000",
	currentPositionOpacity: 1,
	currentPositionStrokeWidth: 3,
	currentPositionRadius: 4,

	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: !isTouchDevice(),
		bgHeight: 18,
		bgWidth: 120,
		text: "Click to select object",
	},
	rectangles: [],
	appearance: {
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 1,
		isFill: true,
		fill: "#8AAFE2",
		fillOpacity: 0.7,
		edgeStroke: "#000000",
		edgeFill: "#FFFFFF",
		edgeStrokeWidth: 1,
		r: 5,
		text: "",
	}
};

export default RotatedRectangle;
