

import React, { Component } from "react";
import PropTypes from "prop-types";

import { isDefined, isNotDefined, noop } from "../utils";
import {
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
	isTouchDevice,
} from "./utils";
import EachFibTimeZone from "./wrapper/EachFibTimeZone";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class FibonacciTimeZone extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawTimeZone = this.handleDrawTimeZone.bind(this);

		this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
		this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

		this.handleDrag = this.handleDrag.bind(this);
		this.handleDragComplete = this.handleDragComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.getSelectionState = isHoverForInteractiveType("timeZones")
			.bind(this);

		this.saveNodeType = saveNodeType.bind(this);
		this.nodes = [];

		this.state = {
		};
	}
	handleDrawTimeZone(xyValue, moreProps) {
		this.xScale = moreProps.xScale;
		const { current } = this.state;
		if (isDefined(current) && isDefined(current.x1)) {
			this.mouseMoved = true;
			this.setState({
				current: {
					...current,
					x2: xyValue[0],
					y2: xyValue[1]
				}
			});
		}
	}
	handleDrag(moreProps, index, xy) {
		this.xScale = moreProps.xScale;
		this.setState({
			override: {
				index,
				...xy
			}
		});
	}
	handleEdge1Drag(echo, newXYValue, origXYValue) {
		const { timeZones } = this.props;
		const { index } = echo;

		const dx = origXYValue.x1Value - newXYValue.x1Value;
		const dy = origXYValue.y1Value - newXYValue.y1Value;

		this.setState({
			override: {
				index,
				x1: timeZones[index].x1 - dx,
				y1: timeZones[index].y1 - dy,
				x2: timeZones[index].x2,
				y2: timeZones[index].y2
			}
		});
	}
	handleEdge2Drag(echo, newXYValue, origXYValue) {
		const { timeZones } = this.props;
		const { index } = echo;

		const dx = origXYValue.x2Value - newXYValue.x2Value;
		const dy = origXYValue.y2Value - newXYValue.y2Value;

		this.setState({
			override: {
				index,
				x1: timeZones[index].x1,
				y1: timeZones[index].y1,
				x2: timeZones[index].x2 - dx,
				y2: timeZones[index].y2 - dy
			}
		});
	}
	handleDragComplete(moreProps) {
		const { timeZones } = this.props;
		const { override } = this.state;
		if (isDefined(override)) {
			const { index, ...rest } = override;

			const newTimeZones = timeZones.map(
				(each, idx) =>
					(idx === index
						? { ...each, ...rest, selected: true }
						: each)
			);
			this.setState(
				{
					override: null,
				},
				() => {
					this.props.onComplete(newTimeZones, moreProps);
				}
			);
		}
	}
	handleStart(xyValue, moreProps) {
		this.xScale = moreProps.xScale;
		const { current } = this.state;
		if (isNotDefined(current) || isNotDefined(current.x1)) {
			this.mouseMoved = false;
			this.setState(
				{
					current: {
						x1: xyValue[0],
						y1: xyValue[1],
						x2: null,
						y2: null
					}
				},
				() => {
					this.props.onStart(moreProps);
				}
			);
		}
	}
	handleEnd(xyValue, moreProps, e) {
		const { timeZones, appearance, type } = this.props;
		const { current } = this.state;
		if (isNotDefined(current) || (xyValue[0] === current.x1) && (xyValue[1] === current.y1)) {
			return false;
		}

		if (this.mouseMoved && isDefined(current) && isDefined(current.x1)) {
			const newTimeZones = timeZones.concat({
				type,
				...current,
				x2: xyValue[0],
				y2: xyValue[1],
				selected: true,
				hide: false,
				appearance,
			});

			this.setState(
				{
					current: null,
				},
				() => {
					this.props.onComplete(newTimeZones, moreProps, e);
				}
			);
		}
	}
	render() {
		const { current, override } = this.state;
		const { timeZones } = this.props;

		const {
			appearance,
		} = this.props;
		const {
			currentPositionStroke,
			currentPositionOpacity,
			currentPositionStrokeWidth,
			currentPositionRadius
		} = this.props;

		const { enabled, hoverText } = this.props;
		const overrideIndex = isDefined(override) ? override.index : null;
		const currentTimeZone = isDefined(current) && isDefined(current.x2)
			? <EachFibTimeZone
				interactive={false}
				appearance={appearance}
				hoverText={hoverText}
				xScale={this.xScale}
				{...current}
			/>
			: null;
		return (
			<g>
				{timeZones.map((each, idx) => {
					if (each.hide) return null;

					const eachAppearance = isDefined(each.appearance)
						? { ...appearance, ...each.appearance }
						: appearance;

					return (
						<EachFibTimeZone
							key={idx}
							ref={this.saveNodeType(idx)}
							index={idx}
							selected={each.selected}
							hoverText={hoverText}
							{...(idx === overrideIndex ? override : each)}
							appearance={eachAppearance}
							xScale={this.xScale}
							onDrag={this.handleDrag}
							onDragComplete={this.handleDragComplete}
						/>
					);
				})}
				{currentTimeZone}
				<MouseLocationIndicator
					enabled={enabled}
					snap={false}
					r={currentPositionRadius}
					stroke={currentPositionStroke}
					opacity={currentPositionOpacity}
					strokeWidth={currentPositionStrokeWidth}
					onMouseDown={this.handleStart}
					onClick={this.handleEnd}
					onMouseMove={this.handleDrawTimeZone}
				/>
			</g>
		);
	}
}

FibonacciTimeZone.propTypes = {
	type: PropTypes.string.isRequired,
	enabled: PropTypes.bool.isRequired,
	width: PropTypes.number,

	onStart: PropTypes.func,
	onComplete: PropTypes.func,
	onSelect: PropTypes.func,

	hoverText: PropTypes.object.isRequired,

	currentPositionStroke: PropTypes.string,
	currentPositionStrokeWidth: PropTypes.number,
	currentPositionOpacity: PropTypes.number,
	currentPositionRadius: PropTypes.number,

	timeZones: PropTypes.array.isRequired,

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
	}).isRequired
};

FibonacciTimeZone.defaultProps = {
	type: "FIBONACCI_TIME_ZONE",
	enabled: true,
	timeZones: [],

	onStart: noop,
	onComplete: noop,
	onSelect: noop,

	hoverText: {
		...HoverTextNearMouse.defaultProps,
		enable: !isTouchDevice(),
		bgHeight: 18,
		bgWidth: 120,
		text: "Click to select object"
	},
	currentPositionStroke: "#000000",
	currentPositionOpacity: 1,
	currentPositionStrokeWidth: 3,
	currentPositionRadius: 4,

	appearance: {
		stroke: "#000000",
		strokeWidth: 1,
		strokeOpacity: 1,
		strokeDasharray: "Solid",
		fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
		fontSize: 11,
		fontFill: "#000000",
		edgeStroke: "#000000",
		edgeFill: "#FFFFFF",
		nsEdgeFill: "#000099",
		edgeStrokeWidth: 1,
		r: 5,
		strokeZone: "#000099",
		strokeZoneWidth: 1,
		strokeZoneDasharray: "Solid",
		text: "",
	}
};

export default FibonacciTimeZone;
