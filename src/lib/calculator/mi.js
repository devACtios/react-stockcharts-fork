


import { sum } from "d3-array";
import ema from "./ema";

import { slidingWindow, isDefined, zipper, last } from "../utils";
import { mi as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME Mass Index (MI)  --------------------------------
		// MI=sum(EMA(high-low,9)/EMA(EMA(high-low,9),9) ,n)

		const { windowSize, MassPeriod } = options;
		const source =  d => ({ high: d.high, low: d.low });

		const p1 = windowSize;
		const p2 = MassPeriod;

		const MedianAlgorithm = slidingWindow()
			.windowSize(1)
			.source(source)
			.accumulator(values => {
				const d = values[0];
				return (d.high - d.low); // Median Price
			});

		// eslint-disable-next-line no-constant-condition
		const maAlgorithm =  "ema"
			? ema().options({ windowSize: p2, sourcePath: undefined })
			: slidingWindow().windowSize(p2);

		const DataMA = maAlgorithm(MedianAlgorithm(data)); // first MA

		const zip = zipper().combine((datum, SecondMA) => ({ datum, SecondMA }));
		const tuples = zip(data, DataMA);

		// eslint-disable-next-line no-constant-condition
		const maAlgorithmSecond = "ema"
			? ema().options({ windowSize: p2, sourcePath: "SecondMA" })
			: slidingWindow().windowSize(p2);

		const undefinedArray = new Array(p2);
		const RezSecondMA = undefinedArray.concat(maAlgorithmSecond(tuples.slice(p2)));	// EMA(EMA(high-low,9),9)

		const calc = slidingWindow()
			.windowSize(p1)
			.sourcePath(undefined)
			.accumulator((values) => {
				const a = last(values).a;
				const b = last(values).b;
				const rez_ab = isDefined(a) && isDefined(b)
					? (a / b)
					: (undefined);
				return rez_ab;
			});

		const zip2 = zipper().combine((datum, a, b) => ({ datum, a, b }));
		const MIdata = zip2(data, DataMA, RezSecondMA);
		const MIrez = calc(MIdata);

		const MIAlgorithm = slidingWindow()
			.windowSize(p1)
			.sourcePath("MIrez")
			.accumulator(values => {
				const ab = last(values);
				const mi_rez = isDefined(ab)
					?  sum(values) * p1
					: (undefined);
				return mi_rez;
			});

		const zip3 = zipper().combine((datum, MIrez) => ({ datum, MIrez }));
		const MIRezdata = zip3(data, MIrez);
		const MI = MIAlgorithm(MIRezdata);

		return MI;
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
