

import { path, isNotDefined } from "../utils";
import { vhf as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;

		const source = path(sourcePath);
		let previous;
		const queueClose = [];
		// eslint-disable-next-line prefer-const
		let deltaClose = [];
		let skip = 0;
		let hMax = 0;
		let lMin = 0;
		let prev = 0;

		return data.map(function(d, i) {
			const c = source(d, i);
			if (isNotDefined(previous) && isNotDefined(c)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				queueClose.push(c);
				return undefined;
			} else if (i === windowSize + skip - 1) {
				queueClose.push(c);

				hMax = Math.max.apply(null, queueClose);
				lMin = Math.min.apply(null, queueClose);
				prev = 0;
				for (let j = 0; j < queueClose.length; j++) {
					deltaClose[j] = queueClose[j] - prev;
					prev = queueClose[j];
				}

				const sumRazn = deltaClose.reduce(function(sum, current) {return sum + current;});
				const result = (hMax - lMin) / sumRazn;
				return result;

			} else {
				queueClose.shift();
				queueClose.push(c);

				hMax = Math.max.apply(null, queueClose);
				lMin = Math.min.apply(null, queueClose);
				prev = 0;
				for (let j = 0; j < queueClose.length; j++) {
					deltaClose[j] = queueClose[j] - prev;
					prev = queueClose[j];
				}

				const sumRazn = deltaClose.reduce(function(sum, current) {
					return sum + current;
				});

				const result = (hMax - lMin) / sumRazn;
				return result;
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
