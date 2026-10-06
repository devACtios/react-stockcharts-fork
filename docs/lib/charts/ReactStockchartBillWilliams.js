import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

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
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
} from "react-stockcharts/lib/tooltip";
import { sma, bw_mfi, ac } from "react-stockcharts/lib/indicator";
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
		const bwmfi = bw_mfi()
			.options({ sourcePath: "high/low/volume" })
			.id(25)
			.merge((d, c) => { d.bwmfi = c; })
			.accessor(d => d.bwmfi);
		const ac20 = ac()
			.options({ windowSize: 20, sourcePath: "high/low", FastMAPeriod: 5, SlowMAPeriod: 34 })
			.id(18)
			.merge((d, c) => { d.ac20 = c; })
			.accessor(d => d.ac20);
		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = ac20(bwmfi(sma20(initialData)));
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
				</Chart>
				<Chart id={2} height={100} origin={() => [0, 350]}
					yExtents={[d => [d.high, d.low], bwmfi.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".0s")} />
					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".4s")} />

					<BarSeries yAccessor={bwmfi.accessor()} stroke fill={(d) => d.close > d.open ? "#6BA583" : "red"} />
					<CurrentCoordinate yAccessor={bwmfi.accessor()} fill={bwmfi.stroke()} />
					<OHLCTooltip origin={[0, 0]} />
				</Chart>
				<Chart id={3} height={100} origin={() => [0, 500]}
					yExtents={[d => d.ac20]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".0s")} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".4s")} />
					<LineSeries yAccessor={ac20.accessor()} stroke={ac20.stroke()} />
					<CurrentCoordinate yAccessor={ac20.accessor()} fill={ac20.stroke()} />
					<OHLCTooltip origin={[0, 0]} />
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
