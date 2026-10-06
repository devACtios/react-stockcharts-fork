

import { isNotDefined, path } from "../utils";
import { roc as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Rate of Change(ROC)
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		let previous;
		const queueprice = [];
		let skip = 0;

		return data.map(function(d, i) {
			const p = source(d, i);
			if (isNotDefined(previous) && isNotDefined(p)) {
				skip++;
				return undefined;

			} else if (i < windowSize + skip - 1) {
				queueprice.push(p);
				return undefined;

			} else if (i === windowSize + skip - 1) {
				queueprice.push(p);
				return 100 * (p - queueprice[0]) / queueprice[0];
			} else {
				queueprice.shift();
				queueprice.push(p);
				return 100 * (p - queueprice[0]) / queueprice[0];
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
