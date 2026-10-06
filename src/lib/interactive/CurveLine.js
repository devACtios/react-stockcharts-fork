

import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, isNotDefined, noop, strokeDashTypes } from "../utils";

import {
	getValueFromOverride,
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
	isTouchDevice,
} from "./utils";

import EachCurveLine from "./wrapper/EachCurveLine";
import ClickableCurveLine, { helperPoint2 } from "./components/ClickableCurveLine";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class CurveLine extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawLine = this.handleDrawLine.bind(this);
		this.handleDragLine = this.handleDragLine.bind(this);
		this.handleDragLineComplete = this.handleDragLineComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("curves")
			.bind(this);

		this.state = {
		};
		this.nodes = [];
	}
	handleDragLine(index, newXYValue) {
		this.setState({
			override: {
				index,
				...newXYValue
			}
		});
	}
	handleDragLineComplete(moreProps) {
		const { override } = this.state;
		if (isDefined(override)) {
			const { curves } = this.props;
			const newCurves = curves
				.map((each, idx) => idx === override.index
					? {
						...each,
						start: [override.x1Value, override.y1Value],
						end: [override.x2Value, override.y2Value],
						center: [override.x3Value, override.y3Value],
						selected: true,
					}
					: {
						...each,
						selected: false,
					});

			this.setState({
				override: null,
			}, () => {
				this.props.onComplete(newCurves, moreProps);
			});
		}
	}
	handleDrawLine(xyValue, moreProps) {
		const { current } = this.state;
		if (isDefined(current) && isDefined(current.start)) {
			this.mouseMoved = true;
			this.setState({
				current: {
					start: current.start,
					end: xyValue,
					center: helperPoint2(current.start, xyValue, moreProps),
				}
			});
		}
	}
	handleStart(xyValue, moreProps, e) {
		const { current } = this.state;

		if (isNotDefined(current) || isNotDefined(current.start)) {
			this.mouseMoved = false;
			this.setState({
				current: {
					start: xyValue,
					end: null,
					center: null,
				},
			}, () => {
				this.props.onStart(moreProps, e);
			});
		}
	}
	handleEnd(xyValue, moreProps, e) {

		const { current } = this.state;
		const { curves, appearance, type } = this.props;

		if (this.mouseMoved
			&& isDefined(current)
			&& isDefined(current.start)
		) {
			if (xyValue[0] === current.start[0] && xyValue[1] === current.start[1]) {
				return false;
			}
			const newCurves = [
				...curves.map(d => ({ ...d, selected: false })),
				{
					start: current.start,
					end: xyValue,
					center: helperPoint2(current.start, xyValue, moreProps),
					selected: true,
					hide: false,
					appearance,
					type,
				}
			];
			this.setState({
				current: null,
				curves: newCurves
			}, () => {
				this.props.onComplete(newCurves, moreProps, e);
			});
		}
	}
	render() {
		// eslint-disable-next-line react/prop-types
		const { appearance, snap, shouldDisableSnap, snapTo } = this.props;
		const { enabled } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
		const { hoverText, curves } = this.props;
		const { current, override } = this.state;

		const tempLine = isDefined(current) && isDefined(current.end)
			? <ClickableCurveLine
				noHover
				x1Value={current.start[0]}
				y1Value={current.start[1]}
				x2Value={current.end[0]}
				y2Value={current.end[1]}
				x3Value={current.center[0]}
				y3Value={current.center[1]}
				stroke={appearance.stroke}
				strokeWidth={appearance.strokeWidth}
				strokeOpacity={appearance.strokeOpacity}
				strokeDasharray={appearance.strokeDasharray}/>
			: null;

		return <g>
			{curves.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				return <EachCurveLine key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					selected={each.selected}
					x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
					y1Value={getValueFromOverride(override, idx, "y1Value", each.start[1])}
					x2Value={getValueFromOverride(override, idx, "x2Value", each.end[0])}
					y2Value={getValueFromOverride(override, idx, "y2Value", each.end[1])}
					x3Value={getValueFromOverride(override, idx, "x3Value", each.center[0])}
					y3Value={getValueFromOverride(override, idx, "y3Value", each.center[1])}
					stroke={eachAppearance.stroke}
					strokeWidth={eachAppearance.strokeWidth}
					strokeOpacity={eachAppearance.strokeOpacity}
					strokeDasharray={eachAppearance.strokeDasharray}
					edgeStroke={eachAppearance.edgeStroke}
					edgeFill={eachAppearance.edgeFill}
					edgeStrokeWidth={eachAppearance.edgeStrokeWidth}
					r={eachAppearance.r}
					color={each.color}
					hoverText={hoverText}
					onDrag={this.handleDragLine}
					onDragComplete={this.handleDragLineComplete}
					edgeInteractiveCursor="react-stockcharts-move-cursor"
					lineInteractiveCursor="react-stockcharts-move-cursor"
				/>;
			})}
			{tempLine}
			<MouseLocationIndicator
				enabled={enabled}
				snap={snap}
				shouldDisableSnap={shouldDisableSnap}
				snapTo={snapTo}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				strokeOpacity={currentPositionstrokeOpacity}
				strokeWidth={currentPositionStrokeWidth}
				onMouseDown={this.handleStart}
				onClick={this.handleEnd}
				onMouseMove={this.handleDrawLine}
			/>
		</g>;
	}
}


CurveLine.propTypes = {
	enabled: PropTypes.bool.isRequired,

	onStart: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func,

	type: PropTypes.string,
	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionstrokeOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,
	hoverText: PropTypes.object.isRequired,

	curves: PropTypes.array.isRequired,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		strokeDasharray: PropTypes.oneOf(strokeDashTypes),
		edgeStrokeWidth: PropTypes.number.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeStroke: PropTypes.string.isRequired,
	}).isRequired
};

CurveLine.defaultProps = {
	type: "CURVE_LINE",
	onStart: noop,
	onComplete: noop,
	onSelect: noop,

	currentPositionStroke: "#000000",
	currentPositionstrokeOpacity: 1,
	currentPositionStrokeWidth: 3,
	currentPositionRadius: 4,

	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: !isTouchDevice(),
		bgHeight: 18,
		bgWidth: 120,
		text: "Click to select object",
	},
	curves: [],

	appearance: {
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeDasharray: "Solid",
		edgeStrokeWidth: 1,
		edgeFill: "#FFFFFF",
		edgeStroke: "#000000",
		r: 6,
		text: "",
	}
};

export default CurveLine;
