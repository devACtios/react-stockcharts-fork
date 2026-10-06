import PropTypes from "prop-types";
import React from "react";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { Chart, ChartCanvas } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	MouseCoordinateX,
	MouseCoordinateY
} from "react-stockcharts/lib/coordinates";
import { BarSeries, CandlestickSeries, MACDSeries } from "react-stockcharts/lib/series";

import { macd } from "react-stockcharts/lib/indicator";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { MACDTooltip, OHLCTooltip } from "react-stockcharts/lib/tooltip";

import { fitWidth } from "react-stockcharts/lib/helper";
import { DrawingObjectSelector } from "react-stockcharts/lib/interactive";
import { last, toObject } from "react-stockcharts/lib/utils";
import {
	getInteractiveNodes,
	saveInteractiveNodes,
} from "./interactiveutils";

const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

class CandleStickChartWithText extends React.Component {
	constructor(props) {
		super(props);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawComplete = this.onDrawComplete.bind(this);
		this.onDrawDragComplete = this.onDrawDragComplete.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.saveCanvasNode = this.saveCanvasNode.bind(this);

		this.state = {
			enableInteractiveObject: true,
			textList_1: [],
			iniFormValues: "",
		};
	}
	saveCanvasNode(node) {
		this.canvasNode = node;
	}
	componentDidMount() {
		document.addEventListener("keyup", this.onKeyPress);
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.onKeyPress);
	}
	handleSelection(interactives) {
		const state = toObject(interactives, each => {
			return [
				`textLists_${each.chartId}`,
				each.objects,
			];
		});
		this.setState(state);
	}
	onDrawDragComplete(textList_1) {
		this.setState({
			enableInteractiveObject: false,
			textList_1,
		});
	}
	onDrawComplete(textList_1) {
		this.setState({
			enableInteractiveObject: false,
			textList_1,
		});
	}

	onKeyPress(e) {
		const keyCode = e.which;

		switch (keyCode) {
			case 46: {

				const textList_1 = this.state.textList_1
					.filter(each => !each.selected);

				this.canvasNode.cancelDrag();
				this.setState({
					textList_1,
				});
				break;
			}
			case 27: {
				// ESC
				this.node.terminate();
				this.canvasNode.cancelDrag();
				this.setState({
					enableInteractiveObject: false
				});
				break;
			}
			case 68: // D - Draw drawing object
			case 69: { // E - Enable drawing object
				this.setState({
					enableInteractiveObject: true
				});
				break;
			}
		}
	}

	render() {
		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => { d.macd = c; })
			.accessor(d => d.macd);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = macdCalculator(initialData);
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);

		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];


		return (
			<div>
				<ChartCanvas ref={this.saveCanvasNode}
					height={600}
					width={width}
					ratio={ratio}
					margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
					type={type}
					seriesName="MSFT"
					data={data}
					xScale={xScale}
					xAccessor={xAccessor}
					displayXAccessor={displayXAccessor}
					xExtents={xExtents}
				>
					<Chart id={1} height={400}
						yExtents={[d => [d.high, d.low]]}
						padding={{ top: 10, bottom: 20 }}
					>
						<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
						<YAxis axisAt="right" orient="right" ticks={5} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />

						<CandlestickSeries />

						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />

						<OHLCTooltip origin={[-40, 0]} />

					</Chart>
					<Chart id={2} height={150}
						yExtents={[d => d.volume]}
						origin={(w, h) => [0, h - 300]}
					>
						<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")} />

						<MouseCoordinateY
							at="left"
							orient="left"
							displayFormat={format(".4s")} />

						<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
					</Chart>
					<Chart id={3} height={150}
						yExtents={macdCalculator.accessor()}
						origin={(w, h) => [0, h - 150]}
						padding={{ top: 10, bottom: 10 }}
					>
						<XAxis axisAt="bottom" orient="bottom" />
						<YAxis axisAt="right" orient="right" ticks={2} />

						<MouseCoordinateX
							at="bottom"
							orient="bottom"
							displayFormat={timeFormat("%Y-%m-%d")} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />

						<MACDSeries yAccessor={d => d.macd}
							{...macdAppearance} />

						<MACDTooltip
							origin={[-38, 15]}
							yAccessor={d => d.macd}
							options={macdCalculator.options()}
							appearance={macdAppearance}
						/>
					</Chart>
					<CrossHairCursor />
					<DrawingObjectSelector
						enabled
						getInteractiveNodes={this.getInteractiveNodes}
						drawingObjectMap={{
							InteractiveText: "textList"
						}}
						onSelect={this.handleSelection}
					/>
				</ChartCanvas>
			</div>
		);
	}
}


CandleStickChartWithText.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithText.defaultProps = {
	type: "svg"
};

const CandleStickChart = fitWidth(
	CandleStickChartWithText
);

export default CandleStickChart;
