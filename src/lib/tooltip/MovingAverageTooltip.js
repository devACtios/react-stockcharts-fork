

import React, { Component } from "react";
import PropTypes from "prop-types";
import { format } from "d3-format";
import displayValuesFor from "./displayValuesFor";
import GenericChartComponent from "../GenericChartComponent";

import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

import { functor } from "../utils";
import AToolTip from "./ATooltip";

class SingleMAToolTip extends AToolTip {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.throwDataset = this.throwDataset.bind(this);
	}
	handleClick(e) {
		const { onClick, forChart, options } = this.props;
		onClick({ ...options, chartId: forChart }, e);
	}
	render() {
		const { textFill, labelFill } = this.props;
		const translate = "translate(" + this.props.origin[0] + ", " + this.props.origin[1] + ")";
		const dataset = this.getDataSet();
		return (
			<g transform={translate} {...dataset}>
				<line x1={0} y1={2} x2={0} y2={28} stroke={this.props.color} strokeWidth="4px" {...dataset}/>
				<ToolTipText x={5} y={11}
					setDataset={this.throwDataset}
					fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}>
					<ToolTipTSpanLabel
						fill={labelFill}
						setDataset={this.throwDataset}
					>{this.props.displayName}</ToolTipTSpanLabel>
					<tspan x="5" dy="15" fill={textFill} {...dataset}>{this.props.value}</tspan>
				</ToolTipText>
				<rect x={0} y={0} width={55} height={30}
					{...dataset}
					onClick={this.handleClick}
					fill="none" stroke="none" />
			</g>
		);
	}
}

SingleMAToolTip.propTypes = {
	origin: PropTypes.array.isRequired,
	color: PropTypes.string.isRequired,
	displayName: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	onClick: PropTypes.func,
	fontFamily: PropTypes.string,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	fontSize: PropTypes.number,
	forChart: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	options: PropTypes.object.isRequired,
	setDataset: PropTypes.func,
};

class MovingAverageTooltip extends Component {
	constructor(props) {
		super(props);
		this.renderSVG = this.renderSVG.bind(this);
	}
	renderSVG(moreProps) {
		const { displayValuesFor } = this.props;

		const { chartId } = moreProps;
		const { chartConfig } = moreProps;

		const { className, onClick, width, fontFamily, fontSize, textFill, labelFill, setDataset } = this.props;
		const { origin: originProp, displayFormat, options } = this.props;
		const { chartConfig: { height } } = moreProps;

		const currentItem = displayValuesFor(this.props, moreProps);
		const config = chartConfig;

		const origin = functor(originProp);
		const [x, y] = origin(width, height);
		const [ox, oy] = config.origin;

		return (
			<g transform={`translate(${ ox + x }, ${ oy + y })`} className={className}>
				{options
					.map((each, idx) => {
						const yValue = currentItem && each.yAccessor(currentItem);

						const tooltipLabel = `${each.type} (${each.windowSize})`;
						const yDisplayValue = yValue ? displayFormat(yValue) : "n/a";
						return <SingleMAToolTip
							key={idx}
							origin={[width * idx, 0]}
							color={each.stroke}
							displayName={tooltipLabel}
							value={yDisplayValue}
							options={each}
							forChart={chartId}
							onClick={onClick}
							fontFamily={fontFamily}
							fontSize={fontSize}
							textFill={textFill}
							labelFill={labelFill}
							setDataset={setDataset}
						/>;
					})}
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

MovingAverageTooltip.propTypes = {
	className: PropTypes.string,
	setDataset: PropTypes.func, // fn must get options anc chartId and return objets for set to dataset of element
	displayFormat: PropTypes.func.isRequired,
	origin: PropTypes.array.isRequired,
	displayValuesFor: PropTypes.func,
	onClick: PropTypes.func,
	textFill: PropTypes.string,
	labelFill: PropTypes.string,
	fontFamily: PropTypes.string,
	fontSize: PropTypes.number,
	width: PropTypes.number,
	options: PropTypes.arrayOf(PropTypes.shape({
		yAccessor: PropTypes.func.isRequired,
		type: PropTypes.string.isRequired,
		stroke: PropTypes.string.isRequired,
		windowSize: PropTypes.number.isRequired,
		echo: PropTypes.any,
	})),
};

MovingAverageTooltip.defaultProps = {
	className: "react-stockcharts-tooltip react-stockcharts-moving-average-tooltip",
	displayFormat: format(".2f"),
	displayValuesFor: displayValuesFor,
	origin: [0, 10],
	width: 65,
};

export default MovingAverageTooltip;
