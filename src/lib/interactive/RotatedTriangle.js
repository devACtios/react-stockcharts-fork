

import React, { Component } from "react";
import PropTypes from "prop-types";

import { calcMiddlePointFromArray, isDefined, isNotDefined, noop } from "../utils";
import {
	terminate,
	saveNodeType,
	isHoverForInteractiveType,
	isTouchDevice,
} from "./utils";
import EachRotatedTriangle from "./wrapper/EachRotatedTriangle";
import ClickableCircle from "./components/ClickableCircle";
import MouseLocationIndicator from "./components/MouseLocationIndicator";
import HoverTextNearMouse from "./components/HoverTextNearMouse";

class RotatedTriangle extends Component {
	constructor(props) {
		super(props);

		this.handleStart = this.handleStart.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleDrawTriangle = this.handleDrawTriangle.bind(this);
		this.handleDragTriangle = this.handleDragTriangle.bind(this);
		this.handleDragTriangleComplete = this.handleDragTriangleComplete.bind(this);

		this.terminate = terminate.bind(this);
		this.saveNodeType = saveNodeType.bind(this);

		this.getSelectionState = isHoverForInteractiveType("triangles")
			.bind(this);

		this.nodes = [];
		this.state = {
		};

	}
	handleDragTriangle(index, newXYValue) {
		this.setState({
			override: {
				index,
				...newXYValue
			}
		});
	}
	handleDragTriangleComplete(moreProps) {
		const { override } = this.state;
		const { triangles } = this.props;

		if (isDefined(override)) {
			const { index, ...rest } = override;
			const newTriangles = triangles
				.map((each, idx) => idx === index
					? { ...each, ...rest, selected: true }
					: each);
			this.setState({
				override: null,
			}, () => {
				this.props.onComplete(newTriangles, moreProps);
			});
		}
	}
	handleDrawTriangle(xyValue) {
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
		const { triangles, appearance, type } = this.props;
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
				const newTriangles = [
					...triangles.map(d => ({ ...d, selected: false })),
					{
						type,
						...current,
						selected: true,
						hide: false,
						appearance,
					}
				];

				this.setState({
					current: null,
				}, () => {

					this.props.onComplete(newTriangles, moreProps, e);
				});
			}
		}
	}
	render() {
		const { appearance } = this.props;
		const { enabled } = this.props;
		const { currentPositionRadius, currentPositionStroke } = this.props;
		const { currentPositionOpacity, currentPositionStrokeWidth } = this.props;
		const { triangles, hoverText } = this.props;
		const { current, override } = this.state;
		const overrideIndex = isDefined(override) ? override.index : null;
		const edgeStart = isDefined(current) && isDefined(current.startXY)
			? <g>
				<ClickableCircle
					key="edgeStart"
					show={true}
					cx={current.startXY[0]}
					cy={current.startXY[1]}
					r={appearance.r}
					fill={appearance.edgeFill}
					stroke={appearance.edgeStroke}
					strokeWidth={appearance.edgeStrokeWidth}
					strokeOpacity={1}
				/>
			</g>
			: null;
		const edgeNext = isDefined(current) && isDefined(current.startXY) && isDefined(current.nextXY) && isDefined(current.endXY)
			? <g>
				<ClickableCircle
					key="edgeNext"
					show={true}
					cx={current.nextXY[0]}
					cy={current.nextXY[1]}
					r={appearance.r}
					fill={appearance.edgeFill}
					stroke={appearance.edgeStroke}
					strokeWidth={appearance.edgeStrokeWidth}
					strokeOpacity={1}
				/>
			</g>
			: null;
		const middlePoint = isDefined(current) && isDefined(current.startXY) && isDefined(current.nextXY) && isDefined(current.endXY)
			? <g>
				<ClickableCircle
					key="middlePoint"
					show={true}
					cx={calcMiddlePointFromArray(current.startXY, current.nextXY, current.endXY)[0]}
					cy={calcMiddlePointFromArray(current.startXY, current.nextXY, current.endXY)[1]}
					r={appearance.r}
					fill={appearance.edgeFill}
					stroke={appearance.edgeStroke}
					strokeWidth={appearance.edgeStrokeWidth}
					strokeOpacity={1}
					middlePoint
				/>
			</g>
			: null;
		const tempTriangle = isDefined(current) && isDefined(current.nextXY)
			? <EachRotatedTriangle
				interactive={false}
				{...current}
				appearance={appearance}
				hoverText={hoverText} />
			: null;

		return <g>
			{triangles.map((each, idx) => {
				if (each.hide) return null;

				const eachAppearance = isDefined(each.appearance)
					? { ...appearance, ...each.appearance }
					: appearance;

				return <EachRotatedTriangle key={idx}
					ref={this.saveNodeType(idx)}
					index={idx}
					selected={each.selected}
					hoverText={hoverText}
					{...(idx === overrideIndex ? override : each)}
					appearance={eachAppearance}
					onDrag={this.handleDragTriangle}
					onDragComplete={this.handleDragTriangleComplete}
				/>;
			})}
			{tempTriangle}
			{edgeStart}
			{edgeNext}
			{edgeNext}
			{middlePoint}
			<MouseLocationIndicator
				enabled={enabled}
				snap={false}
				r={currentPositionRadius}
				stroke={currentPositionStroke}
				opacity={currentPositionOpacity}
				strokeWidth={currentPositionStrokeWidth}
				onMouseDown={this.handleStart}
				onClick={this.handleEnd}
				onMouseMove={this.handleDrawTriangle} />
		</g>;
	}
}

RotatedTriangle.propTypes = {
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
	triangles: PropTypes.array.isRequired,

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

RotatedTriangle.defaultProps = {
	type: "ROTATED_TRIANGLE",
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
	triangles: [],
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

export default RotatedTriangle;
