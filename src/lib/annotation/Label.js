

import React, { Component } from "react";
import PropTypes from "prop-types";
import GenericComponent from "../GenericComponent";

import { functor } from "../utils";
import LabelAnnotation, { defaultProps } from "./LabelAnnotation";
import ChartContext from "../ChartContext";

class Label extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}

	render() {
		return <GenericComponent
			canvasToDraw={this.props.selectCanvas}
			svgDraw={this.renderSVG}
			drawOn={[]}
		/>;
	}
	renderSVG(moreProps) {
		const { chartConfig } = moreProps;

		return <LabelAnnotation yScale={getYScale(chartConfig)} {...this.props} text={getText(this.props)}/>;
	}
}

function getText(props) {
	return functor(props.text)(props);
}

function getYScale(chartConfig) {
	return Array.isArray(chartConfig) ? undefined : chartConfig.yScale;
}

Label.propTypes = {
	className: PropTypes.string,
	selectCanvas: PropTypes.func,
	text: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.func
	]).isRequired,
	textAnchor: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	opacity: PropTypes.number,
	rotate: PropTypes.number,
	onClick: PropTypes.func,
	xAccessor: PropTypes.func,
	xScale: PropTypes.func,
	yScale: PropTypes.func,
	datum: PropTypes.object,
	x: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.func
	]),
	y: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.func
	])
};

Label.contextType = ChartContext;

Label.defaultProps = {
	...defaultProps,
	selectCanvas: canvases => canvases.bg,
};

export default Label;
