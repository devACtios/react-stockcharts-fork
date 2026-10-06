

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

import EachTrendAngel from "./wrapper/EachTrendAngel";
import OneTrendAngel from "./components/OneTrendAngel";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class TrendAngel extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawLine = this.handleDrawLine.bind(this);
		this.handleDragLine = this.handleDragLine.bind(this);
		this.handleDragLineComplete = this.handleDragLineComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("trends")
			.bind(this);

		this.state = {
		};
		this.nodes = [];
	}

	calculateAngel(moreProps, start, end) {
		const { xScale, chartConfig: { yScale } } = moreProps;

		const x1 = xScale(start.x1Value);
		const y1 = yScale(start.y1Value);
		const x2 = end.x2Value;
		const y2 = end.y2Value;

		let start_r = Math.atan((y2 - y1) / (x2 - x1));
		const hypotenuse = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		if (x2 >= x1 && y1 >= y2) {
			start_r = -1 * start_r;
		}
		if (x2 <= x1 && y1 > y2) {
			start_r = -1 * start_r + Math.PI;
		}
		if (x2 < x1 && y1 <= y2) {
			start_r = -1 * start_r - Math.PI;
		}
		if (x2 >= x1 && y1 < y2) {
			start_r = -1 * start_r;
		}

		return {
			coordinate_scale: { "start": [x1, y1], "end": [x2, y2], "angle_r": start_r, "hypotenuse": hypotenuse },
		};
	}

	handleDragLine(index, newXYValue, moreProps) {
		let res;
		if (newXYValue.point === undefined) {
			res = this.calculateAngel(moreProps, { x1Value: newXYValue.x1Value, y1Value: newXYValue.y1Value }, { x2Value: newXYValue.x2Value, y2Value: newXYValue.y2Value });
		} else {
			res = { coordinate_scale: newXYValue.point };
		}

		this.setState({
			override: {
				index,
				...newXYValue,
				coordinate_scale: res.coordinate_scale,
			}
		});
	}

	handleDragLineComplete(moreProps) {
		const { override } = this.state;
		if (isDefined(override)) {
			const { trends } = this.props;
			const newTrends = trends
				.map((each, idx) => idx === override.index
					? {
						...each,
						start: [override.x1Value, override.y1Value],
						coordinate_scale: override.coordinate_scale,
						selected: true,
					}
					: {
						...each,
						selected: false,
					});

			this.setState({
				override: null,
			}, () => {
				this.props.onComplete(newTrends, moreProps);
			});
		}
	}

	handleDrawLine(xyValue, moreProps) {
		const { current } = this.state;
		const { mouseXY } = moreProps;

		if (isDefined(current) && isDefined(current.start)) {

			const res = this.calculateAngel(moreProps, { x1Value: current.start[0], y1Value: current.start[1] }, { x2Value: mouseXY[0], y2Value: mouseXY[1] });
			this.mouseMoved = true;
			this.setState({
				current: {
					start: current.start,
					end: xyValue,
					coordinate_scale: res.coordinate_scale,
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
					coordinate_scale: undefined,
				},
			}, () => {
				this.props.onStart(moreProps, e);
			});
		}
	}
	handleEnd(xyValue, moreProps, e) {
		const { current } = this.state;
		const { trends, appearance, type } = this.props;
		const { mouseXY } = moreProps;

		if (this.mouseMoved
			&& isDefined(current)
			&& isDefined(current.start)
		) {
			if (xyValue[0] === current.start[0] && xyValue[1] === current.start[1]) {
				return false;
			}

			const res = this.calculateAngel(moreProps, { x1Value: current.start[0], y1Value: current.start[1] }, { x2Value: mouseXY[0], y2Value: mouseXY[1] });

			const newTrends = [
				...trends.map(d => ({ ...d, selected: false })),
				{
					start: current.start,
					coordinate_scale: res.coordinate_scale,
					selected: true,
					hide: false,
					appearance,
					type,
				}
			];
			this.setState({
				current: null,
				trends: newTrends
			}, () => {
				this.props.onComplete(newTrends, moreProps, e);
			});
		}
	}

	render() {
		const { appearance } = this.props;
		const { enabled, snap, shouldDisableSnap, snapTo, type } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
		const { hoverText, trends } = this.props;
		const { current, override } = this.state;

		const tempLine = isDefined(current)
			? <OneTrendAngel type={type}
				noHover
				x1Value={current.start[0]}
				y1Value={current.start[1]}
				coordinate_scale={current.coordinate_scale}
				text={appearance.text}
				calculateAngel={this.calculateAngel}
				stroke={appearance.stroke}
				strokeWidth={appearance.strokeWidth}
				strokeDasharray={appearance.strokeDasharray}
				strokeOpacity={appearance.strokeOpacity} />
			: null;

		return <g>
			{trends.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				return <EachTrendAngel key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					type={each.type}
					selected={each.selected}
					x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
					y1Value={getValueFromOverride(override, idx, "y1Value", each.start[1])}
					coordinate_scale={getValueFromOverride(override, idx, "coordinate_scale", each.coordinate_scale)}
					calculateAngel={this.calculateAngel}
					text={eachAppearance.text}
					stroke={eachAppearance.stroke}
					strokeWidth={eachAppearance.strokeWidth}
					strokeOpacity={eachAppearance.strokeOpacity}
					strokeDasharray={eachAppearance.strokeDasharray}
					edgeStroke={eachAppearance.edgeStroke}
					edgeFill={eachAppearance.edgeFill}
					edgeStrokeWidth={eachAppearance.edgeStrokeWidth}
					r={eachAppearance.r}
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


TrendAngel.propTypes = {
	snap: PropTypes.bool.isRequired,
	enabled: PropTypes.bool.isRequired,
	snapTo: PropTypes.func,
	shouldDisableSnap: PropTypes.func.isRequired,

	onStart: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func,

	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionstrokeOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,
	type: PropTypes.oneOf([
		"TRENDANGEL",
	]),
	hoverText: PropTypes.object.isRequired,

	trends: PropTypes.array.isRequired,

	appearance: PropTypes.shape({
		text: PropTypes.string,
		stroke: PropTypes.string.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		strokeDasharray: PropTypes.oneOf(strokeDashTypes),
		edgeStrokeWidth: PropTypes.number.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeStroke: PropTypes.string.isRequired,
	}).isRequired
};

TrendAngel.defaultProps = {
	type: "XLINE",

	onStart: noop,
	onComplete: noop,
	onSelect: noop,

	currentPositionStroke: "#000000",
	currentPositionstrokeOpacity: 1,
	currentPositionStrokeWidth: 3,
	currentPositionRadius: 4,

	shouldDisableSnap: e => (e.button === 2 || e.shiftKey),
	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: !isTouchDevice(),
		bgHeight: 18,
		bgWidth: 120,
		text: "Click to select object",
	},
	trends: [],

	appearance: {
		text: "",
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeDasharray: "Solid",
		edgeStrokeWidth: 1,
		edgeFill: "#FFFFFF",
		edgeStroke: "#000000",
		r: 6,
	}
};

export default TrendAngel;
