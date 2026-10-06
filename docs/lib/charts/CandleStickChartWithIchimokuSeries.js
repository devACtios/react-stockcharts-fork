import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	IchimokuSeries,
	MAMASeries,
	CandlestickSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	IchimokuTooltip,
	MAMATooltip,
} from "react-stockcharts/lib/tooltip";
import { ichimoku, mama } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const mamaAppearance = {
	stroke: {
		mama: "#FF0000",
		fama: "#00FF00",
	},
	fill: "#4682B4",
};

const icStroke = {
	tenkan: "#964B00",
	kijun: "#964B00",
	senkou_a: "red",
	senkou_b: "green",
	chikou: "#964B06",
};
const icStrokeWidth = {
	tenkan: 1,
	kijun: 1,
	senkou_a: 1,
	senkou_b: 1,
	chikou: 1,
};
const icStrokeDasharray = {
	tenkan: "Solid",
	kijun: "Solid",
	senkou_a: "Solid",
	senkou_b: "Solid",
	chikou: "Solid",
};

const bbFill = "#4682B4";

class CandleStickChartWithTrend extends React.Component {
	render() {
		const ic = ichimoku()
			.options({
				label: "Ichimoku",
				tenkanPeriod: 9,
				kijunPeriod: 26,
				senkouPeriod: 52,
			})
			.merge((d, c) => { d.ic = c; })
			.accessor(d => d.ic);

		const m = mama()
			.options({
				windowSize: 20,
				sourcePath: "close",
				label: "mama",
			})
			.merge((d, c) => { d.m = c; })
			.accessor(d => d.m);
		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = ic(m(initialData));

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

				<Chart id={1} height={300} origin={() => [0, 0]}
					yExtents={[d => [d.high, d.low], m.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<MAMASeries {...mamaAppearance}
						yAccessor={d => d.m}
					/>
					<MAMATooltip
						origin={[-38, 60]}
						yAccessor={d => d.m}
						options={m.options()} />
					<OHLCTooltip origin={[-40, 0]} />

				</Chart>

				<Chart id={2} height={300} origin={() => [0, 400]}
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
