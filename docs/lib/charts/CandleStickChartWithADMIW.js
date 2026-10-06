
import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import { CandlestickSeries, ADMIWSeries } from "react-stockcharts/lib/series";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { admiw } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const stroke = {
	plus: "#6BA583",
	minus: "#FF0000",
	admiw: "#0000ee",
};

class CandleStickChartWithADMIW extends React.Component {
	render() {
		const adm = admiw()
			.merge((d, c) => { d.adm = c; })
			.accessor(d => d.adm);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = adm(initialData);
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
					yExtents={[d => [d.high, d.low]]}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5}
					/>
					<CandlestickSeries />
					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />
				</Chart>
				<Chart id={2}
					yExtents={adm.accessor()}
					height={150}
					origin={(w, h) => [0, h - 150]}
				>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")} />
					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />
					<ADMIWSeries yAccessor={adm.accessor()} stroke={stroke} strokeWidth={3} />
				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
		);
	}
}

CandleStickChartWithADMIW.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithADMIW.defaultProps = {
	type: "svg",
};
CandleStickChartWithADMIW = fitWidth(CandleStickChartWithADMIW);

export default CandleStickChartWithADMIW;
