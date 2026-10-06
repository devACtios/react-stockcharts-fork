import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	CandlestickSeries,
	LineSeries,
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
	SingleValueTooltip,
} from "react-stockcharts/lib/tooltip";
import { sma, roc, atr, mi } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

class CandleStickChartWithMA extends React.Component {
	render() {
		const sma20 = sma()
			.options({ windowSize: 20 })
			.merge((d, c) => {
				d.sma20 = c;
			})
			.accessor(d => d.sma20);

		const roc20 = roc()
			.options({ windowSize: 20 })
			.merge((d, c) => { d.roc20 = c; })
			.accessor(d => d.roc20);

		const atr20 = atr()
			.options({ windowSize: 20, movingAverageType: "sma" })
			.merge((d, c) => { d.atr20 = c; })
			.accessor(d => d.atr20);

		const atr20ema = atr()
			.options({ windowSize: 20, movingAverageType: "ema" })
			.merge((d, c) => { d.atr20ema = c; })
			.accessor(d => d.atr20ema);

		const mi_d = mi()
			.options({ windowSize: 9, MassPeriod: 25, movingAverageType: "sma", sourcePath: "high/low" })
			.merge((d, c) => { d.mi_d = c; })
			.accessor(d => d.mi_d);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = sma20(roc20(atr20ema(atr20(mi_d(initialData)))));
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
							},
						]}
					/>
				</Chart>

				<Chart id={2} height={300} origin={() => [0, 350]}
					yExtents={[roc20.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<LineSeries yAccessor={roc20.accessor()} stroke={roc20.stroke()} />
					<CurrentCoordinate yAccessor={roc20.accessor()} fill={roc20.stroke()} />

					<OHLCTooltip origin={[-40, 0]} />
					<MovingAverageTooltip
						origin={[-38, -340]}
						options={[
							{
								yAccessor: roc20.accessor(),
								type: "ROC",
								stroke: roc20.stroke(),
								windowSize: roc20.options().windowSize,
								echo: "some echo here",
							},
						]}
					/>
				</Chart>

				<Chart id={3} height={300} origin={() => [0, 700]}
					yExtents={atr20.accessor()}
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

					<LineSeries yAccessor={atr20.accessor()} stroke={atr20.stroke()} />
					<LineSeries yAccessor={atr20ema.accessor()} stroke={atr20.stroke()} />
					<SingleValueTooltip
						yAccessor={atr20.accessor()}
						yLabel={`ATR (${atr20.options().windowSize})`}
						yDisplayFormat={format(".2f")}
						origin={[-40, 15]} />
				</Chart>

				<Chart id={4} height={300} origin={() => [0, 1100]}
					yExtents={mi_d.accessor()}
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

					<LineSeries yAccessor={mi_d.accessor()} stroke={mi_d.stroke()} />
					<SingleValueTooltip
						yAccessor={mi_d.accessor()}
						yLabel={`MI (${mi_d.options().windowSize})`}
						yDisplayFormat={format(".2f")}
						origin={[-40, 15]} />
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

CandleStickChartWithMA.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithMA.defaultProps = {
	type: "svg",
};
CandleStickChartWithMA = fitWidth(CandleStickChartWithMA);

export default CandleStickChartWithMA;
