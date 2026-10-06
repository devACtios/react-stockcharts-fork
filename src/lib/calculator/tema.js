import { isNotDefined, path } from "../utils";
import { TEMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		const alpha = 2 / (windowSize + 1);
		let prevema1, prevema2, prevema3, initialAccumulator = 0, skip = 0;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(prevema1) && isNotDefined(v)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += v;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += v;
				const initialValue = initialAccumulator / windowSize;
				prevema1 = initialValue;
				prevema2 = initialValue;
				prevema3 = initialValue;
				return initialValue;
			} else {
				const EMA1 = v * alpha + (1 - alpha) * prevema1;
				const EMA2 = EMA1 * alpha + (1 - alpha) * prevema2;
				const EMA3 = EMA2 * alpha + (1 - alpha) * prevema3;
				prevema1 = EMA1;
				prevema2 = EMA2;
				prevema3 = EMA3;

				const TEMA = (3 * EMA1) - (3 * EMA2) + EMA3;
				return TEMA;
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
