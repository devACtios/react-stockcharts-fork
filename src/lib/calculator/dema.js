import { isNotDefined, path } from "../utils";
import { DEMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		const alpha = 2 / (windowSize + 1);
		let previous, preverr, initialAccumulator = 0, skip = 0;

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
				preverr = 0;
				return initialValue;
			} else {
				const EMAi = v * alpha + (1 - alpha) * previous;
				const EMAerr = (v - EMAi) * alpha + (1 - alpha) * preverr;
				const DEMA = EMAi + EMAerr;
				previous = EMAi;
				preverr = EMAerr;
				return DEMA;
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
