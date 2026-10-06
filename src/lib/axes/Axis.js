import React, { Component } from "react";
import PropTypes from "prop-types";
import { forceSimulation, forceX, forceCollide } from "d3-force";
import { range as d3Range } from "d3-array";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import AxisZoomCapture from "./AxisZoomCapture";

import { first, last, hexToRGBA, isNotDefined, isDefined, identity, zipper, strokeDashTypes, getStrokeDasharray } from "../utils";

class Axis extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.saveNode = this.saveNode.bind(this);
		this.getMoreProps = this.getMoreProps.bind(this);
	}
	saveNode(node) {
		this.node = node;
	}
	getMoreProps() {
		return this.node.getMoreProps();
	}
	drawOnCanvas(ctx, moreProps) {
		const { showDomain, showTicks, transform, range, getScale } = this.props;

		ctx.save();
		ctx.translate(transform[0], transform[1]);

		if (showDomain) drawAxisLine(ctx, this.props, range);
		if (showTicks) {
			const tickProps = tickHelper(this.props, getScale(moreProps));
			drawTicks(ctx, tickProps);
		}

		ctx.restore();
	}
	renderSVG(moreProps) {
		const { className } = this.props;
		const { showDomain, showProfitScale, showTicks, range, getScale } = this.props;

		const ticksParam = showTicks ? tickHelper(this.props, getScale(moreProps)) : {};

		const ticks = showTicks ? axisTicksSVG(ticksParam) : null;
		const domain = showDomain ? axisLineSVG(this.props, range) : null;
		const profitScale = showProfitScale && showTicks ? profitScaleSVG(this.props, ticksParam.ticks, getScale(moreProps)) : null;
		const profitValueLabel = showProfitScale ? profitValueLabelSVG(this.props, getScale(moreProps)) : null;

		return <g className={className}>
			{profitScale}
			{ticks}
			{domain}
			{profitValueLabel}
		</g>;
	}
	render() {
		const { bg, axisZoomCallback, zoomCursorClassName, zoomEnabled, getScale, inverted, zoomMaxMinControl, minScaleYValue, maxScaleYValue } = this.props;
		const { transform, getMouseDelta, edgeClip } = this.props;
		const { onContextMenu, onDoubleClick } = this.props;

		const zoomCapture = (
			<AxisZoomCapture
				bg={bg}
				getScale={getScale}
				getMoreProps={this.getMoreProps}
				getMouseDelta={getMouseDelta}
				axisZoomCallback={axisZoomCallback}
				zoomCursorClassName={zoomCursorClassName}
				inverted={inverted}
				onContextMenu={onContextMenu}
				onDoubleClick={onDoubleClick}
				zoomEnabled={zoomEnabled}
				zoomMaxMinControl={zoomMaxMinControl}
				minScaleYValue={minScaleYValue}
				maxScaleYValue={maxScaleYValue}
			/>);

		return <g transform={`translate(${ transform[0] }, ${ transform[1] })`}>
			{zoomCapture}
			<GenericChartComponent ref={this.saveNode}
				canvasToDraw={getAxisCanvas}
				clip={false}
				edgeClip={edgeClip}
				svgDraw={this.renderSVG}
				canvasDraw={this.drawOnCanvas}
				drawOn={["pan"]}
			/>
		</g>;
	}
}

Axis.propTypes = {
	innerTickSize: PropTypes.number,
	outerTickSize: PropTypes.number,
	tickFormat: PropTypes.func,
	tickPadding: PropTypes.number,
	tickSize: PropTypes.number,
	ticks: PropTypes.number,
	tickLabelFill: PropTypes.string,
	tickStroke: PropTypes.string,
	tickStrokeOpacity: PropTypes.number,
	tickStrokeWidth: PropTypes.number,
	tickStrokeDasharray: PropTypes.oneOf(strokeDashTypes),
	tickValues: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
	tickInterval: PropTypes.number,
	tickIntervalFunction: PropTypes.func,
	showDomain: PropTypes.bool,
	showTicks: PropTypes.bool,
	className: PropTypes.string,
	axisZoomCallback: PropTypes.func,
	zoomEnabled: PropTypes.bool,
	zoomMaxMinControl: PropTypes.bool,
	minScaleYValue: PropTypes.number,
	maxScaleYValue: PropTypes.number,
	inverted: PropTypes.bool,
	zoomCursorClassName: PropTypes.string,
	transform: PropTypes.arrayOf(PropTypes.number).isRequired,
	range: PropTypes.arrayOf(PropTypes.number).isRequired,
	getMouseDelta: PropTypes.func.isRequired,
	getScale: PropTypes.func.isRequired,
	bg: PropTypes.object.isRequired,
	edgeClip: PropTypes.bool.isRequired,
	onContextMenu: PropTypes.func,
	onDoubleClick: PropTypes.func,
	showProfitScale: PropTypes.bool,
	profitScaleView: PropTypes.oneOf(["ticks", "solid"]),
	profitScaleActive: PropTypes.bool,
	showProfitPercent: PropTypes.bool,
	profitLabelPadding: PropTypes.number,
	profitTickMargin: PropTypes.number,
	profitMainTickWidth: PropTypes.number,
	profitTickWidth: PropTypes.number,
	profitTickHeight: PropTypes.number,
	profitTickRadius: PropTypes.number,
	profitTickColor: PropTypes.string,
	profitZeroValue: PropTypes.number,
	profitPostiveValue: PropTypes.number,
	profitNegativeValue: PropTypes.number,
	profitPostiveColor: PropTypes.string,
	profitNegativeColor: PropTypes.string,
	getProfitLabel: PropTypes.func,
};

Axis.defaultProps = {
	zoomCursorClassName: "",
	edgeClip: false,
	profitScaleView: "ticks",
	profitPostiveValue: Infinity,
	profitNegativeValue: Number.NEGATIVE_INFINITY,
	getProfitLabel: () => {},
};

function tickHelper(props, scale) {
	const {
		bg, orient, innerTickSize, tickFormat, tickPadding,
		tickLabelFill, tickStrokeWidth, tickStrokeDasharray,
		fontSize, fontFamily, fontWeight, showTicks, flexTicks,
		profitMainTickWidth, profitLabelPadding,
		showTickLabel, showProfitScale, showProfitPercent
	} = props;
	const {
		ticks: tickArguments, tickValues: tickValuesProp,
		tickStroke, tickStrokeOpacity, tickInterval, tickIntervalFunction,
		getProfitLabel
	} = props;

	let tickValues;
	if (isDefined(tickValuesProp)) {
		if (typeof tickValuesProp === "function") {
			tickValues = tickValuesProp(scale.domain());
		} else {
			tickValues = tickValuesProp;
		}
	} else if (isDefined(tickInterval)) {
		const [min, max] = scale.domain();
		const baseTickValues = d3Range(min, max, (max - min) / tickInterval);

		tickValues = tickIntervalFunction
			? tickIntervalFunction(min, max, tickInterval)
			: baseTickValues;
	} else if (isDefined(scale.ticks)) {
		tickValues = scale.ticks(tickArguments, flexTicks);
	} else {
		tickValues = scale.domain();
	}

	const baseFormat = scale.tickFormat
		? scale.tickFormat(tickArguments)
		: identity;

	const format = isNotDefined(tickFormat)
		? baseFormat
		: d => tickFormat(d) || "";

	const sign = orient === "top" || orient === "left" ? -1 : 1;
	const tickSpacing = Math.max(innerTickSize, 0) + tickPadding;

	let ticks, dy, canvas_dy, profitLabelDy, textAnchor;

	if (orient === "bottom" || orient === "top") {
		dy = sign < 0 ? "0em" : ".71em";
		canvas_dy = sign < 0 ? 0 : (fontSize * .71);
		textAnchor = "middle";

		ticks = tickValues.map(d => {
			const x = Math.round(scale(d));
			return {
				value: d,
				x1: x,
				y1: 0,
				x2: x,
				y2: sign * innerTickSize,
				labelX: x,
				labelY: sign * tickSpacing,
			};
		});

		if (showTicks && flexTicks) {

			const nodes = ticks.map(d => ({ id: d.value, value: d.value, fy: d.y2, origX: d.x1 }));

			const simulation = forceSimulation(nodes)
				.force("x", forceX(d => d.origX).strength(1))
				.force("collide", forceCollide(22))
				.stop();

			for (let i = 0; i < 100; ++i) simulation.tick();

			const zip = zipper()
				.combine((a, b) => {
					if (Math.abs(b.x - b.origX) > 0.01) {
						return {
							...a,
							x2: b.x,
							labelX: b.x
						};
					}
					return a;
				});

			ticks = zip(ticks, nodes);
		}


	} else {
		ticks = tickValues.map(d => {
			const y = Math.round(scale(d));
			const profitLabel = showProfitScale && showProfitPercent ? getProfitLabel(d) : "";

			return {
				value: d,
				profitLabel,
				x1: 0,
				y1: y,
				x2: sign * innerTickSize,
				y2: y,
				labelX: showProfitScale ? bg.w - profitMainTickWidth - profitLabelPadding : sign * tickSpacing,
				labelY: y,
				tickLabelOpacity: getTickOpacity(props, d),
				tickLabelFill: getProfitTickColor(props, d, d, tickLabelFill || tickStroke),
			};
		});

		dy = showProfitScale && showProfitPercent ? "-.20em" : ".32em";
		profitLabelDy = "1em";
		canvas_dy = (fontSize * .32);
		textAnchor = sign < 0 ? "end" : "start";

		if (showProfitScale) {
			textAnchor = "end";
		}
	}

	return {
		ticks, scale, tickStroke,
		tickLabelFill: (tickLabelFill || tickStroke),
		tickStrokeOpacity,
		tickStrokeWidth,
		tickStrokeDasharray,
		dy,
		canvas_dy,
		profitLabelDy,
		textAnchor,
		fontSize,
		fontFamily,
		fontWeight,
		format,
		showTickLabel,
	};
}

function getTickOpacity(props, tickValue, defaultOpacity = "1") {
	const { profitScaleActive } = props;
	const { profitZeroValue, profitPostiveValue, profitNegativeValue } = props;

	if (!profitScaleActive || !isDefined(profitZeroValue)) {
		return defaultOpacity;
	}

	if (tickValue >= profitZeroValue && isFinite(profitPostiveValue)) {
		return ".2";
	}

	if (tickValue < profitZeroValue && isFinite(profitNegativeValue)) {
		return ".2";
	}

	return defaultOpacity;
}

/* eslint-disable react/prop-types */
function axisLineSVG(props, range) {
	const { orient, outerTickSize } = props;
	const { domainClassName, fill, stroke, strokeWidth, opacity } = props;

	const sign = orient === "top" || orient === "left" ? -1 : 1;

	let d;

	if (orient === "bottom" || orient === "top") {
		d = "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize;
	} else {
		d = "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize;
	}

	return (
		<path
			className={domainClassName}
			d={d}
			fill={fill}
			opacity={opacity}
			stroke={stroke}
			strokeWidth={strokeWidth} >
		</path>
	);
}
/* eslint-enable react/prop-types */


function drawAxisLine(ctx, props, range) {
	const { orient, outerTickSize, stroke, strokeWidth, opacity } = props;

	const sign = orient === "top" || orient === "left" ? -1 : 1;
	const xAxis = (orient === "bottom" || orient === "top");

	ctx.lineWidth = strokeWidth;
	ctx.strokeStyle = hexToRGBA(stroke, opacity);

	ctx.beginPath();

	if (xAxis) {
		ctx.moveTo(first(range), sign * outerTickSize);
		ctx.lineTo(first(range), 0);
		ctx.lineTo(last(range), 0);
		ctx.lineTo(last(range), sign * outerTickSize);
	} else {
		ctx.moveTo(sign * outerTickSize, first(range));
		ctx.lineTo(0, first(range));
		ctx.lineTo(0, last(range));
		ctx.lineTo(sign * outerTickSize, last(range));
	}
	ctx.stroke();
}

function Tick(props) {
	const {
		tickLabelFill, tickStroke, tickStrokeOpacity, tickStrokeDasharray,
		tickStrokeWidth, textAnchor, fontSize, fontFamily, fontWeight, tickLabelOpacity,
		profitLabel
	} = props;
	const { x1, y1, x2, y2, labelX, labelY, dy, profitLabelDy } = props;

	return (
		<g className="tick">
			<line
				shapeRendering="crispEdges"
				opacity={tickStrokeOpacity}
				stroke={tickStroke}
				strokeWidth={tickStrokeWidth}
				strokeDasharray={getStrokeDasharray(tickStrokeDasharray)}
				x1={x1} y1={y1}
				x2={x2} y2={y2}
			/>
			<TickLabel
				labelX={labelX}
				labelY={labelY}
				dy={dy}
				fontFamily={fontFamily}
				fontSize={fontSize}
				fontWeight={fontWeight}
				textAnchor={textAnchor}
				tickLabelFill={tickLabelFill}
				tickLabelOpacity={tickLabelOpacity}
				profitLabel={profitLabel}
				profitLabelDy={profitLabelDy}
			>
				{props.children}
			</TickLabel>
		</g>
	);
}

Tick.propTypes = {
	children: PropTypes.string.isRequired,
	x1: PropTypes.number.isRequired,
	y1: PropTypes.number.isRequired,
	x2: PropTypes.number.isRequired,
	y2: PropTypes.number.isRequired,
	labelX: PropTypes.number.isRequired,
	labelY: PropTypes.number.isRequired,
	dy: PropTypes.string.isRequired,
	tickStroke: PropTypes.string,
	tickLabelFill: PropTypes.string,
	tickLabelOpacity: PropTypes.string,
	tickStrokeWidth: PropTypes.number,
	tickStrokeOpacity: PropTypes.number,
	tickStrokeDasharray: PropTypes.oneOf(strokeDashTypes),
	textAnchor: PropTypes.string,
	fontSize: PropTypes.number,
	fontFamily: PropTypes.string,
	fontWeight: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	profitLabel: PropTypes.string,
	profitLabelDy: PropTypes.string,
};

function TickLabel(props) {
	const {
		tickLabelFill, textAnchor, fontSize, fontFamily,
		fontWeight, tickLabelOpacity, profitLabel
	} = props;
	const { labelX, labelY, dy, profitLabelDy } = props;

	return (
		<g className="tick-label">
			<text
				dy={dy}
				x={labelX}
				y={labelY}
				fill={tickLabelFill}
				fillOpacity={tickLabelOpacity}
				fontSize={fontSize}
				fontWeight={fontWeight}
				fontFamily={fontFamily}
				textAnchor={textAnchor}
			>
				{props.children}
			</text>
			{profitLabel &&
			<text
				dy={profitLabelDy}
				x={labelX}
				y={labelY}
				fill={tickLabelFill}
				fillOpacity={tickLabelOpacity}
				fontSize={fontSize}
				fontWeight={fontWeight}
				fontFamily={fontFamily}
				textAnchor={textAnchor}
			>
				{profitLabel}
			</text>}
		</g>
	);
}

TickLabel.propTypes = {
	children: PropTypes.string.isRequired,
	labelX: PropTypes.number.isRequired,
	labelY: PropTypes.number.isRequired,
	dy: PropTypes.string.isRequired,
	tickLabelFill: PropTypes.string,
	tickLabelOpacity: PropTypes.string,
	textAnchor: PropTypes.string,
	fontSize: PropTypes.number,
	fontFamily: PropTypes.string,
	fontWeight: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	profitLabel: PropTypes.string,
	profitLabelDy: PropTypes.string,
};

function axisTicksSVG(tickParams) {
	const { tickLabelFill, tickStroke, tickStrokeOpacity, tickStrokeWidth, tickStrokeDasharray, textAnchor } = tickParams;
	const { fontSize, fontFamily, fontWeight, ticks, format } = tickParams;

	const { dy, profitLabelDy } = tickParams;

	return (
		<g>
			{ticks.map((tick, idx) => {
				return (
					<Tick
						key={idx}
						tickStroke={tickStroke}
						tickLabelFill={tick.tickLabelFill || tickLabelFill}
						tickLabelOpacity={tick.tickLabelOpacity}
						tickStrokeWidth={tickStrokeWidth}
						tickStrokeOpacity={tickStrokeOpacity}
						tickStrokeDasharray={tickStrokeDasharray}
						dy={dy}
						x1={tick.x1} y1={tick.y1}
						x2={tick.x2} y2={tick.y2}
						labelX={tick.labelX} labelY={tick.labelY}
						textAnchor={textAnchor}
						fontSize={fontSize}
						fontWeight={fontWeight}
						fontFamily={fontFamily}
						profitLabel={tick.profitLabel}
						profitLabelDy={profitLabelDy}
					>
						{format(tick.value)}
					</Tick>
				);
			})}
		</g>
	);
}

function drawTicks(ctx, result) {

	const { tickStroke, tickStrokeOpacity, tickLabelFill } = result;
	const { textAnchor, fontSize, fontFamily, fontWeight, ticks, showTickLabel } = result;

	ctx.strokeStyle = hexToRGBA(tickStroke, tickStrokeOpacity);

	ctx.fillStyle = tickStroke;

	ticks.forEach((tick) => {
		drawEachTick(ctx, tick, result);
	});

	ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
	ctx.fillStyle = tickLabelFill;
	ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

	if (showTickLabel) {
		ticks.forEach((tick) => {
			drawEachTickLabel(ctx, tick, result);
		});
	}
}

function drawEachTick(ctx, tick, result) {
	const { tickStrokeWidth, tickStrokeDasharray } = result;

	ctx.beginPath();

	ctx.moveTo(tick.x1, tick.y1);
	ctx.lineTo(tick.x2, tick.y2);
	ctx.lineWidth = tickStrokeWidth;
	ctx.setLineDash(getStrokeDasharray(tickStrokeDasharray).split(","));
	ctx.stroke();
}

function drawEachTickLabel(ctx, tick, result) {
	const { canvas_dy, format } = result;

	ctx.beginPath();
	ctx.fillText(format(tick.value), tick.labelX, tick.labelY + canvas_dy);
}

function profitScaleHelper(props, ticks, scale) {
	const { profitScaleView } = props;

	switch (profitScaleView) {
		case "solid": {
			return profitScaleSolidHelper(props, ticks, scale);
		}

		case "ticks":
		default: {
			return profitScaleTickHelper(props, ticks, scale);
		}
	}
}

function profitScaleSolidHelper(props, ticks, scale) {
	const { bg } = props;
	const { profitTickWidth } = props;
	const { profitZeroValue, profitPostiveValue, profitNegativeValue } = props;
	const profitTicks = [];

	const x = bg.w - profitTickWidth;

	const zeroY = profitZeroValue ? Math.round(scale(profitZeroValue)) : undefined;
	const positiveY = Math.max(isFinite(profitPostiveValue) ? Math.round(scale(profitPostiveValue)) : 0, 0);
	const negativeY = Math.min(isFinite(profitNegativeValue) ? Math.round(scale(profitNegativeValue)) : bg.h, bg.h);

	profitTicks.push({
		x,
		y: 0,
		width: profitTickWidth,
		height: bg.h,
		fill: "url(#profitScaleSolidGradient)",
		opacity: 1,
	});

	return {
		profitTicks,
		zeroPercent: isFinite(zeroY) ? zeroY * 100 / bg.h : null,
		positivePercent: profitPostiveValue && profitPostiveValue >= profitZeroValue ? positiveY * 100 / bg.h : null,
		negativePercent: profitNegativeValue && profitNegativeValue <= profitZeroValue ? negativeY * 100 / bg.h : null,
	};
}

function profitScaleTickHelper(props, ticks, scale) {
	const { bg } = props;
	const { profitTickColor, profitMainTickWidth, profitTickWidth, profitTickHeight, profitTickMargin } = props;
	const { profitZeroValue, profitPostiveValue, profitNegativeValue } = props;
	const profitTicks = [];

	const mainX = bg.w - profitMainTickWidth;
	const x = bg.w - profitTickWidth;

	const zeroY = profitZeroValue ? Math.round(scale(profitZeroValue)) : null;
	const positiveY = Math.max(isFinite(profitPostiveValue) ? Math.round(scale(profitPostiveValue)) : 0, 0);
	const negativeY = Math.min(isFinite(profitNegativeValue) ? Math.round(scale(profitNegativeValue)) : bg.h, bg.h);

	for (let i = ticks.length - 1; i >= 1; i--) {
		const height = ticks[i - 1].y1 - ticks[i].y1;
		const tickCount = Math.floor(height / (profitTickHeight + profitTickMargin)) - 1;

		const tickMargin = calcProfitScaleTickMargin({
			height,
			tickHeight: profitTickHeight,
			tickMargin: profitTickMargin,
		});

		let y = ticks[i].y1 - profitTickHeight / 2;

		if (i === ticks.length - 1) {
			while ((y = +(y - profitTickHeight - tickMargin).toFixed(2)) > 0) {
				profitTicks.push({
					x,
					y,
					width: profitTickWidth,
					height: profitTickHeight,
					fill: getProfitTickColor(props, scale.invert(y + profitTickHeight), scale.invert(y), profitTickColor),
					opacity: getProfitTickOpacity(props, y, zeroY, positiveY, negativeY),
				});
			}
		}

		y = ticks[i].y1 - profitTickHeight / 2;

		profitTicks.push({
			x: mainX,
			y,
			width: profitMainTickWidth,
			height: profitTickHeight,
			fill: getProfitTickColor(props, scale.invert(y + profitTickHeight), scale.invert(y), profitTickColor),
			opacity: getProfitTickOpacity(props, y, zeroY, positiveY, negativeY),
		});

		for (let j = 1; j <= tickCount; j++) {
			y = +(y + profitTickHeight + tickMargin).toFixed(2);

			profitTicks.push({
				x,
				y,
				width: profitTickWidth,
				height: profitTickHeight,
				fill: getProfitTickColor(props, scale.invert(y + profitTickHeight), scale.invert(y), profitTickColor),
				opacity: getProfitTickOpacity(props, y, zeroY, positiveY, negativeY),
			});
		}

		if (i === 1) {
			y = ticks[0].y1 - profitTickHeight  / 2;

			profitTicks.push({
				x: mainX,
				y: y,
				width: profitMainTickWidth,
				height: profitTickHeight,
				fill: getProfitTickColor(props, scale.invert(y + profitTickHeight), scale.invert(y), profitTickColor),
				opacity: getProfitTickOpacity(props, y, zeroY, positiveY, negativeY),
			});

			while ((y = +(y + profitTickHeight + tickMargin).toFixed(2)) < bg.h) {
				profitTicks.push({
					x,
					y,
					width: profitTickWidth,
					height: profitTickHeight,
					fill: getProfitTickColor(props, scale.invert(y + profitTickHeight), scale.invert(y), profitTickColor),
					opacity: getProfitTickOpacity(props, y, zeroY, positiveY, negativeY),
				});
			}
		}
	}

	return {
		profitTicks,
	};
}

function calcProfitScaleTickMargin({ height, tickHeight, tickMargin }) {
	const tickFullHeight = tickHeight + tickMargin;

	if (height % tickFullHeight) {
		const tickCount = Math.floor(height / tickFullHeight);
		return +((height - tickCount * tickHeight) / tickCount).toFixed(2);
	}

	return tickMargin;
}

function getProfitTickColor(props, tickBegin, tickEnd, defaultColor) {
	const { profitScaleActive } = props;
	const { profitZeroValue, profitPostiveValue, profitNegativeValue } = props;
	const { profitPostiveColor, profitNegativeColor } = props;

	if (!profitScaleActive || !isDefined(profitZeroValue)) {
		return defaultColor;
	}

	if (tickEnd >= profitZeroValue && tickBegin <= profitPostiveValue) {
		return profitPostiveColor;
	}

	if (tickEnd < profitZeroValue && tickEnd >= profitNegativeValue) {
		return profitNegativeColor;
	}

	return defaultColor;
}

function getProfitTickOpacity(props, y, zeroY, positiveY, negativeY) {
	const { profitScaleActive } = props;

	if (!profitScaleActive || !isDefined(zeroY) || y < positiveY || y > negativeY) {
		return "100%";
	}

	const profitY = y >= zeroY ? negativeY : positiveY;
	const distancePercent = Math.round(Math.abs((y - zeroY) * 100 / (profitY - zeroY)));
	const opacity = (Math.ceil(distancePercent / 5) * 5) + 10;

	return `${opacity <= 100 ? opacity : 100}%`;
}

function profitScaleSolidGradiendSVG(props, params) {
	const { profitScaleView } = props;
	const { profitTickColor, profitPostiveColor, profitNegativeColor } = props;
	const { zeroPercent, positivePercent, negativePercent } = params;

	if (profitScaleView !== "solid") {
		return null;
	}

	return (
		<linearGradient id="profitScaleSolidGradient" x1="0" y1="0" x2="0" y2="100%">
			<stop offset="0%" stopColor={profitTickColor} stopOpacity="1" />
			{positivePercent !== null &&
			<React.Fragment>
				<stop offset={`${positivePercent - 0.01}%`} stopColor={profitTickColor} stopOpacity="1" />
				<stop offset={`${positivePercent}%`} stopColor={profitPostiveColor} stopOpacity="1" />
				<stop offset={`${zeroPercent}%`} stopColor={profitPostiveColor} stopOpacity="0" />
			</React.Fragment>}
			{zeroPercent !== null &&
			<stop offset={`${zeroPercent}%`} stopColor={profitTickColor} stopOpacity="1" />}
			{negativePercent !== null &&
			<React.Fragment>
				<stop offset={`${zeroPercent}%`} stopColor={profitNegativeColor} stopOpacity="0" />
				<stop offset={`${negativePercent}%`} stopColor={profitNegativeColor} stopOpacity="1" />
				<stop offset={`${negativePercent + 0.01}%`} stopColor={profitTickColor} stopOpacity="1" />
			</React.Fragment>}
			<stop offset="100%" stopColor={profitTickColor} stopOpacity="1" />
		</linearGradient>
	);
}

function profitScaleSVG(props, ticks, scale) {
	const result = profitScaleHelper(props, ticks, scale);

	const { profitTicks } = result;
	const { profitTickRadius } = props;

	return (
		<g className="profit-scale">
			{profitScaleSolidGradiendSVG(props, result)}
			{profitTicks.map((tick, key) => (
				<rect
					key={key}
					x={tick.x}
					y={tick.y}
					width={tick.width}
					height={tick.height}
					rx={profitTickRadius}
					ry={profitTickRadius}
					fill={tick.fill}
					opacity={tick.opacity}
				/>
			))}
		</g>
	);
}

function profitValueLabelHelper(props, scale) {
	const { bg, tickLabelFill, tickStroke, ticks: tickArguments, tickFormat } = props;
	const { fontSize, fontFamily, fontWeight } = props;
	const { profitPostiveValue, profitNegativeValue } = props;
	const { profitMainTickWidth, profitLabelPadding } = props;
	const { getProfitLabel } = props;

	const baseFormat = scale.tickFormat ? scale.tickFormat(tickArguments) : identity;
	const format = isNotDefined(tickFormat) ? baseFormat : d => tickFormat(d) || "";

	const profitValues = [profitPostiveValue, profitNegativeValue].filter(v => {
		if (!isFinite(v)) return false;
		const y = scale(v);
		return y >= 0 && y <= bg.h;
	});

	const profitValueLabels = profitValues.map(v => {
		const y = Math.round(scale(v));

		return {
			value: v,
			profitLabel: getProfitLabel(v),
			labelX: bg.w - profitMainTickWidth - profitLabelPadding,
			labelY: y,
			dy: "-.20em",
			profitLabelDy: "1em",
			textAnchor: "end",
			tickLabelFill: getProfitTickColor(props, v, v, tickLabelFill || tickStroke),
		};
	});

	return {
		profitValueLabels,
		fontSize,
		fontFamily,
		fontWeight,
		format
	};
}

function profitValueLabelSVG(props, scale) {
	const result = profitValueLabelHelper(props, scale);

	const { profitValueLabels } = result;
	const { fontSize, fontFamily, fontWeight, format } = result;

	return (
		<g>
			{profitValueLabels.map((profitValueLabel, key) => (
				<TickLabel
					key={key}
					labelX={profitValueLabel.labelX}
					labelY={profitValueLabel.labelY}
					dy={profitValueLabel.dy}
					fontFamily={fontFamily}
					fontSize={fontSize}
					fontWeight={fontWeight}
					textAnchor={profitValueLabel.textAnchor}
					tickLabelFill={profitValueLabel.tickLabelFill}
					tickLabelOpacity={profitValueLabel.tickLabelOpacity}
					profitLabel={profitValueLabel.profitLabel}
					profitLabelDy={profitValueLabel.profitLabelDy}
				>
					{format(profitValueLabel.value)}
				</TickLabel>
			))}
		</g>
	);
}

export default Axis;
