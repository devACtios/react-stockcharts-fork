import React, { Component } from "react";
import PropTypes from "prop-types";

import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";
import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { functor, getLastItem, strokeDashTypes } from "../utils";

class BeaconCoordinate extends Component {

	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
		this.interval = undefined;
		this.state = {
			priceIndicatorStep: 0
		};
		this.updateClassIncrement = this.updateClassIncrement.bind(this);
	}

	componentDidMount() {
		const { beaconInterval } = this.props;
		this.interval = setInterval(this.updateClassIncrement, Number(beaconInterval));
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	updateClassIncrement() {
		const { priceIndicatorStep } = this.state;
		const nextPriceIndicatorStep = (priceIndicatorStep === 25) ? 1 : priceIndicatorStep + 1;
		this.setState({ priceIndicatorStep: nextPriceIndicatorStep });
	}

	drawOnCanvas(ctx, moreProps) {
		const props = helper(this.props, moreProps);
		drawOnCanvas(ctx, props);
	}
	renderSVG(moreProps) {
		const props = helper(this.props, moreProps);
		return renderSVG(props);
	}
	render() {
		const { priceIndicatorStep } = this.state;
		const { className } = this.props;
		return (
			<GenericChartComponent
				className={className + " price-indicator-filter-" + priceIndicatorStep}
				clip={false}
				svgDraw={this.renderSVG}
				canvasDraw={this.drawOnCanvas}
				canvasToDraw={getAxisCanvas}
				drawOn={["pan"]}
			/>
		);
	}
}

BeaconCoordinate.propTypes = {
	className: PropTypes.string,
	displayFormat: PropTypes.func.isRequired,
	yAxisPad: PropTypes.number,
	rectWidth: PropTypes.number,
	rectHeight: PropTypes.number,
	orient: PropTypes.oneOf(["bottom", "top", "left", "right"]),
	at: PropTypes.oneOf(["bottom", "top", "left", "right"]),
	price: PropTypes.number,
	dx: PropTypes.number,
	arrowWidth: PropTypes.number,
	opacity: PropTypes.number,
	lineOpacity: PropTypes.number,
	lineStroke: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	fill: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
	strokeDasharray: PropTypes.oneOf(strokeDashTypes),
	stroke: PropTypes.string,
	strokeOpacity: PropTypes.number,
	strokeWidth: PropTypes.number,
	textFill: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
	text: PropTypes.string,
	chartType: PropTypes.string,
	zoomStep: PropTypes.number,
	tab: PropTypes.object,
	beaconInterval: PropTypes.number
};

BeaconCoordinate.defaultProps = {
	className: "price-indicator",
	yAxisPad: 0,
	rectWidth: 50,
	rectHeight: 20,
	orient: "left",
	at: "left",
	price: 0,
	dx: 0,
	arrowWidth: 0,
	fill: "#BAB8b8",
	opacity: 1,
	lineOpacity: 0.2,
	lineStroke: "#000000",
	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
	fontSize: 13,
	textFill: "#FFFFFF",
	strokeOpacity: 1,
	strokeWidth: 1,
	strokeDasharray: "Solid",
	text: "",
	tab: {},
	beaconInterval: 50,
};

function helper(props, moreProps) {
	const { chartConfig: { yScale }, xScale } = moreProps;
	const [lowerYValue, upperYValue] = yScale.domain();

	const { className, price, stroke, strokeDasharray, strokeOpacity, strokeWidth } = props;
	const { orient, at, rectWidth, rectHeight, dx } = props;
	const { fill, opacity, fontFamily, fontSize, textFill, arrowWidth, lineOpacity, lineStroke } = props;

	let ax = 0;

	if (props.chartType === "OHLC") {
		ax = 0.5;
	} else if (props.chartType === "LINE" || props.chartType === "AREA") {
		if (props.zoom < 0) {
			ax = 0.1 + Math.abs(props.zoom) * 0.2;
		} else if (props.zoom < 10) {
			ax = 0.5;
		} else {
			ax = 0.1;
		}
	}

	let x = xScale(getLastItem(moreProps.fullData, true).idx.index + ax);

	if (props.chartType === "CANDLES" || props.chartType === "HEIKIN_ASHI") {
		const last = moreProps.fullData[moreProps.fullData.length - 1];

		if (moreProps.plotData.indexOf(last) === -1) {
			return false;
		}

		const candleQuery = "#StockChart" + props.tab.key + " .react-stockcharts-candlestick-candle rect:last-child";
		const candle = document.querySelector(candleQuery);

		if (candle) {
			const candleX = candle.getAttribute("x");
			const candleWidth = candle.getAttribute("width");

			if (candleWidth > rectWidth) {
				x = Number(candleX) + Number(candleWidth / 2 + rectWidth) - 1.5;
			} else {
				x = Number(candleX) + Number(candleWidth) + rectWidth / 2;
			}
		} else {
			const lineQuery = "#StockChart" + props.tab.key + " .react-stockcharts-candlestick-candle line:last-child";
			const line = document.querySelector(lineQuery);

			if (line) {
				const candleX = line.getAttribute("x1");
				const candleWidth = Number(line.getAttribute("x2")) - Number(candleX);

				if (candleWidth > rectWidth) {
					x = Number(candleX) + Number(candleWidth / 2 + rectWidth) - 1.5;
				} else {
					x = Number(candleX) + Number(candleWidth) + rectWidth / 2;
				}
			}
		}
	}

	const x1 = x,
		x2 = x;

	const edgeAt = at === "right" ? x : 0;

	const type = "horizontal";

	const y = yScale(price);
	const show = (price <= upperYValue && price >= lowerYValue);

	const hideLine = false;

	const coordinateProps = {
		className: className,
		coordinate: "",
		show: show,
		type: type,
		orient: orient,
		edgeAt: edgeAt,
		hideLine: hideLine,
		lineOpacity: lineOpacity,
		lineStroke: lineStroke,
		lineStrokeDasharray: strokeDasharray,
		stroke: stroke,
		strokeOpacity: strokeOpacity,
		strokeWidth: strokeWidth,
		fill: functor(fill)(""),
		textFill: functor(textFill)(""),
		opacity: opacity,
		fontFamily: fontFamily,
		fontSize: fontSize,
		rectWidth: rectWidth,
		rectHeight: rectHeight,
		rectRadius: 10,
		arrowWidth: arrowWidth,
		dx: dx,
		x1: x1,
		x2: x2,
		y1: y,
		y2: y
	};
	return coordinateProps;
}

export default BeaconCoordinate;
