
import PropTypes from "prop-types";
import React from "react";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { Chart, ChartCanvas } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	CurrentCoordinate,
	EdgeIndicator,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import {
	AreaSeries,
	BarSeries,
	CandlestickSeries,
	LineSeries,
	MACDSeries,
} from "react-stockcharts/lib/series";

import { fitWidth } from "react-stockcharts/lib/helper";
import { ema, macd, sma } from "react-stockcharts/lib/indicator";
import { DrawingObjectSelector, RotatedEllipse } from "react-stockcharts/lib/interactive";
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



class CandleStickChartWithRotatedEllipse extends React.Component {
	constructor(props) {
		super(props);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawComplete1 = this.onDrawComplete1.bind(this);
		this.onDrawComplete3 = this.onDrawComplete3.bind(this);
		this.handleSelection = this.handleSelection.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.saveCanvasNode = this.saveCanvasNode.bind(this);
		this.state = {
			enableEllipse: true,
			ellipses_1: [],
			ellipses_3: [],
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
				`ellipses_${each.chartId}`,
				each.objects,
			];
		});
		this.setState(state);
	}
	onDrawComplete1(ellipses_1) {
		this.setState({
			ellipses_1,
			enableEllipse: false
		});
	}
	onDrawComplete3(ellipses_3) {
		this.setState({
			ellipses_3,
			enableEllipse: false
		});
	}
	onKeyPress(e) {
		const keyCode = e.which;

		switch (keyCode) {
			case 46: { // DEL
				const ellipses_1 = this.state.ellipses_1
					.filter(each => !each.selected);
				const ellipses_3 = this.state.ellipses_3
					.filter(each => !each.selected);

				this.canvasNode.cancelDrag();
				this.setState({
					ellipses_1,
					ellipses_3,
				});
				break;
			}
			case 27: { // ESC
				this.canvasNode.cancelDrag();
				this.node_1.terminate();
				this.node_3.terminate();
				this.setState({
					enableEllipse: false
				});
				break;
			}
			case 68: // D - Draw Fib
			case 69: { // E - Enable Fib
				this.setState({
					enableEllipse: true,
				});
				break;
			}
		}
	}
	render() {
		const { type, data: initialData, width, ratio } = this.props;
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

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => { d.macd = c; })
			.accessor(d => d.macd);

		const smaVolume50 = sma()
			.id(3)
			.options({
				windowSize: 50,
				sourcePath: "volume",
			})
			.merge((d, c) => { d.smaVolume50 = c; })
			.accessor(d => d.smaVolume50);


		const calculatedData = macdCalculator(smaVolume50(ema12(ema26(initialData))));
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

		const ellipses = this.state.ellipses_1;
		let appearance = undefined;

		if (ellipses.length > 0) {
			const lastAppearance = ellipses[ellipses.length - 1].appearance;

			appearance = {
				stroke: lastAppearance.stroke,
				strokeWidth: lastAppearance.strokeWidth,
				strokeOpacity: lastAppearance.strokeOpacity,
				strokeDasharray: lastAppearance.strokeDasharray,
				isFill: lastAppearance.isFill,
				fill: lastAppearance.fill,
				fillOpacity: lastAppearance.fillOpacity,
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
						yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
						padding={{ top: 10, bottom: 20 }}
					>
						<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
						<YAxis axisAt="right" orient="right" ticks={5} />
						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />

						<CandlestickSeries />
						<LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()} />
						<LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()} />

						<CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
						<CurrentCoordinate yAccessor={ema12.accessor()} fill={ema12.stroke()} />

						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={d => d.close}
							fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}
						/>

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
						<RotatedEllipse
							ref={this.saveInteractiveNodes("RotatedEllipse", 1)}
							enabled={this.state.enableEllipse}
							ellipses={this.state.ellipses_1}
							onComplete={this.onDrawComplete1}
							appearance={appearance}
						/>
					</Chart>
					<Chart id={2} height={150}
						yExtents={[d => d.volume, smaVolume50.accessor()]}
						origin={(w, h) => [0, h - 300]}
					>
						<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")} />

						<MouseCoordinateY
							at="left"
							orient="left"
							displayFormat={format(".4s")} />

						<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />
						<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()} />
					</Chart>
					<Chart id={3} height={150}
						yExtents={macdCalculator.accessor()}
						origin={(w, h) => [0, h - 150]} padding={{ top: 10, bottom: 10 }}
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

						<RotatedEllipse
							ref={this.saveInteractiveNodes("RotatedEllipse", 3)}
							enabled={this.state.enableEllipse}
							type="BOUND"
							ellipses={this.state.ellipses_3}
							onComplete={this.onDrawComplete3}
							appearance={appearance}
						/>

						<MACDTooltip
							origin={[-38, 15]}
							yAccessor={d => d.macd}
							options={macdCalculator.options()}
							appearance={macdAppearance}
						/>
					</Chart>
					<CrossHairCursor />
					<DrawingObjectSelector
						enabled={!this.state.enableEllipse}
						getInteractiveNodes={this.getInteractiveNodes}
						drawingObjectMap={{
							RotatedEllipse: "ellipses"
						}}
						onSelect={this.handleSelection}
					/>
				</ChartCanvas>
			</div>
		);
	}
}
CandleStickChartWithRotatedEllipse.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithRotatedEllipse.defaultProps = {
	type: "svg",
};

CandleStickChartWithRotatedEllipse = fitWidth(CandleStickChartWithRotatedEllipse);

export default CandleStickChartWithRotatedEllipse;
