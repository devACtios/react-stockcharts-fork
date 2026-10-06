
import PropTypes from "prop-types";
import React from "react";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { Chart, ChartCanvas, SettingsButtons } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	CurrentCoordinate,
	EdgeIndicator,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import {
	BarSeries,
	BollingerSeries,
	CandlestickSeries,
	LineSeries,
	MACDSeries,
} from "react-stockcharts/lib/series";

import { fitWidth } from "react-stockcharts/lib/helper";
import { bollingerBand, ema, macd, momentum } from "react-stockcharts/lib/indicator";
import { DrawingObjectSelector, TrendLine } from "react-stockcharts/lib/interactive";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	MACDTooltip,
	MovingAverageTooltip,
	OHLCTooltip,
} from "react-stockcharts/lib/tooltip";
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
const bbStroke = {
	top: "#964B00",
	middle: "#000000",
	bottom: "#964B00",
};

const bbFill = "#4682B4";


class CandlestickChart extends React.Component {
	constructor(props) {
		super(props);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawCompleteChart1 = this.onDrawCompleteChart1.bind(this);
		this.onDrawCompleteChart3 = this.onDrawCompleteChart3.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.saveCanvasNode = this.saveCanvasNode.bind(this);

		this.state = {
			enableTrendLine: false,
			trends_1: [],
			trends_3: [],
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
				`trends_${each.chartId}`,
				each.objects,
			];
		});
		this.setState(state);
	}
	onDrawCompleteChart1(trends_1) {
		this.setState({
			enableTrendLine: false,
			trends_1
		});
	}
	onDrawCompleteChart3(trends_3) {
		this.setState({
			enableTrendLine: false,
			trends_3
		});
	}
	onKeyPress(e) {
		const keyCode = e.which;

		switch (keyCode) {
			case 46: { // DEL

				const trends_1 = this.state.trends_1
					.filter(each => !each.selected);
				const trends_3 = this.state.trends_3
					.filter(each => !each.selected);

				this.canvasNode.cancelDrag();
				this.setState({
					trends_1,
					trends_3,
				});
				break;
			}
			case 27: { // ESC
				this.node_1.terminate();
				this.node_3.terminate();
				this.canvasNode.cancelDrag();
				this.setState({
					enableTrendLine: false
				});
				break;
			}
			case 68: // D - Draw trendline
			case 69: { // E - Enable trendline
				this.setState({
					enableTrendLine: true
				});
				break;
			}
		}
	}

	render() {
		const ema26 = ema()
			.id(0)
			.options({ windowSize: 26 })
			.merge((d, c) => { d.ema26 = c; })
			.accessor(d => d.ema26);

		const ema12 = ema()
			.id(1)
			.options({ windowSize: 12 })
			.merge((d, c) => { d.ema12 = c; })
			.accessor(d => d.ema12);
		const momentum14 = momentum()
			.id(2)
			.options({ windowSize: 14 })
			.merge((d, c) => { d.momentum = c; })
			.accessor(d => d.momentum);

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => { d.macd = c; })
			.accessor(d => d.macd);
		const bb = bollingerBand()
			.merge((d, c) => { d.bb = c; })
			.accessor(d => d.bb);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = macdCalculator(ema12(ema26(bb(momentum14(initialData)))));
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

		const trends = this.state.trends_1;
		let appearance = undefined;

		if (trends.length > 0) {
			const lastAppearance = trends[trends.length - 1].appearance;
			appearance = {
				stroke: lastAppearance.stroke,
				strokeWidth: lastAppearance.strokeWidth,
				strokeOpacity: lastAppearance.strokeOpacity,
				strokeDasharray: lastAppearance.strokeDasharray,
				edgeStrokeWidth: lastAppearance.edgeStrokeWidth,
				edgeFill: lastAppearance.edgeFill,
				edgeStroke: lastAppearance.edgeStroke,
				r: lastAppearance.r,
				text: "",
			};
		}

		return (
			<div>
				<ChartCanvas ref={this.saveCanvasNode}
					height={800}
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
						yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
						padding={{ top: 10, bottom: 20 }}
					>
						<SettingsButtons />
						<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
						<YAxis axisAt="right" orient="right" ticks={5} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />

						<CandlestickSeries />
						<LineSeries id={"ema26"} yAccessor={ema26.accessor()} stroke={ema26.stroke()} />
						<LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()} />
						<BollingerSeries yAccessor={d => d.bb}
							stroke={bbStroke}
							fill={bbFill} />

						<CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
						<CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12.stroke()} />

						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />

						<OHLCTooltip origin={[-40, 0]} />

						<MovingAverageTooltip
							origin={[-38, 15]}
							options={[
								{
									yAccessor: ema26.accessor(),
									type: ema26.type(),
									stroke: ema26.stroke(),
									windowSize: ema26.options().windowSize,
								},
								{
									yAccessor: ema12.accessor(),
									type: ema12.type(),
									stroke: ema12.stroke(),
									windowSize: ema12.options().windowSize,
								},
							]}
						/>
						<TrendLine
							ref={this.saveInteractiveNodes("Trendline", 1)}
							enabled={this.state.enableTrendLine}
							type="LINE"
							snap={false}
							snapTo={d => [d.high, d.low]}
							onComplete={this.onDrawCompleteChart1}
							trends={this.state.trends_1}
							appearance={appearance}
						/>
					</Chart>
					<Chart id={2} height={150}
						yExtents={[d => d.volume]}
						origin={(w, h) => [0, h - 500]}
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
						origin={(w, h) => [0, h - 350]} padding={{ top: 10, bottom: 10 }}
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
						<TrendLine
							ref={this.saveInteractiveNodes("Trendline", 3)}
							enabled={this.state.enableTrendLine}
							type="LINE"
							snap={false}
							snapTo={d => [d.high, d.low]}
							onComplete={this.onDrawCompleteChart3}
							trends={this.state.trends_3}
						/>
						<MACDSeries yAccessor={d => d.macd}
							{...macdAppearance} />
						<MACDTooltip
							origin={[-38, 15]}
							yAccessor={d => d.macd}
							options={macdCalculator.options()}
							appearance={macdAppearance}
						/>
					</Chart>
					<Chart id={4} height={150}
						yExtents={momentum14.accessor()}
						origin={(w, h) => [0, h - 150]} padding={{ top: 10, bottom: 10 }}
					>
						<XAxis axisAt="bottom" orient="bottom" />
						<YAxis axisAt="right" orient="right" ticks={2} />
						<LineSeries id={"momentum14"} yAccessor={momentum14.accessor()} stroke={"#FF0000"} />
						<MouseCoordinateX
							at="bottom"
							orient="bottom"
							displayFormat={timeFormat("%Y-%m-%d")} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />
						<MACDTooltip
							origin={[-38, 15]}
							yAccessor={d => d.macd}
							options={macdCalculator.options()}
							appearance={macdAppearance}
						/>
					</Chart>
					<CrossHairCursor />
					<DrawingObjectSelector
						enabled={!this.state.enableTrendLine}
						getInteractiveNodes={this.getInteractiveNodes}
						drawingObjectMap={{
							Trendline: "trends"
						}}
						onSelect={this.handleSelection}
					/>
				</ChartCanvas>
			</div>
		);
	}
}

CandlestickChart.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandlestickChart.defaultProps = {
	type: "svg",
};

const CandleStickChartWithInteractiveIndicator = fitWidth(CandlestickChart);

export default CandleStickChartWithInteractiveIndicator;
