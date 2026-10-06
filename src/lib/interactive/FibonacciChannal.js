

import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, isNotDefined, noop } from "../utils";
import {
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
	isTouchDevice,
} from "./utils";
import EachFibChannel from "./wrapper/EachFibChannel";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class FibonacciChannal extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawChannel = this.handleDrawChannel.bind(this);
		this.handleDragChannel = this.handleDragChannel.bind(this);
		this.handleDragChannelComplete = this.handleDragChannelComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("channels")
			.bind(this);

		this.nodes = [];
		this.state = {
		};
	}
	handleDragChannel(index, newXYValue) {
		this.setState({
			override: {
				index,
				...newXYValue
			}
		});
	}
	handleDragChannelComplete(moreProps) {
		const { override } = this.state;
		const { channels } = this.props;

		if (isDefined(override)) {
			const { index, ...rest } = override;
			const newChannels = channels
				.map((each, idx) => idx === index
					? { ...each, ...rest, selected: true }
					: each);
			this.setState({
				override: null,
			}, () => {
				this.props.onComplete(newChannels, moreProps);
			});
		}
	}
	handleDrawChannel(xyValue) {
		const { current } = this.state;

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
				this.setState({
					current: {
						...current,
						endXY: xyValue,
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
				}
			}, () => {
				this.props.onStart();
			});
		}
	}
	handleEnd(xyValue, moreProps, e) {
		const { current } = this.state;
		const { channels, appearance, type } = this.props;
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
				const newChannels = [
					...channels.map(d => ({ ...d, selected: false })),
					{
						type,
						...current,
						selected: true,
						hide: false,
						appearance,
					},
				];

				this.setState({
					current: null,
				}, () => {

					this.props.onComplete(newChannels, moreProps, e);
				});
			}
		}
	}
	render() {
		const { appearance } = this.props;
		const { enabled } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionOpacity, currentPositionStrokeWidth } = this.props;
		const { channels, hoverText } = this.props;
		const { current, override } = this.state;
		const overrideIndex = isDefined(override) ? override.index : null;

		const tempChannel = isDefined(current) && isDefined(current.nextXY)
			? <EachFibChannel
				interactive={false}
				{...current}
				appearance={appearance}
				hoverText={hoverText} />
			: null;

		return <g>
			{channels.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				return <EachFibChannel key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					selected={each.selected}
					hoverText={hoverText}
					{...(idx === overrideIndex ? override : each)}
					appearance={eachAppearance}
					onDrag={this.handleDragChannel}
					onDragComplete={this.handleDragChannelComplete}
				/>;
			})}
			{tempChannel}
			<MouseLocationIndicator
				enabled={enabled}
				snap={false}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				opacity={currentPositionOpacity}
				strokeWidth={currentPositionStrokeWidth}
				onMouseDown={this.handleStart}
				onClick={this.handleEnd}
				onMouseMove={this.handleDrawChannel} />
		</g>;
	}
}


FibonacciChannal.propTypes = {
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
	channels: PropTypes.array.isRequired,

	appearance: PropTypes.shape({
		stroke: PropTypes.string.isRequired,
		strokeOpacity: PropTypes.number.isRequired,
		strokeWidth: PropTypes.number.isRequired,
		fill: PropTypes.string,
		fillOpacity: PropTypes.number.isRequired,
		edgeStroke: PropTypes.string.isRequired,
		edgeFill: PropTypes.string.isRequired,
		edgeFill2: PropTypes.string.isRequired,
		edgeStrokeWidth: PropTypes.number.isRequired,
		fontFamily: PropTypes.string.isRequired,
		fontSize: PropTypes.number.isRequired,
		fontFill: PropTypes.string.isRequired,
		r: PropTypes.number.isRequired,
	}).isRequired
};

FibonacciChannal.defaultProps = {
	type: "FIBONACCI_CHANNEL",
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
	channels: [],
	appearance: {
		stroke: "#000000",
		strokeOpacity: 1,
		strokeWidth: 1,
		strokeDasharray: "Solid",
		fill: "#8AAFE2",
		fillOpacity: 0.3,
		edgeStroke: "#000000",
		edgeFill: "#FFFFFF",
		edgeFill2: "#250B98",
		edgeStrokeWidth: 1,
		r: 5,
		fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
		fontSize: 11,
		fontFill: "#000000",
		channels: [{ isStroke: true, seq: 0, stroke: "#758696" }, { isStroke: true, seq: 0.236, stroke: "#CC2A2A" },
			{ isStroke: true, seq: 0.382, stroke: "#A6D247" }, { isStroke: true, seq: 0.5, stroke: "#79DE70" },
			{ isStroke: true, seq: 0.618, stroke: "#5DD9AE" },	{ isStroke: true, seq: 0.786, stroke: "#53ADD5" },
			{ isStroke: true, seq: 1, stroke: "#758696" },	{ isStroke: true, seq: 1.618, stroke: "#3A3AD0" },
			{ isStroke: true, seq: 2.618, stroke: "#AD54D1" },	{ isStroke: true, seq: 4.236, stroke: "#AD54D1" }],
		text: "",
	}
};

export default FibonacciChannal;
