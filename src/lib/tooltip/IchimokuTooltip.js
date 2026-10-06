

import React from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import AToolTip from "./ATooltip";
import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class IchimokuTooltip extends AToolTip {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
		this.throwDataset = this.throwDataset.bind(this);
	}
	renderSVG(moreProps) {
		const { onClick, displayFormat, yAccessor, options, textFill, labelFill } = this.props;
		const { displayValuesFor } = this.props;

		const { chartConfig: { width, height } } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);

		let tenkan, kijun, senkou_a, senkou_b, chikou;
		tenkan = kijun = senkou_a = senkou_b = chikou = "n/a";

		if (isDefined(currentItem)
				&& isDefined(yAccessor(currentItem))) {
			const item = yAccessor(currentItem);
			tenkan = displayFormat(item.tenkan);
			kijun = displayFormat(item.kijun);
			senkou_a = displayFormat(item.senkou_a);
			senkou_b = displayFormat(item.senkou_b);
			chikou = displayFormat(item.chikou);
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);

		const { label, tenkanPeriod, kijunPeriod, senkouPeriod } = options;

		const tooltipLabel = `${label}(${ tenkanPeriod }, ${ kijunPeriod }, ${ senkouPeriod }): `;
		const tooltipValue = `tenkan ${ tenkan }, kijun ${ kijun }, senkou_a ${ senkou_a },senkou_b ${ senkou_b },chikou ${ chikou }`;

		const dataset = this.getDataSet();

		return (
			<g transform={`translate(${ x }, ${ y })`}
				className={this.props.className} onClick={onClick} {...dataset}>
				<ToolTipText x={0} y={0}
					setDataset={this.throwDataset}
					fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}>
					<ToolTipTSpanLabel
						fill={labelFill}
						setDataset={this.throwDataset}>{tooltipLabel}</ToolTipTSpanLabel>
					<tspan fill={textFill} {...dataset}>{tooltipValue}</tspan>
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

IchimokuTooltip.propTypes = {
	className: PropTypes.string,
	yAccessor: PropTypes.func.isRequired,
	displayValuesFor: PropTypes.func,
	displayFormat: PropTypes.func.isRequired,
	origin: PropTypes.array.isRequired,
	onClick: PropTypes.func,
	options: PropTypes.shape({
		tenkanPeriod: PropTypes.number.isRequired,
		kijunPeriod: PropTypes.number.isRequired,
		senkouPeriod: PropTypes.number.isRequired,
	}).isRequired,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	setDataset: PropTypes.func,
};

IchimokuTooltip.defaultProps = {
	className: "react-stockcharts-tooltip react-stockcharts-ichimoku-tooltip",
	displayFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 10],
};

export default IchimokuTooltip;
