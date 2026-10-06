

import React, { Component } from "react";
import PropTypes from "prop-types";

import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";
import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";

import { functor, isNotDefined } from "../utils";

class CustomPriceCoordinate extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.drawOnCanvas = this.drawOnCanvas.bind(this);
	}
	drawOnCanvas(ctx, moreProps) {
		const props = helper(this.props, moreProps);
		if (isNotDefined(props)) return null;

		drawOnCanvas(ctx, props);
	}
	renderSVG(moreProps) {
		const props = helper(this.props, moreProps);
		if (isNotDefined(props)) return null;

		return renderSVG(props);
	}
	render() {
		return <GenericChartComponent
			clip={false}
			svgDraw={this.renderSVG}
			canvasDraw={this.drawOnCanvas}
			canvasToDraw={getMouseCanvas}
			drawOn={["mousemove", "pan", "drag"]}
		/>;
	}
}

CustomPriceCoordinate.propTypes = {
	displayFormat: PropTypes.func.isRequired,
	yAxisPad: PropTypes.number,
	rectWidth: PropTypes.number,
	rectHeight: PropTypes.number,
	orient: PropTypes.oneOf(["bottom", "top", "left", "right"]),
	at: PropTypes.oneOf(["bottom", "top", "left", "right"]),
	dx: PropTypes.number,
	fill: PropTypes.string,
	opacity: PropTypes.number,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	textFill: PropTypes.string,
};

CustomPriceCoordinate.defaultProps = {
	yAxisPad: 0,
	rectWidth: 50,
	rectHeight: 20,
	rectRadius: 0,
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
	showRectPrice: true
};

function helper(props, moreProps) {
	const width = moreProps.width;
	const yScale = moreProps.chartConfig.yScale;
	const [lowerYValue, upperYValue] = yScale.domain();

	const price = props.price,
		text = props.text,
		stroke = props.stroke,
		strokeDasharray = props.strokeDasharray,
		strokeOpacity = props.strokeOpacity,
		strokeWidth = props.strokeWidth;
	const orient = props.orient,
		at = props.at,
		rectWidth = props.rectWidth,
		rectHeight = props.rectHeight,
		rectRadius = props.rectRadius,
		displayFormat = props.displayFormat,
		dx = props.dx;
	const fill = props.fill,
		opacity = props.opacity,
		fontFamily = props.fontFamily,
		fontSize = props.fontSize,
		textFill = props.textFill,
		arrowWidth = props.arrowWidth,
		lineOpacity = props.lineOpacity,
		lineStroke = props.lineStroke;


	const x1 = 0,
		x2 = width;
	const edgeAt = at === "right" ? width : 0;

	const type = "horizontal";

	const y = yScale(price);
	const show = price <= upperYValue && price >= lowerYValue;

	const coordinate = displayFormat(yScale.invert(y));
	const hideLine = false;

	const coordinateProps = {
		coordinate: (props.showRectPrice) ? (text ? text + " " : "") + coordinate : "",
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
		fill: functor(fill)(text + price),
		textFill: functor(textFill)(text + price),
		opacity: opacity, fontFamily: fontFamily, fontSize: fontSize,
		rectWidth: (props.showRectPrice) ? rectWidth : 0,
		rectHeight: (props.showRectPrice) ? rectHeight : 0,
		rectRadius: rectRadius,
		arrowWidth: arrowWidth,
		dx: dx,
		x1: x1,
		x2: x2,
		y1: y,
		y2: y
	};

	return coordinateProps;
}

export default CustomPriceCoordinate;
