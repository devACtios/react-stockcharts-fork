
import React from "react";
import PropTypes from "prop-types";
import { scaleLinear } from "d3-scale";

import PureComponent from "./utils/PureComponent";
import {
	isNotDefined,
	noop,
	find,
	isDefined,
} from "./utils";
import ChartContext from "./ChartContext";

class Chart extends PureComponent {
	static contextType = ChartContext;

	constructor(props) {
		super(props);
		this.yScale = this.yScale.bind(this);
		this.listener = this.listener.bind(this);
	}

	UNSAFE_componentWillMount() {
		const { id } = this.props;
		const { subscribe } = this.context;
		subscribe("chart_" + id,
			{
				listener: this.listener,
			}
		);
	}
	componentWillUnmount() {
		const { id } = this.props;
		const { unsubscribe } = this.context;
		unsubscribe("chart_" + id);
	}
	listener(type, moreProps, state, e) {
		const { id, onContextMenu, onMouseEnter, onMouseLeave } = this.props;

		if (type === "contextmenu") {
			const { currentCharts } = moreProps;
			if (currentCharts.indexOf(id) > -1) {
				onContextMenu(moreProps, e);
			}
		} else if (type === "mouseenter" || type === "mousemove") {
			const { currentCharts } = moreProps;
			if (currentCharts.indexOf(id) > -1) {
				onMouseEnter(id);
			}
		} else if (type === "mouseleave") {
			onMouseLeave(id);
		}
	}
	yScale() {
		const chartConfig = find(this.context.chartConfig, each => each.id === this.props.id);
		return chartConfig.yScale.copy();
	}
	getChartContext(chartId, chartConfig) {
		if (this.chartContext
			&& this.chartContextSource === this.context
			&& this.chartContext.chartId === chartId
			&& this.chartContext.chartConfig === chartConfig) {
			return this.chartContext;
		}

		this.chartContextSource = this.context;
		this.chartContext = {
			...this.context,
			chartId,
			chartConfig,
		};

		return this.chartContext;
	}

	render() {
		const { id: chartId } = this.props;
		const { origin } = find(this.context.chartConfig, each => each.id === this.props.id);
		const [x, y] = origin;
		const suffix = isDefined(chartId) ? "-" + chartId : "";
		const style = { clipPath: `url(#chart-clip${suffix})` };
		const chartConfig = find(this.context.chartConfig, each => each.id === chartId);
		const context = this.getChartContext(chartId, chartConfig);

		return (
			<ChartContext.Provider value={context}>
				<g style={style} transform={`translate(${x}, ${y})`}>{this.props.children}</g>
			</ChartContext.Provider>
		);
	}
}

Chart.propTypes = {
	height: PropTypes.number,
	origin: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.func
	]),
	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	yExtents: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.func
	]),
	yExtentsCalculator: function(props, propName, componentName) {
		if (isNotDefined(props.yExtents) && typeof props.yExtentsCalculator !== "function")
			return new Error("yExtents or yExtentsCalculator must"
				+ ` be present on ${componentName}. Validation failed.`);
	},
	onContextMenu: PropTypes.func,
	onMouseEnter: PropTypes.func,
	onMouseLeave: PropTypes.func,
	yScale: PropTypes.func,

	flipYScale: PropTypes.bool,
	padding: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.shape({
			top: PropTypes.number,
			bottom: PropTypes.number,
		})
	]),
	children: PropTypes.node,
};

Chart.defaultProps = {
	id: 0,
	origin: [0, 0],
	padding: 0,
	yScale: scaleLinear(),
	flipYScale: false,
	yPan: true,
	yPanEnabled: false,
	onContextMenu: noop,
	onMouseEnter: noop,
	onMouseLeave: noop,
	magnetMode: "off",
	magnetPoints: (d) => [d.high, d.low, d.close, d.open]
};

export default Chart;
