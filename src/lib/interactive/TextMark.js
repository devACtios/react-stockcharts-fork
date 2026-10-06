


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

import EachTextMark from "./wrapper/EachTextMark";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class TextMark extends Component {
	constructor(props) {
		super(props);

		this.handleEnd = this.handleEnd.bind(this);
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
			const { trends } = this.props;
			const newTrends = trends
				.map((each, idx) => idx === override.index
					? {
						...each,
						start: [override.x1Value, override.y1Value],
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

	handleEnd(xyValue, moreProps, e) {
		const { current } = this.state;
		const { trends, appearance, type } = this.props;

		if (isNotDefined(current) || isNotDefined(current.start)) {
			const newTrends = [
				...trends.map(d => ({ ...d, selected: false })),
				{
					start: xyValue,
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
		const { enabled, snap, shouldDisableSnap, snapTo } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
		const { hoverText, trends } = this.props;
		const { override } = this.state;

		return <g>
			{trends.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				return <EachTextMark key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					selected={each.selected}
					x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
					y1Value={getValueFromOverride(override, idx, "y1Value", each.start[1])}
					enableWidthChange={this.props.enableWidthChange}
					text={eachAppearance.text}
					font={eachAppearance.font}
					stroke={eachAppearance.stroke}
					strokeWidth={eachAppearance.strokeWidth}
					strokeOpacity={eachAppearance.strokeOpacity}
					strokeDasharray={eachAppearance.strokeDasharray}
					edgeStroke={eachAppearance.edgeStroke}
					edgeFill={eachAppearance.edgeFill}
					fillOpacity={eachAppearance.fillOpacity}
					edgeStrokeWidth={eachAppearance.edgeStrokeWidth}
					bgFill={eachAppearance.bgFill}
					r={eachAppearance.r}
					r1={eachAppearance.r1}
					r2={eachAppearance.r2}
					hoverText={hoverText}
					onDrag={this.handleDragLine}
					onDragComplete={this.handleDragLineComplete}
					edgeInteractiveCursor="react-stockcharts-move-cursor"
					lineInteractiveCursor="react-stockcharts-move-cursor"
				/>;
			})}
			<MouseLocationIndicator
				enabled={enabled}
				snap={snap}
				shouldDisableSnap={shouldDisableSnap}
				snapTo={snapTo}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				strokeOpacity={currentPositionstrokeOpacity}
				strokeWidth={currentPositionStrokeWidth}
				onMouseDown={this.handleEnd}
			/>
		</g>;
	}
}


TextMark.propTypes = {
	snap: PropTypes.bool.isRequired,
	enabled: PropTypes.bool.isRequired,
	snapTo: PropTypes.func,
	shouldDisableSnap: PropTypes.func.isRequired,
	enableWidthChange: PropTypes.bool,

	onStart: PropTypes.func.isRequired,
	onComplete: PropTypes.func.isRequired,
	onSelect: PropTypes.func,

	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionstrokeOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,
	type: PropTypes.oneOf([
		"TEXT_MARK",
		"ARROW_MARK_UP",
		"ARROW_MARK_DOWN",
		"ARROW_MARK_FLAG",
	]),
	hoverText: PropTypes.object.isRequired,

	trends: PropTypes.array.isRequired,

	appearance: PropTypes.shape({
		bgFill: PropTypes.string.isRequired,
		stroke: PropTypes.string.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		strokeDasharray: PropTypes.oneOf(strokeDashTypes),
		edgeStrokeWidth: PropTypes.number.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeStroke: PropTypes.string.isRequired,
	}).isRequired
};

TextMark.defaultProps = {
	type: "TEXT_MARK",
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
		bgFill: "#FFFFFF",
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 14,
		strokeDasharray: "Solid",
		edgeStroke: "#FFFFFF",
		edgeFill: "#7e91a3",
		edgeStrokeWidth: 2,
		fillOpacity: 1,
		r1: 14,
		r2: 16,
		font: "Arial",
		text: "",
	}
};

export default TextMark;
