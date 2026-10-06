

import sma from "./sma";
import { last, slidingWindow, zipper, isDefined } from "../utils";
import { qstick as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, movingAverageType, sourcePath } = options;

		const source = sourcePath === "open/close"
			? d => { return {  open: d.open, close: d.close  }; }
			: d => { return {  open: d.open, close: d.close  }; };

		const open = d => source(d).open,
			close = d => source(d).close;

		const rangeO = slidingWindow()
			.windowSize(windowSize)
			.accumulator(values => {
				const currentOpen = open(last(values));
				return currentOpen;
			});

		const rangeC = slidingWindow()
			.windowSize(windowSize)
			.accumulator(values => {
				const currentClose = close(last(values));
				return currentClose;
			});

		const maAlgorithm = movingAverageType === "sma"
			? sma().options({ windowSize: windowSize, sourcePath: undefined })
			: slidingWindow().windowSize(windowSize);

		const QstickCalculator = zipper()
			.combine((rangeC, rangeO) => (isDefined(rangeC) && isDefined(rangeO)) ? rangeC - rangeO : undefined);

		const QstickArray = QstickCalculator(rangeC(data), rangeO(data));

		const undefinedArray = new Array(windowSize);
		const RezArray = undefinedArray.concat(maAlgorithm(QstickArray.slice(windowSize)));

		return RezArray;
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
