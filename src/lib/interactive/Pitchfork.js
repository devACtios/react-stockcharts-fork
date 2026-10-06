/* eslint-disable react/prop-types */


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

import EachPitchfork from "./wrapper/EachPitchfork";
import StraightLine from "./components/StraightLine";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class Pitchfork extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.forkStart = this.forkStart.bind(this);
		this.forkEnd = this.forkEnd.bind(this);
		this.handleDrawLine = this.handleDrawLine.bind(this);
		this.handleDrawFork = this.handleDrawFork.bind(this);
		this.handleDragLine = this.handleDragLine.bind(this);
		this.handleDragLineComplete = this.handleDragLineComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("trends")
			.bind(this);

		this.state = {
		};
		this.nodes = [];
		this.lineDraw = false;
		this.forkDraw = false;
	}
	handleDragLine(index, newXYValue) {
		const median = calcMedian([newXYValue.xSupport, newXYValue.ySupport], [newXYValue.xResistance, newXYValue.yResistance]);
		const supportEnd = this.calcForkLine([newXYValue.xStart, newXYValue.yStart], median, [newXYValue.xSupport, newXYValue.ySupport]);
		const resistanceEnd = this.calcForkLine([newXYValue.xStart, newXYValue.yStart], median, [newXYValue.xResistance, newXYValue.yResistance]);
		this.setState({
			override: {
				index,
				...newXYValue,
				xMedian: median[0],
				yMedian: median[1],
				xSupportEnd: supportEnd[0],
				ySupportEnd: supportEnd[1],
				xResistanceEnd: resistanceEnd[0],
				yResistanceEnd: resistanceEnd[1],
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
						start: [override.xStart, override.yStart],
						support: [override.xSupport, override.ySupport],
						resistance: [override.xResistance, override.yResistance],
						median: [override.xMedian, override.yMedian],
						supportEnd: [override.xSupportEnd, override.ySupportEnd],
						resistanceEnd: [override.xResistanceEnd, override.yResistanceEnd],
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
		if (!this.forkDraw) {
			if (isDefined(current) && isDefined(current.start)) {
				this.mouseMoved = true;
				this.setState({
					current: {
						start: current.start,
						support: xyValue,
						resistance: xyValue,
						median: null,
						supportEnd: null,
						resistanceEnd: null,
					}
				});
			}
		} else	{
			this.handleDrawFork(xyValue, moreProps);
		}
	}
	handleDrawFork(xyValue) {
		const { current } = this.state;
		if (isDefined(current) && isDefined(current.resistance)) {
			this.mouseMoved = true;
			const median = calcMedian(current.support, xyValue);
			this.setState({
				current: {
					start: current.start,
					support: current.support,
					resistance: xyValue,
					median: median,
					supportEnd: this.calcForkLine(current.start, median, current.support),
					resistanceEnd: this.calcForkLine(current.start, median, xyValue),
				}
			});
		}
	}
	handleStart(xyValue, moreProps, e) {
		const { current } = this.state;
		this.xScale = moreProps.xScale;
		this.yScale = moreProps.chartConfig.yScale;
		this.width = moreProps.width;
		if (!this.lineDraw) {
			if (isNotDefined(current) || isNotDefined(current.start)) {
				this.mouseMoved = false;
				this.lineDraw = true;

				this.setState({
					current: {
						start: xyValue,
						support: xyValue,
						resistance: xyValue,
						median: null,
						supportEnd: null,
						resistanceEnd: null,
					},
				}, () => {
					this.props.onStart(moreProps, e);
				});
			}
		} else {
			if (this.forkDraw) {
				this.forkEnd(xyValue, moreProps, e);
			} else {
				this.forkDraw = true;
				this.forkStart(xyValue, moreProps, e);
			}
		}
	}
	handleEnd() {
	}
	forkStart(xyValue) {
		const { current } = this.state;
		if (isNotDefined(current) || isNotDefined(current.resistance)) {
			const median = calcMedian(current.support, xyValue);
			this.setState({
				current: {
					start: current.start,
					support: xyValue,
					resistance: xyValue,
					median: median,
					supportEnd: this.calcForkLine(current.start, median, xyValue),
					resistanceEnd: this.calcForkLine(current.start, median, xyValue),
				},
			});
		}
	}
	forkEnd(xyValue, moreProps, e) {
		const { current } = this.state;
		const { trends, appearance, type } = this.props;
		if (this.forkDraw) {
			const median = calcMedian(current.support, xyValue);
			const newTrends = [
				...trends.map(d => ({ ...d, selected: false })),
				{
					start: current.start,
					support: current.support,
					resistance: xyValue,
					median: median,
					supportEnd: this.calcForkLine(current.start, median, current.support),
					resistanceEnd: this.calcForkLine(current.start, median, xyValue),
					selected: true,
					hide: false,
					appearance,
					type,
				}
			];
			this.forkDraw = false;
			this.lineDraw = false;
			this.setState({
				current: null,
				trends: newTrends
			}, () => {
				this.props.onComplete(newTrends, moreProps, e);
			});
		}
	}
	calcForkLine(start, median, point) {
		const m  = median[0] === start[0] ? undefined : (median[1] - start[1]) / (median[0] - start[0]);
		const b = -1 * m * point[0] + point[1];
		const xScale = this.xScale;
		const yScale = this.yScale;
		const width = this.width;
		const xWidth = (isDefined(width)) ? xScale.invert(width) : 0;
		const [xBegin, xFinish] = xScale.domain();
		const [yBegin, yFinish] = yScale.domain();

		if (start[0] === median[0])
			return [point[0], median[1] > start[1] ? yFinish : yBegin];
		return [median[0] > start[0] ?	((xWidth > xFinish) ? xWidth : xFinish) : xBegin, m * (median[0] > start[0] ? ((xWidth > xFinish) ? xWidth : xFinish) : xBegin) + b];
	}
	render() {
		const { appearance } = this.props;
		const { enabled, snap, shouldDisableSnap, snapTo } = this.props;

		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
		const { hoverText, trends } = this.props;
		const { current, override } = this.state;
		const lineMedian = isDefined(current) && isDefined(current.support) ?
			<StraightLine key="lineMedian" type={"RAY"}
				x1Value={current.start[0]}
				y1Value={current.start[1]}
				x2Value={isDefined(current.median) ? current.median[0] : current.support[0]}
				y2Value={isDefined(current.median) ? current.median[1] : current.support[1]}
				stroke={appearance.stroke}
				strokeWidth={appearance.strokeWidth}
				strokeDasharray={appearance.strokeDasharray}
				strokeOpacity={appearance.strokeOpacity} /> : null;
		const lineForkBase = isDefined(current) && isDefined(current.support) && isDefined(current.resistance) ?
			<StraightLine key="lineForkBase" type={"LINE"}
				x1Value={current.support[0]}
				y1Value={current.support[1]}
				x2Value={current.resistance[0]}
				y2Value={current.resistance[1]}
				stroke={appearance.stroke}
				strokeWidth={appearance.strokeWidth}
				strokeDasharray={appearance.strokeDasharray}
				strokeOpacity={appearance.strokeOpacity} /> : null;
		const lineSupport = isDefined(current) && isDefined(current.support) && isDefined(current.supportEnd) ?
			<StraightLine key="lineSupport" type={"LINE"}
				x1Value={current.support[0]}
				y1Value={current.support[1]}
				x2Value={current.supportEnd[0]}
				y2Value={current.supportEnd[1]}
				stroke={appearance.strokePitch}
				strokeWidth={appearance.strokePitchWidth}
				strokeDasharray={appearance.strokePitchDasharray}
				strokeOpacity={appearance.strokeOpacity} /> : null;
		const lineResistance = isDefined(current) && isDefined(current.resistance) && isDefined(current.resistanceEnd) ?
			<StraightLine key="lineResistance" type={"LINE"}
				x1Value={current.resistance[0]}
				y1Value={current.resistance[1]}
				x2Value={current.resistanceEnd[0]}
				y2Value={current.resistanceEnd[1]}
				stroke={appearance.strokePitch}
				strokeWidth={appearance.strokePitchWidth}
				strokeDasharray={appearance.strokePitchDasharray}
				strokeOpacity={appearance.strokeOpacity} /> : null;
		return <g>
			{trends.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;
				return <EachPitchfork key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					type={each.type}
					selected={each.selected}
					xStart={getValueFromOverride(override, idx, "xStart", each.start[0])}
					yStart={getValueFromOverride(override, idx, "yStart", each.start[1])}
					xMedian={getValueFromOverride(override, idx, "xMedian", each.median[0])}
					yMedian={getValueFromOverride(override, idx, "yMedian", each.median[1])}
					xSupport={getValueFromOverride(override, idx, "xSupport", each.support[0])}
					ySupport={getValueFromOverride(override, idx, "ySupport", each.support[1])}
					xSupportEnd={getValueFromOverride(override, idx, "xSupportEnd", each.supportEnd[0])}
					ySupportEnd={getValueFromOverride(override, idx, "ySupportEnd", each.supportEnd[1])}
					xResistance={getValueFromOverride(override, idx, "xResistance", each.resistance[0])}
					yResistance={getValueFromOverride(override, idx, "yResistance", each.resistance[1])}
					xResistanceEnd={getValueFromOverride(override, idx, "xResistanceEnd", each.resistanceEnd[0])}
					yResistanceEnd={getValueFromOverride(override, idx, "yResistanceEnd", each.resistanceEnd[1])}
					stroke={eachAppearance.stroke}
					strokePitch={eachAppearance.strokePitch}
					strokeWidth={eachAppearance.strokeWidth}
					strokeOpacity={eachAppearance.strokeOpacity}
					strokeDasharray={eachAppearance.strokeDasharray}
					strokePitchWidth={eachAppearance.strokePitchWidth}
					strokePitchDasharray={eachAppearance.strokePitchDasharray}
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
			{lineMedian}
			{lineForkBase}
			{lineSupport}
			{lineResistance}
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

function calcMedian(support, resistance) {
	return [(support[0] + resistance[0]) / 2, (support[1] + resistance[1]) / 2];
}

Pitchfork.propTypes = {
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
	hoverText: PropTypes.object.isRequired,

	trends: PropTypes.array.isRequired,

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

Pitchfork.defaultProps = {
	type: "PITCHFORK",

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
		stroke: "#A50000",
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeDasharray: "Solid",
		edgeStrokeWidth: 1,
		edgeFill: "#FFFFFF",
		edgeStroke: "#000000",
		r: 6,
		strokePitch: "#000099",
		strokePitchWidth: 1,
		strokePitchDasharray: "Solid",
		text: "",
	}
};

export default Pitchfork;
