
import sma from "./sma";
import { isDefined, last, slidingWindow, zipper } from "../utils";
import { emv as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
// ALGORITHM NAME : Easy of Movement(EMV)
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, movingAverageType, windowSizeSignal, movingAverageTypeSignal, sourcePath } = options;

		const source = sourcePath === "high/low/volume"
			? d => { return {  high: d.high, low: d.low, volume: d.volume  }; }
			: d => { return {  high: d.high, low: d.low, volume: d.volume  }; };

		const maAlgorithm = movingAverageType === "sma"
			? sma().options({ windowSize: windowSize, sourcePath: "close" })
			: slidingWindow().windowSize(windowSize);

		const signalAlgorithm = movingAverageTypeSignal === "sma"
			? sma().options({ windowSize: windowSizeSignal, sourcePath: undefined })
			: slidingWindow().windowSize(windowSizeSignal);

		const trueRangeAlgorithm = slidingWindow()
			.windowSize(2)
			.source(source)
			.accumulator(values => {
				const d = values[1];
				return d.high;
			});

		const trueRangeAlgorithm1 = slidingWindow()
			.windowSize(2)
			.source(source)
			.accumulator(values => {
				const prev = values[0];
				const d = values[1];
				return (d.high - prev.high) * 20;
			});

		const QstickCalculator = zipper()
			.combine((trueRangeAlgorithm, trueRangeAlgorithm1) => (isDefined(trueRangeAlgorithm) && isDefined(trueRangeAlgorithm1)) ? trueRangeAlgorithm : undefined);

		const QstickArray = QstickCalculator(trueRangeAlgorithm(data), trueRangeAlgorithm1(data));
		const undefinedArray = new Array(windowSizeSignal);
		const RezArray = undefinedArray.concat(signalAlgorithm(QstickArray.slice(windowSizeSignal)));
		const MAArray = maAlgorithm(data);

		const EMVAlgorithm = slidingWindow()
			.sourcePath(undefined)
			.accumulator((values) => {
				const sig = last(values).sig;
				const mean = last(values).mean;
				return {
					signalline: sig,
					line: mean
				};
			});

		const zip = zipper()
			.combine((datum, sig, mean) => ({ datum, sig, mean }));

		const tuples = zip(data, RezArray, MAArray);

		return EMVAlgorithm(tuples);
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
