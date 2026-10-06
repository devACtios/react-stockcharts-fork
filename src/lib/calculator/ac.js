

import sma from "./sma";

import { slidingWindow, zipper, last } from "../utils";
import { AC as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	// ALGORITHM NAME : Acceleration/Deceleration (AC)  --------------------------------
	// AC = AO - SMA(AO,5)
	// AO = SMA(Median Price, 5) - SMA(Median Price, 34)
	// Median Price = (high + low)/2
	function calculator(data) {
		const { windowSize, FastMAPeriod, SlowMAPeriod } = options;
		const source =  d => ({ high: d.high, low: d.low });

		const p1 = windowSize;
		const p2 = FastMAPeriod;
		const p3 = SlowMAPeriod;

		const MedianAlgorithm = slidingWindow()
			.windowSize(1)
			.source(source)
			.accumulator(values => {
				const d = values[0];
				return (d.high - d.low); // Median Price
			});

		// eslint-disable-next-line no-constant-condition
		const maAlgorithmSlow = "sma"
			? sma().options({ windowSize: p3, sourcePath: undefined })
			: slidingWindow().windowSize(p3);

		const DataSlow = maAlgorithmSlow(MedianAlgorithm(data)); // SMA(Median Price,slow)

		// eslint-disable-next-line no-constant-condition
		const maAlgorithmFast = "sma"
			? sma().options({ windowSize: p2, sourcePath: undefined })
			: slidingWindow().windowSize(p2);

		const DataFast = maAlgorithmFast(MedianAlgorithm(data));// SMA(Median Price,fast)

		const deltaSMAAlgorithm = slidingWindow()
			.windowSize(p1)
			.sourcePath(undefined)
			.accumulator((values) => {
				const Fast = last(values).maAlgorithmFast;
				const Slow = last(values).maAlgorithmSlow;
				return (Fast - Slow);
			});

		const zip = zipper()
			.combine((datum, maAlgorithmFast, maAlgorithmSlow) => ({ datum, maAlgorithmFast, maAlgorithmSlow }));
		const tuples = zip(data, DataFast, DataSlow);
		const deltaSMA = deltaSMAAlgorithm(tuples); // SMA(Median Price, fast) - SMA(Median Price, slow)

		const zipAO = zipper()
			.combine((datum, SMA_AO) => ({ datum, SMA_AO }));
		const tuplesAO = zipAO(data, deltaSMA);

		// eslint-disable-next-line no-constant-condition
		const SMA_AOAlgorithm = "sma"
			? sma().options({ windowSize: p1, sourcePath: "SMA_AO" })
			: slidingWindow().windowSize(p3);

		const undefinedArray3 = new Array(p3);
		const RezSMAOA = undefinedArray3.concat(SMA_AOAlgorithm(tuplesAO.slice(p3)));	// SMA(AO,5)

		const calc = slidingWindow()
			.windowSize(p3)
			.sourcePath(undefined)
			.accumulator((values) => {
				const a = last(values).a;
				const b = last(values).b;
				return (a - b);
			});

		const zipAC = zipper()
			.combine((datum, a, b) => ({ datum, a, b }));
		const ACdata = zipAC(data, deltaSMA, RezSMAOA);
		const ACrez = calc(ACdata);	 // AC

		return ACrez;
	}
	calculator.undefinedLength = function() {
		const { windowSize } = options;
		return windowSize - 1;
	};
	calculator.options = function(x) {
		if (!arguments.length) {
			return options;
		}
		options = { ...defaultOptions, ...x };
		return calculator;
	};

	return calculator;
}
