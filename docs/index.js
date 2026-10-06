import { tsvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";

import React from "react";
import ReactDOM from "react-dom/client";

import Chart from "./lib/charts/CandleStickChartWithDarkTheme";
// import Chart from "./lib/charts/CandleStickChartWithMA";
// import Chart from "./lib/charts/CandleStickChartWithVolumes.js";
// import Chart from "./lib/charts/CandleStickChartWithTrend.js";
// import Chart from "./lib/charts/CandleStickChartWithOscillator.js";
// import Chart from "./lib/charts/CandleStickChartWithVolatility";
// import Chart from "./lib/charts/ReactStockchartBillWilliams";
// import Chart from "./lib/charts/CandleStickChartWithMACDIndicator";
// import Chart from "./lib/charts/CandleStickChartWithMAMA";
// import Chart from "./lib/charts/CandleStickChartWithBollingerBandOverlay";
// import Chart from "./lib/charts/CandleStickChartWithEnvelopes";
// import Chart from "./lib/charts/CandleStickChartWithVidya";
// import Chart from "./lib/charts/CandleStickChartWithStandardDeviation";
// import Chart from "./lib/charts/CandleStickChartWithADMIW";
// import Chart from "./lib/charts/CandleStickChartWithIchimokuSeries";
// import Chart from "./lib/charts/CandleStickChartWithVolatility.js";

// first group of elements for drawing
// import Chart from "./lib/charts/CandleStickChartWithRay.js";
// import Chart from "./lib/charts/CandleStickChartWithTrendLine.js";
// import Chart from "./lib/charts/CandleStickChartWithExtended.js";
// import Chart from "./lib/charts/CandleStickChartWithHorizontalLine.js";
// import Chart from "./lib/charts/CandleStickChartWithVerticalLine.js";
// import Chart from "./lib/charts/CandleStickChartWithHorizontalRay.js";
// import Chart from "./lib/charts/CandleStickChartWithStandardDeviationChannel.js";
// import Chart from "./lib/charts/CandleStickChartWithEquidistantChannel.js";
// import Chart from "./lib/charts/CandleStickChartWithArrowLine.js";
// import Chart from "./lib/charts/CandleStickChartWithTrendAngel.js";

// second group of elements for drawing
// import Chart from "./lib/charts/CandleStickChartWithPitchfork.js";
// import Chart from "./lib/charts/CandleStickChartWithFibonacciTimeZone.js";
// import Chart from "./lib/charts/CandleStickChartWithFibonacciRetracement.js";
// import Chart from "./lib/charts/CandleStickChartWithFibonacciChannel.js";
// import Chart from "./lib/charts/CandleStickChartWithTrendBaseFibExtension.js";
// import Chart from "./lib/charts/CandleStickChartWithGannFan.js";

// third group of elements for drawing
// import Chart from "./lib/charts/CandleStickChartWithRectangle.js";
// import Chart from "./lib/charts/CandleStickChartWithRotatedRectangle.js";
// import Chart from "./lib/charts/CandleStickChartWithRotatedEllipse.js";
// import Chart from "./lib/charts/CandleStickChartWithRotatedTriangle.js";
// import Chart from "./lib/charts/CandleStickChartWithCurveLine.js";

// fourth group of elements for drawing
// import Chart from "./lib/charts/CandleStickChartWithEdge.js";
// import Chart from "./lib/charts/CandleStickChartWithArrowMarkUp.js";
// import Chart from "./lib/charts/CandleStickChartWithArrowMarkDown.js";
// import Chart from "./lib/charts/CandleStickChartWithInteractiveBrush.js";

// import Chart from "./lib/charts/CandleStickChartWithClickHandlerCallback.js";

require("stylesheets/re-stock");

const parseDate = timeParse("%Y-%m-%d");

if (!window.Modernizr.fetch || !window.Modernizr.promises) {
	require.ensure(["whatwg-fetch", "es6-promise"], function(require) {
		require("es6-promise");
		require("whatwg-fetch");
		loadPage();
	});
} else {
	loadPage();
}

function loadPage() {
	fetch("data/MSFT.tsv")
		.then(response => response.text())
		.then(data => tsvParse(data, d => {
			d.date = new Date(parseDate(d.date).getTime());
			d.open = +d.open;
			d.high = +d.high;
			d.low = +d.low;
			d.close = +d.close;
			d.volume = +d.volume;

			return d;
		}))
		.then(data => {
			const element = document.getElementById("chart");
			const root = element && ReactDOM.createRoot(element);

			root && root.render(
				<Chart data={data} type="svg" />
			);
		});
}
