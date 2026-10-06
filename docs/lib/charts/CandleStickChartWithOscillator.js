import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	CandlestickSeries,
	LineSeries,
	AroonSeries,
	OscillatorTemplateSeries,
	StraightLine,
	MACDSeries,
	RSISeries,
	RVISeries,
	StochasticSeries,
	OSMASeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
	AroonTooltip,
	SingleValueTooltipNew,
	OscillatorTemplateTooltip,
	MACDTooltip,
	RSITooltip,
	RVITooltip,
	StochasticTooltip,
	OSMATooltip,
} from "react-stockcharts/lib/tooltip";
import {
	ema, sma, aroon, aroonOscillator, bearpower, bullpower, cci, dpo, macd, momentum, rsi, williams_r,
	vhf, rvi, stochasticOscillator, qstick, emv, osma, cho
} from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const arStroke = {
	upline: "#964B00",
	middleline: "#964B00",
	AU: "red",
	AD: "green",
	bottomline: "#964B06",
};

const rviStroke = {
	signalline: "red",
	line: "green",
};

const bbFill = "#4682B4";

const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};
const osmaAppearance = {
	stroke: {
		osma: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};
const stoAppearance = {
	stroke: Object.assign({},
		StochasticSeries.defaultProps.stroke,
		{ top: "#37a600", middle: "#b8ab00", bottom: "#37a600" })
};

class CandleStickChartWithTrend extends React.Component {
	render() {

		const height = 750;
		const { type, data: initialData, width, ratio } = this.props;
		const margin = { left: 70, right: 70, top: 20, bottom: 30 };

		const gridHeight = height - margin.top - margin.bottom;

		const showGrid = true;
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 } : {};

		const ema20 = ema()
			.options({
				windowSize: 20, // optional will default to 10
				sourcePath: "close", // optional will default to close as the source
			})
			.skipUndefined(true) // defaults to true
			.merge((d, c) => {
				d.ema20 = c;
			}) // Required, if not provided, log a error
			.accessor(d => d.ema20) // Required, if not provided, log an error during calculation
			.stroke("blue"); // Optional

		const sma20 = sma()
			.options({ windowSize: 20 })
			.merge((d, c) => {
				d.sma20 = c;
			})
			.accessor(d => d.sma20);

		const ar = aroon()
			.options({
				label: "Aroon",
				windowSize: 25,
				uplineSize: 70,
				middlelineSize: 50,
				bottomlineSize: 30,
				sourcePath: "close", // optional will default to close as the source
			})
			.merge((d, c) => { d.ar = c; })
			.accessor(d => d.ar);

		const aOs = aroonOscillator()
			.options({ label: "aroonOscillator", windowSize: 25 })
			.merge((d, c) => { d.aOs = c; })
			.accessor(d => d.aOs);

		const bearpow = bearpower()
			.options({ label: "bearpower", windowSize: 5 })
			.merge((d, c) => { d.bearpow = c; })
			.accessor(d => d.bearpow);

		const bullpow = bullpower()
			.options({ label: "bullpower", windowSize: 5 })
			.merge((d, c) => { d.bullpow = c; })
			.accessor(d => d.bullpow);

		const cci_c = cci()
			.options({ label: "CCI", windowSize: 20, upborder: 50, bottomborder: -50, sourcePath: "high/low/close", })
			.merge((d, c) => { d.cci_c = c; })
			.accessor(d => d.cci_c);

		const dpo_d = dpo()
			.options({ label: "dpo", windowSize: 20, sourcePath: "close", })
			.merge((d, c) => { d.dpo_d = c; })
			.accessor(d => d.dpo_d);

		const mom = momentum()
			.options({ label: "momentum", windowSize: 10, sourcePath: "close", })
			.merge((d, c) => { d.mom = c; })
			.accessor(d => d.mom);

		const macd_d = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => { d.macd = c; })
			.accessor(d => d.macd);

		const rsi_d = rsi()
			.options({ label: "RSI", windowSize: 14 })
			.merge((d, c) => { d.rsi_d = c; })
			.accessor(d => d.rsi_d);

		const wr = williams_r()
			.options({ label: "Williams_r", windowSize: 20, upborder: 20, bottomborder: -80, sourcePath: "high/low/close" })
			.merge((d, c) => { d.wr = c; })
			.accessor(d => d.wr);

		const vhf_d = vhf()
			.options({ label: "vhf", windowSize: 20, sourcePath: "close" })
			.merge((d, c) => { d.vhf_d = c; })
			.accessor(d => d.vhf_d);

		const rvi_d = rvi()
			.options({ label: "rvi", windowSize: 20 })
			.merge((d, c) => { d.rvi_d = c; })
			.accessor(d => d.rvi_d);

		const slowSTO = stochasticOscillator()
			.options({ windowSize: 14, kWindowSize: 1 })
			.merge((d, c) => { d.slowSTO = c; })
			.accessor(d => d.slowSTO);
		const fastSTO = stochasticOscillator()
			.options({ windowSize: 14, kWindowSize: 3 })
			.merge((d, c) => { d.fastSTO = c; })
			.accessor(d => d.fastSTO);
		const fullSTO = stochasticOscillator()
			.options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
			.merge((d, c) => { d.fullSTO = c; })
			.accessor(d => d.fullSTO);

		const qs = qstick()
			.options({ windowSize: 20, movingAverageType: "sma", sourcePath: "open/close" })
			.merge((d, c) => { d.qs = c; })
			.accessor(d => d.qs);

		const emvosc = emv()
			.options({ label: "emv", windowSize: 20, windowSizeSignal: 14, movingAverageType: "sma", movingAverageTypeSignal: "sma", sourcePath: "high/low/volume" })
			.merge((d, c) => { d.emvosc = c; })
			.accessor(d => d.emvosc);

		const osma_d = osma()
			.options({ label: "OsMA", fast: 12, slow: 26, signal: 9, MAfast: "sma", MAslow: "sma", MAsignal: "sma", sourcePath: "close" })
			.merge((d, c) => { d.osma_d = c; })
			.accessor(d => d.osma_d);

		const cho_d = cho()
			.options({ windowSize: 20, maPeriod1: 3, maPeriod2: 10, movingAverageType1: "sma", movingAverageType2: "sma" })
			.merge((d, c) => { d.cho_d = c; })
			.accessor(d => d.cho_d);

		const calculatedData = ema20(sma20(ar(aOs(bearpow(bullpow(cci_c(dpo_d(macd_d(mom(rsi_d(wr(vhf_d(rvi_d(slowSTO(fastSTO(fullSTO(qs(emvosc(osma_d(cho_d(initialData)))))))))))))))))))));
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
			<ChartCanvas height={8500}
				width={width}
				ratio={ratio}
				margin={{ left: 70, right: 70, top: 10, bottom: 30 }}
				type={type}
				seriesName="MSFT"
				data={data}
				xScale={xScale}
				xAccessor={xAccessor}
				displayXAccessor={displayXAccessor}
				xExtents={xExtents}
			>

				<Chart id={1} height={300}
					yExtents={[d => [d.high, d.low], rvi_d.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />
					<OscillatorTemplateSeries
						stroke={arStroke}
						yAccessor={d => d.rvi_d}
						fill={bbFill}
					/>
					<CandlestickSeries />
				</Chart>

				<Chart id={2} height={300} origin={() => [0, 350]}
					yExtents={[d => [d.high, d.low], ar.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<AroonSeries
						stroke={arStroke}
						yAccessor={d => d.ar}
						fill={bbFill}
					/>


					<OHLCTooltip origin={[-38, 30]} />

					<AroonTooltip
						origin={[-38, 60]}
						yAccessor={d => d.ar}
						options={ar.options()} />

				</Chart>

				<Chart id={3} height={300} origin={() => [0, 700]}
					yExtents={[d => [d.high, d.low], aOs.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<BarSeries yAccessor={d => aOs.accessor()(d)} baseAt={(xScale, yScale) => yScale(0)} fill="#6BA583" />

					<OHLCTooltip origin={[-38, 30]} />

					<SingleValueTooltipNew
						origin={[-38, 60]}
						yAccessor={d => d.aOs}
						options={aOs.options()} />


				</Chart>

				<Chart id={4} height={300} origin={() => [0, 1050]}
					yExtents={bearpow.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<BarSeries yAccessor={d => bearpow.accessor()(d)} baseAt={(xScale, yScale) => yScale(0)} fill="#4682B4" />

					<OHLCTooltip origin={[-38, 0]} />

					<SingleValueTooltipNew
						origin={[-38, 30]}
						yAccessor={d => d.bearpow}
						options={bearpow.options()} />
				</Chart>

				<Chart id={5} height={300} origin={() => [0, 1400]}
					yExtents={bullpow.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<BarSeries yAccessor={d => bullpow.accessor()(d)} baseAt={(xScale, yScale) => yScale(0)} fill="#4682B4" />

					<OHLCTooltip origin={[-38, 0]} />

					<SingleValueTooltipNew
						origin={[-38, 30]}
						yAccessor={d => d.bullpow}
						options={bullpow.options()} />
				</Chart>

				<Chart id={6} height={300} origin={() => [0, 1750]}
					yExtents={cci_c.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OscillatorTemplateSeries
						stroke={arStroke}
						yAccessor={d => d.cci_c}
						fill={bbFill}
					/>

					<OHLCTooltip origin={[-38, 0]} />

					<OscillatorTemplateTooltip
						origin={[-38, 60]}
						yAccessor={d => d.cci_c}
						options={cci_c.options()} />
				</Chart>

				<Chart id={8} height={300} origin={() => [0, 2500]}
					yExtents={dpo_d.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-38, 0]} />

					<LineSeries yAccessor={dpo_d.accessor()} stroke={dpo_d.stroke()} />
					<StraightLine yValue={0} />

					<CurrentCoordinate yAccessor={dpo_d.accessor()} fill={dpo_d.stroke()} />

					<MovingAverageTooltip
						origin={[-38, -2450]}
						options={[
							{
								type: "dpo",
								yAccessor: dpo_d.accessor(),
								stroke: dpo_d.stroke(),
								windowSize: dpo_d.options().windowSize,
							},
						]}
					/>
				</Chart>

				<Chart id={9} height={300} origin={() => [0, 2900]}
					yExtents={macd_d.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-38, 0]} />

					<MACDSeries yAccessor={d => d.macd}
						{...macdAppearance} />

					<MACDTooltip
						origin={[-38, 15]}
						yAccessor={d => d.macd}
						options={macd_d.options()}
						appearance={macdAppearance}
					/>

				</Chart>

				<Chart id={10} height={300} origin={() => [0, 3250]}
					yExtents={mom.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-38, 0]} />

					<LineSeries yAccessor={mom.accessor()} stroke={mom.stroke()} />
					<StraightLine yValue={0} />

					<CurrentCoordinate yAccessor={mom.accessor()} fill={mom.stroke()} />

					<MovingAverageTooltip
						origin={[-38, -3220]}
						options={[
							{
								type: "momentum",
								yAccessor: mom.accessor(),
								stroke: mom.stroke(),
								windowSize: mom.options().windowSize,
							},
						]}
					/>
				</Chart>

				<Chart id={11} height={300} origin={() => [0, 3620]}
					yExtents={[0, 100]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<RSISeries yAccessor={d => d.rsi_d} />

					<RSITooltip origin={[-38, 15]}
						yAccessor={d => d.rsi_d}
						options={rsi_d.options()} />
				</Chart>

				<Chart id={12} height={300} origin={() => [0, 4000]}
					yExtents={wr.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OscillatorTemplateSeries
						stroke={arStroke}
						yAccessor={d => d.wr}
						fill={bbFill}
					/>

					<OHLCTooltip origin={[-38, 0]} />

					<OscillatorTemplateTooltip
						origin={[-38, 20]}
						yAccessor={d => d.wr}
						options={wr.options()} />
				</Chart>

				<Chart id={13} height={300} origin={() => [0, 4350]}
					yExtents={vhf_d.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<LineSeries yAccessor={vhf_d.accessor()} stroke={vhf_d.stroke()} />
					<StraightLine yValue={0} />

					<CurrentCoordinate yAccessor={vhf_d.accessor()} fill={vhf_d.stroke()} />

					<MovingAverageTooltip
						origin={[-38, -4350]}
						options={[
							{
								type: "vhf",
								yAccessor: vhf_d.accessor(),
								stroke: vhf_d.stroke(),
								windowSize: vhf_d.options().windowSize,
							},
						]}
					/>
				</Chart>

				<Chart id={14} height={300} origin={() => [0, 4700]}
					yExtents={rvi_d.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<RVISeries
						stroke={rviStroke}
						yAccessor={d => d.rvi_d}
						fill={bbFill}
					/>

					<OHLCTooltip origin={[-38, 0]} />
					<RVITooltip
						origin={[-38, 20]}
						yAccessor={d => d.rvi_d}
						options={rvi_d.options()} />
				</Chart>

				<Chart id={15}
					yExtents={[0, 100]}
					height={125} origin={() => [0, 5100]} padding={{ top: 10, bottom: 10 }}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right"
						tickValues={[20, 50, 80]} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<StochasticSeries
						yAccessor={d => d.fastSTO}
						{...stoAppearance} />
					<StochasticTooltip
						origin={[-38, 15]}
						yAccessor={d => d.slowSTO}
						options={slowSTO.options()}
						appearance={stoAppearance}
						label="Slow STO" />
				</Chart>

				<Chart id={16}
					yExtents={[0, 100]}
					height={125} origin={() => [0, 5300]} padding={{ top: 10, bottom: 10 }}
				>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right"
						tickValues={[20, 50, 80]} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<StochasticSeries
						yAccessor={d => d.slowSTO}
						{...stoAppearance} />

					<StochasticTooltip
						origin={[-38, 15]}
						yAccessor={d => d.fastSTO}
						options={fastSTO.options()}
						appearance={stoAppearance}
						label="Fast STO" />
				</Chart>
				<Chart id={17}
					yExtents={[0, 100]}
					height={125} origin={() => [0, 5500]} padding={{ top: 10, bottom: 10 }}
				>
					<XAxis axisAt="bottom" orient="bottom" {...xGrid} />
					<YAxis axisAt="right" orient="right"
						tickValues={[20, 50, 80]} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />
					<StochasticSeries
						yAccessor={d => d.fullSTO}
						{...stoAppearance} />

					<StochasticTooltip
						origin={[-38, 15]}
						yAccessor={d => d.fullSTO}
						options={fullSTO.options()}
						appearance={stoAppearance}
						label="Full STO" />
				</Chart>

				<Chart id={18} height={300} origin={() => [0, 5700]}
					yExtents={qs.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-38, 0]} />

					<LineSeries yAccessor={qs.accessor()} stroke={qs.stroke()} />
					<StraightLine yValue={0} />

					<CurrentCoordinate yAccessor={qs.accessor()} fill={qs.stroke()} />

					<MovingAverageTooltip
						origin={[-38, -5680]}
						options={[
							{
								type: "qstick",
								yAccessor: qs.accessor(),
								stroke: qs.stroke(),
								windowSize: qs.options().windowSize,
							},
						]}
					/>
				</Chart>

				<Chart id={19} height={300} origin={() => [0, 6050]}
					yExtents={emvosc.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<RVISeries
						stroke={rviStroke}
						yAccessor={d => d.emvosc}
						fill={bbFill}
					/>

					<OHLCTooltip origin={[-38, 0]} />
					<RVITooltip
						origin={[-38, 20]}
						yAccessor={d => d.emvosc}
						options={emvosc.options()} />
				</Chart>

				<Chart id={20} height={300} origin={() => [0, 6450]}
					yExtents={osma_d.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-38, 0]} />

					<OSMASeries yAccessor={d => d.osma_d}
						{...osmaAppearance} />

					<OSMATooltip
						origin={[-38, 15]}
						yAccessor={d => d.osma_d}
						options={osma_d.options()}
						appearance={macdAppearance}
					/>

				</Chart>

				<Chart id={21} height={300} origin={() => [0, 6800]}
					yExtents={cho_d.accessor()}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-38, 0]} />

					<LineSeries yAccessor={cho_d.accessor()} stroke={cho_d.stroke()} />
					<StraightLine yValue={0} />

					<CurrentCoordinate yAccessor={cho_d.accessor()} fill={cho_d.stroke()} />

					<MovingAverageTooltip
						origin={[-38, -6780]}
						options={[
							{
								type: "cho",
								yAccessor: cho_d.accessor(),
								stroke: cho_d.stroke(),
								windowSize: cho_d.options().windowSize,
							},
						]}
					/>
				</Chart>

				<CrossHairCursor />
			</ChartCanvas>

		);
	}
}

CandleStickChartWithTrend.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithTrend.defaultProps = {
	type: "svg",
};
CandleStickChartWithTrend = fitWidth(CandleStickChartWithTrend);

export default CandleStickChartWithTrend;
