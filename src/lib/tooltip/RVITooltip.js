

import React, { Component } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class RVITooltip extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}
	renderSVG(moreProps) {
		const { onClick, displayFormat, yAccessor, options, textFill, labelFill } = this.props;
		const { displayValuesFor } = this.props;

		const { chartConfig: { width, height } } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);

		let signalline, line;
		signalline = line = "n/a";

		if (isDefined(currentItem)
				&& isDefined(yAccessor(currentItem))) {
			const item = yAccessor(currentItem);
			signalline = displayFormat(item.signalline);
			line = displayFormat(item.line);
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const { label, windowSize, movingAverageType, windowSizeSignal, movingAverageTypeSignal } = options;
		const tooltipLabel = `${label}(${ windowSize } ${ movingAverageType } ${ windowSizeSignal } ${movingAverageTypeSignal}): `;
		const tooltipValue = `${ signalline }, ${ line }`;

		return (
			<g transform={`translate(${ x }, ${ y })`}
				className={this.props.className} onClick={onClick}>
				<ToolTipText x={0} y={0}
					fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}>
					<ToolTipTSpanLabel fill={labelFill}>{tooltipLabel}</ToolTipTSpanLabel>
					<tspan fill={textFill}>{tooltipValue}</tspan>
				</ToolTipText>
			</g>
		);
	}
	render() {
		return <GenericChartComponent
			clip={false}
			svgDraw={this.renderSVG}
			drawOn={["mousemove"]}
		/>;
	}
}

RVITooltip.propTypes = {
	className: PropTypes.string,
	yAccessor: PropTypes.func.isRequired,
	displayValuesFor: PropTypes.func,
	displayFormat: PropTypes.func.isRequired,
	origin: PropTypes.array.isRequired,
	onClick: PropTypes.func,
	options: PropTypes.shape({
		windowSize: PropTypes.number.isRequired,
		label: PropTypes.any,
		movingAverageType: PropTypes.any,
		windowSizeSignal: PropTypes.any,
		movingAverageTypeSignal: PropTypes.any,
	}).isRequired,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
};

RVITooltip.defaultProps = {
	className: "react-stockcharts-tooltip react-stockcharts-rvi-tooltip",
	displayFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 10],
};

export default RVITooltip;
