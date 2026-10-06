import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BollingerSeries,
	DonchianSeries,
	IchimokuSeries,
	CandlestickSeries,
	LineSeries,
	SARSeries,
	TironeSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
	EdgeIndicator,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
	BollingerBandTooltip,
	DonchianTooltip,
	IchimokuTooltip,
	TironeTooltip,
	SingleValueTooltip,
} from "react-stockcharts/lib/tooltip";
import { ema, sma, bollingerBand, keltnerchannel, donchianchannel, ichimoku, sar, lri, tirone } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const bbStroke = {
	top: "#964B00",
	middle: "#000000",
	bottom: "#964B00",
};
const bbStrokeWidth = {
	top: 5,
	middle: 5,
	bottom: 5,
};
const bbStrokeDasharray = {
	top: "Solid",
	middle: "Solid",
	bottom: "Solid",
};
const icStroke = {
	tenkan: "#964B00",
	kijun: "#964B00",
	senkou_a: "red",
	senkou_b: "green",
	chikou: "#964B06",
};
const icStrokeWidth = {
	tenkan: 3,
	kijun: 3,
	senkou_a: 3,
	senkou_b: 3,
	chikou: 3,
};
const icStrokeDasharray = {
	tenkan: "Solid",
	kijun: "Solid",
	senkou_a: "Solid",
	senkou_b: "Solid",
	chikou: "Solid",
};
const tirStroke = {
	upline: "#964B00",
	line2: "#964B00",
	line3: "red",
	line4: "green",
	bottomline: "#964B06",
};

const bbFill = "#4682B4";

class CandleStickChartWithTrend extends React.Component {
	render() {
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

		const bb = bollingerBand()
			.options({
				label: "BB",
				sourcePath: "close", // optional will default to close as the source
				movingAverageType: "sma",
				windowSize: 20,
			})
			.merge((d, c) => { d.bb = c; })
			.accessor(d => d.bb);

		const kc = keltnerchannel()
			.options({
				label: "KC",
				sourcePath: "close", // optional will default to close as the source
				movingAverageType: "ema",
				windowSize: 20,
				windowSize_atr: 10,
			})
			.merge((d, c) => { d.kc = c; })
			.accessor(d => d.kc);

		const dc = donchianchannel()
			.options({
				label: "DC",
				percent: 50,
				windowSize: 20,
			})
			.merge((d, c) => { d.dc = c; })
			.accessor(d => d.dc);

		const ic = ichimoku()
			.options({
				label: "Ichimoku",
				tenkanPeriod: 9,
				kijunPeriod: 26,
				senkouPeriod: 52,
			})
			.merge((d, c) => { d.ic = c; })
			.accessor(d => d.ic);


		const accelerationFactor = .02;
		const maxAccelerationFactor = .2;
		const defaultSar = sar()
			.options({
				accelerationFactor, maxAccelerationFactor
			})
			.merge((d, c) => { d.sar = c; })
			.accessor(d => d.sar);

		// ALGORITHM only for close price
		const lr = lri()
			.options({ windowSize: 14 })
			.merge((d, c) => { d.lr = c; })
			.accessor(d => d.lr)
			.stroke("blue");

		const tir = tirone()
			.options({
				label: "Tirone",
				windowSize: 20,
			})
			.merge((d, c) => { d.tir = c; })
			.accessor(d => d.tir);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = ema20(sma20(bb(ic(kc(dc(defaultSar(lr(tir(initialData)))))))));
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
			<ChartCanvas height={2500}
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
					yExtents={[d => [d.high, d.low], bb.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />

					<BollingerSeries yAccessor={d => d.bb}
						stroke={bbStroke} strokeWidth={bbStrokeWidth} strokeDasharray={bbStrokeDasharray}
						fill={bbFill} />

					<OHLCTooltip origin={[-38, 30]} />
					<BollingerBandTooltip
						origin={[-38, 60]}
						yAccessor={d => d.bb}
						options={bb.options()} />

				</Chart>

				<Chart id={2} height={300} origin={() => [0, 350]}
					yExtents={[d => [d.high, d.low], kc.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />

					<BollingerSeries yAccessor={d => d.kc}
						stroke={bbStroke}
						fill={bbFill} />

					<OHLCTooltip origin={[-38, 30]} />
					<BollingerBandTooltip
						origin={[-38, 60]}
						yAccessor={d => d.kc}
						options={kc.options()} />

				</Chart>


				<Chart id={3} height={300} origin={() => [0, 700]}
					yExtents={[d => [d.high, d.low], dc.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />

					<DonchianSeries yAccessor={d => d.dc}
						stroke={bbStroke} />

					<OHLCTooltip origin={[-38, 30]} />
					<DonchianTooltip
						origin={[-38, 60]}
						yAccessor={d => d.dc}
						options={dc.options()} />

				</Chart>

				<Chart id={4} height={300} origin={() => [0, 1050]}
					yExtents={[d => [d.high, d.low], ic.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<IchimokuSeries
						stroke={icStroke}
						strokeWidth={icStrokeWidth}
						strokeDasharray={icStrokeDasharray}
						yAccessor={d => d.ic}
						fill={bbFill} />

					<OHLCTooltip origin={[-38, 30]} />
					<IchimokuTooltip
						origin={[-38, 60]}
						yAccessor={d => d.ic}
						options={ic.options()} />

				</Chart>

				<Chart id={5} height={300} origin={() => [0, 1430]}
					yExtents={[d => [d.high, d.low, d.sar]]}
					padding={{ top: 10, bottom: 10 }}
				>

					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<CandlestickSeries />

					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />

					<SARSeries yAccessor={d => d.sar} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<OHLCTooltip origin={[-40, 0]} />
					<SingleValueTooltip
						yLabel={`SAR (${accelerationFactor}, ${maxAccelerationFactor})`}
						yAccessor={d => d.sar}
						origin={[-40, 20]} />
				</Chart>

				<Chart id={6} height={300} origin={() => [0, 1750]}
					yExtents={[d => [d.high, d.low], lr.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<LineSeries yAccessor={lr.accessor()} stroke={lr.stroke()} />
					<CurrentCoordinate yAccessor={lr.accessor()} fill={lr.stroke()} />

					<OHLCTooltip origin={[-40, 30]} />
					<MovingAverageTooltip
						origin={[-38, -1700]}
						options={[
							{
								yAccessor: lr.accessor(),
								type: "LRI",
								stroke: lr.stroke(),
								windowSize: lr.options().windowSize,
							},
						]}
					/>
				</Chart>

				<Chart id={7} height={300} origin={() => [0, 2100]}
					yExtents={[d => [d.high, d.low], tir.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<TironeSeries
						stroke={tirStroke}
						yAccessor={d => d.tir}
						fill={bbFill} />

					<OHLCTooltip origin={[-38, 30]} />
					<TironeTooltip
						origin={[-38, 60]}
						yAccessor={d => d.tir}
						options={tir.options()} />

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
