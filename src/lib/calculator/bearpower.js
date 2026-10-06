

import { isNotDefined } from "../utils";
import { bearpower as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Bears Power
		const { windowSize } = options;

		const alpha = 2 / (windowSize + 1);
		let previous;
		let initialAccumulator = 0;
		let skip = 0;

		return data.map(function(d, i) {
			const l = d.low;
			const c = d.close;

			if (isNotDefined(previous) && isNotDefined(c)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += c;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += c;
				const initialValue = initialAccumulator / windowSize;
				previous = initialValue;
				return (l - initialValue);
			} else {
				const nextValue = c * alpha + (1 - alpha) * previous;
				previous = nextValue;
				return (l - nextValue);
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
