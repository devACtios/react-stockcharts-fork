import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	BarSeries,
	CandlestickSeries,
	LineSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	CurrentCoordinate,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
} from "react-stockcharts/lib/tooltip";
import { ema, sma, obv, mfi, a_d, volume, volume_avg } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

class CandleStickChartWithVolumes extends React.Component {
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

		const obv10 = obv()
			.options({
				windowSize: 10,
				sourcePath: "volume",
			})
			.merge((d, c) => { d.obv10 = c; })
			.accessor(d => d.obv10);

		const mfi20 = mfi()
			.options({
				windowSize: 20,
				sourcePath: "volume/high/low",
			})
			.merge((d, c) => { d.mfi20 = c; })
			.accessor(d => d.mfi20);

		const a_d20 = a_d()
			.options({
				windowSize: 20,
				sourcePath: "volume/high/low/close",
			})
			.merge((d, c) => { d.a_d20 = c; })
			.accessor(d => d.a_d20);

		const volume10 = volume()
			.options({
			})
			.merge((d, c) => { d.volume10 = c; })
			.accessor(d => d.volume10);

		const volume_20 = volume_avg()
			.options({
			})
			.merge((d, c) => { d.volume20 = c; })
			.accessor(d => d.volume20);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = ema20(sma20(volume_20(volume10(a_d20(mfi20(obv10(initialData)))))));
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
			<ChartCanvas height={1600}
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
					yExtents={[d => [d.high, d.low], sma20.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<LineSeries yAccessor={sma20.accessor()} stroke={sma20.stroke()} />
					<CurrentCoordinate yAccessor={sma20.accessor()} fill={sma20.stroke()} />

					<OHLCTooltip origin={[-40, 0]} />
					<MovingAverageTooltip
						origin={[-38, 15]}
						options={[
							{
								yAccessor: sma20.accessor(),
								type: "SMA",
								stroke: sma20.stroke(),
								windowSize: sma20.options().windowSize,
								echo: "some echo here",
							}
						]}
					/>

				</Chart>

				<Chart id={2} height={200} yExtents={[d => [d.volume], obv10.accessor()]} origin={() => [0, 400]} padding={{ top: 10, bottom: 20 }}>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY at="left" orient="left" displayFormat={format(".2f")} />

					<LineSeries yAccessor={obv10.accessor()} stroke={obv10.stroke()} />

					<CurrentCoordinate yAccessor={obv10.accessor()} fill={obv10.stroke()} />

					<OHLCTooltip origin={[-40, -40]} />
					<MovingAverageTooltip origin={[-38, -430]}
						options={[
							{
								yAccessor: obv10.accessor(),
								type: "OBV",
								stroke: obv10.stroke(),
								windowSize: 0,
								echo: "some echo here",
							}
						]}
					/>
				</Chart>

				<Chart id={3} height={200} yExtents={[mfi20.accessor()]} origin={() => [0, 650]} padding={{ top: 10, bottom: 20 }}>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY at="left" orient="left" displayFormat={format(".2f")} />

					<LineSeries yAccessor={mfi20.accessor()} stroke={mfi20.stroke()} />
					<CurrentCoordinate yAccessor={mfi20.accessor()} fill={mfi20.stroke()} />

					<OHLCTooltip origin={[-40, 0]} />
					<MovingAverageTooltip origin={[-38, -640]}
						options={[
							{
								yAccessor: mfi20.accessor(),
								type: "MFI20",
								stroke: mfi20.stroke(),
								windowSize: mfi20.options().windowSize,
								echo: "some echo here",
							}
						]}
					/>
				</Chart>


				<Chart id={4} height={200} yExtents={[d => d.volume, a_d20.accessor()]} origin={() => [0, 900]} padding={{ top: 10, bottom: 20 }}>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY at="left" orient="left" displayFormat={format(".2f")} />

					<LineSeries yAccessor={a_d20.accessor()} stroke={a_d20.stroke()} />
					<CurrentCoordinate yAccessor={a_d20.accessor()} fill={a_d20.stroke()} />

					<OHLCTooltip origin={[-40, 0]} />
					<MovingAverageTooltip origin={[-38, -890]}
						options={[
							{
								yAccessor: a_d20.accessor(),
								type: "A_D20",
								stroke: a_d20.stroke(),
								windowSize: a_d20.options().windowSize,
								echo: "some echo here",
							},
							{
								yAccessor: a_d20.accessor(),
								type: "A_D20",
								stroke: a_d20.stroke(),
								windowSize: a_d20.options().windowSize,
								echo: "some echo here",
							}
						]}
					/>
				</Chart>

				<Chart id={5} height={200} yExtents={[d => [d.volume], volume_20.accessor()]} origin={() => [0, 1200]}
					padding={{ top: 10, bottom: 20 }}>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY at="left" orient="left" displayFormat={format(".2f")} />

					<BarSeries yAccessor={volume10.accessor()} baseAt={(xScale, yScale) => yScale(0)} fill="#6BA583" />
					<LineSeries yAccessor={volume_20.accessor()} stroke="black" />
					<CurrentCoordinate yAccessor={volume_20.accessor()} fill={volume_20.accessor()} />

					<OHLCTooltip origin={[-40, -40]} />
					<MovingAverageTooltip origin={[-38, -1230]}
						options={[
							{
								yAccessor: volume_20.accessor(),
								type: "VOLUME_AVG",
								stroke: volume_20.stroke(),
								windowSize: volume_20.options().windowSize,
								echo: "some echo here",
							}
						]}
					/>
				</Chart>

				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

CandleStickChartWithVolumes.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithVolumes.defaultProps = {
	type: "svg",
};
CandleStickChartWithVolumes = fitWidth(CandleStickChartWithVolumes);

export default CandleStickChartWithVolumes;
