import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	MAMASeries,
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
	MAMATooltip,
} from "react-stockcharts/lib/tooltip";
import { mama } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

const mamaAppearance = {
	stroke: {
		mama: "#FF0000",
		fama: "#00FF00",
	},
	fill: "#4682B4",
};

class CandleStickChartWithMA extends React.Component {
	render() {
		const mama20 = mama()
			.options({ windowSize: 10 })
			.merge((d, c) => {
				d.mama20 = c;
			})
			.accessor(d => d.mama20);

		const { type, data: initialData, width, ratio } = this.props;

		const calculatedData = mama20(initialData);
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
					padding={{ top: 10, bottom: 20 }}
				>
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />
					<MAMASeries yAccessor={d => d.mama20}
						{...mamaAppearance} />
					<CurrentCoordinate yAccessor={d => d.volume} fill={mama20.stroke().mama} />
					<MAMATooltip
						origin={[-38, 60]}
						yAccessor={d => d.mama20}
						options={mama20.options()}
						appearance={mamaAppearance}
					/>
					<OHLCTooltip origin={[-40, 0]} />
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
