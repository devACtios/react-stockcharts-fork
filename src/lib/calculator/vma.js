import { isNotDefined, path } from "../utils";
import { VMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		const qUpSum = [];
		const qDwnSum = [];
		const alpha = 2 / (windowSize + 1);
		let previous, vprev, initialAccumulator = 0, skip = 0;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				vprev = v;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += v;
				if (v >= vprev) {
					qUpSum.push(v - vprev);
					qDwnSum.push(0);
				} else {
					qUpSum.push(0);
					qDwnSum.push(vprev - v);
				}
				vprev = v;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += v;
				if (v >= vprev) {
					qUpSum.push(v - vprev);
					qDwnSum.push(0);
				} else {
					qUpSum.push(0);
					qDwnSum.push(vprev - v);
				}
				const initialValue = initialAccumulator / windowSize;
				vprev = v;
				previous = initialValue;
				return initialValue;
			} else {
				qUpSum.shift();
				qDwnSum.shift();
				if (v >= vprev) {
					qUpSum.push(v - vprev);
					qDwnSum.push(0);
				} else {
					qUpSum.push(0);
					qDwnSum.push(vprev - v);
				}
				const CMOup = qUpSum.reduce(function(sum, current) {
					return sum + current;
				});

				const CMOdwn = qDwnSum.reduce(function(sum, current) {
					return sum + current;
				});

				const nextValue = alpha * Math.abs((CMOup - CMOdwn) / (CMOup + CMOdwn)) * v + (1 - alpha * Math.abs((CMOup - CMOdwn) / (CMOup + CMOdwn))) * previous;

				vprev = v;
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
