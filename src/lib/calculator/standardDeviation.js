import { deviation } from "d3-array";

import { slidingWindow, path } from "../utils";

import { StandardDeviation as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;

		const source = path(sourcePath);

		const stdDevAlgorithm = slidingWindow()
			.windowSize(windowSize)
			.accumulator((values) => {
				const stdDev = deviation(values, (each) => source(each));
				return stdDev;
			});

		const newData = stdDevAlgorithm(data);

		return newData;
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
