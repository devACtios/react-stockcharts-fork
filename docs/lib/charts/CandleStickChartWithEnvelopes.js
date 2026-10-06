
import PropTypes from "prop-types";
import React from "react";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { Chart, ChartCanvas } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor, MouseCoordinateX,
	MouseCoordinateY
} from "react-stockcharts/lib/coordinates";
import {
	CandlestickSeries, EnvelopesSeries, LineSeries
} from "react-stockcharts/lib/series";

import { fitWidth } from "react-stockcharts/lib/helper";
import { envelopes as envelopesIndicator, sma as smaIndicator } from "react-stockcharts/lib/indicator";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { last } from "react-stockcharts/lib/utils";

const stroke = {
	top: "#964B00",
	bottom: "#964B00",
};

class CandleStickChartWithEnvelopes extends React.Component {
	render() {

		const envelopes = envelopesIndicator()
			.options({ windowSize: 20, basisPoints: 1000, sourcePath: "close" })
			.merge((d, c) => { d.envelopes = c; })
			.accessor(d => d.envelopes);
		const sma = smaIndicator()
			.options({ windowSize: 20, sourcePath: "close" })
			.merge((d, c) => { d.sma = c; })
			.accessor(d => d.sma);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = envelopes(sma(initialData));

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
			<ChartCanvas height={400}
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
				<Chart id={1}
					yExtents={[d => [d.high, d.low], sma.accessor(), envelopes.accessor()]}
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5}
					/>

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries />
					<EnvelopesSeries
						yAccessor={d => d.envelopes}
						stroke={stroke} />
					<LineSeries
						stroke={sma.stroke()}
						yAccessor={sma.accessor()} />

					<OHLCTooltip origin={[-40, 0]} />
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

CandleStickChartWithEnvelopes.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithEnvelopes.defaultProps = {
	type: "svg",
};
CandleStickChartWithEnvelopes = fitWidth(CandleStickChartWithEnvelopes);

export default CandleStickChartWithEnvelopes;
