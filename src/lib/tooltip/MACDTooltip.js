

import { format } from "d3-format";
import React from "react";
import PropTypes from "prop-types";

import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";
import { functor } from "../utils";
import AToolTip from "./ATooltip";

class MACDTooltip extends AToolTip {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.throwDataset = this.throwDataset.bind(this);
	}
	renderSVG(moreProps) {
		const { onClick, fontFamily, fontSize, displayFormat, className } = this.props;
		const { yAccessor, options, appearance, labelFill } = this.props;
		const { displayValuesFor } = this.props;

		const { chartConfig: { width, height } } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);
		const macdValue = currentItem && yAccessor(currentItem);

		const macd = (macdValue && macdValue.macd && displayFormat(macdValue.macd)) || "n/a";
		const signal = (macdValue && macdValue.signal && displayFormat(macdValue.signal)) || "n/a";
		const divergence = (macdValue && macdValue.divergence && displayFormat(macdValue.divergence)) || "n/a";

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const dataset = this.getDataSet();

		return (
			<g className={className} transform={`translate(${ x }, ${ y })`} onClick={onClick} {...dataset}>
				<ToolTipText x={0} y={0}
					setDataset={this.throwDataset}
					fontFamily={fontFamily} fontSize={fontSize}>
					<ToolTipTSpanLabel
						setDataset={this.throwDataset}
						fill={labelFill}>MACD (</ToolTipTSpanLabel>
					<tspan fill={appearance.stroke.macd} {...dataset}>{options.slow}</tspan>
					<ToolTipTSpanLabel
						setDataset={this.throwDataset}
						fill={labelFill} {...dataset}>, </ToolTipTSpanLabel>
					<tspan fill={appearance.stroke.macd} {...dataset}>{options.fast}</tspan>
					<ToolTipTSpanLabel
						setDataset={this.throwDataset}
						fill={labelFill}>): </ToolTipTSpanLabel>
					<tspan fill={appearance.stroke.macd} {...dataset}>{macd}</tspan>
					<ToolTipTSpanLabel
						setDataset={this.throwDataset}
						fill={labelFill}> Signal (</ToolTipTSpanLabel>
					<tspan fill={appearance.stroke.signal} {...dataset}>{options.signal}</tspan>
					<ToolTipTSpanLabel
						setDataset={this.throwDataset}
						fill={labelFill}>): </ToolTipTSpanLabel>
					<tspan fill={appearance.stroke.signal} {...dataset}>{signal}</tspan>
					<ToolTipTSpanLabel
						setDataset={this.throwDataset}
						fill={labelFill}> Divergence: </ToolTipTSpanLabel>
					<tspan fill={appearance.fill.divergence} {...dataset}>{divergence}</tspan>
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

MACDTooltip.propTypes = {
	origin: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.func
	]).isRequired,
	className: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	labelFill: PropTypes.string,

	yAccessor: PropTypes.func.isRequired,
	options: PropTypes.shape({
		slow: PropTypes.number.isRequired,
		fast: PropTypes.number.isRequired,
		signal: PropTypes.number.isRequired,
	}).isRequired,
	appearance: PropTypes.shape({
		stroke: {
			macd: PropTypes.string.isRequired,
			signal: PropTypes.string.isRequired,
		}.isRequired,
		fill: PropTypes.shape({
			divergence: PropTypes.string.isRequired,
		}).isRequired,
	}).isRequired,
	displayFormat: PropTypes.func.isRequired,
	displayValuesFor: PropTypes.func,
	onClick: PropTypes.func,
	setDataset: PropTypes.func,
};

MACDTooltip.defaultProps = {
	origin: [0, 0],
	displayFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	className: "react-stockcharts-tooltip",
};

export default MACDTooltip;
