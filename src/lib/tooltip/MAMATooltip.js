import React from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import AToolTip from "./ATooltip";
import { isDefined, functor } from "../utils";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class MAMATooltip extends AToolTip {
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

		let mama, fama;
		mama = fama = "n/a";

		if (isDefined(currentItem)
				&& isDefined(yAccessor(currentItem))) {
			const item = yAccessor(currentItem);
			mama = displayFormat(item.mama);
			fama = displayFormat(item.fama);
		}

		const { origin: originProp } = this.props;
		const origin = functor(originProp);
		const [x, y] = origin(width, height);
		const { label } = options;

		const tooltipLabel = `${label} (mama, fama): `;
		const tooltipValue = `${ mama }, ${ fama }`;

		const dataset = this.getDataSet();

		return (
			<g transform={`translate(${ x }, ${ y })`}
				className={this.props.className} onClick={onClick} {...dataset}>
				<ToolTipText x={0} y={0}
					fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}
					setDataset={this.throwDataset}
				>
					<ToolTipTSpanLabel
						fill={labelFill}
						setDataset={this.throwDataset}
					>{tooltipLabel}</ToolTipTSpanLabel>
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

MAMATooltip.propTypes = {
	className: PropTypes.string,
	yAccessor: PropTypes.func.isRequired,
	displayValuesFor: PropTypes.func,
	displayFormat: PropTypes.func.isRequired,
	origin: PropTypes.array.isRequired,
	onClick: PropTypes.func,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	setDataset: PropTypes.func,
};

MAMATooltip.defaultProps = {
	className: "react-stockcharts-tooltip react-stockcharts-mama-tooltip",
	displayFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 10],
};

export default MAMATooltip;
