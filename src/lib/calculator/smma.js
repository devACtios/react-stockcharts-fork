import { isNotDefined, path } from "../utils";
import { SMMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		let previous, initialAccumulator = 0, skip = 0;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += v;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += v;
				const initialValue = initialAccumulator / windowSize;
				previous = initialValue;
				return initialValue;
			} else if (i === windowSize + skip) {
				initialAccumulator += v;
				const secondValue = (previous * (windowSize - 1) + v) / windowSize;
				previous = secondValue;
				return secondValue;
			} else {
				const prevsum = previous * windowSize;
				const nextValue = (prevsum - previous + v) / windowSize;
				previous = nextValue;
				return nextValue;
			}
		});
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
