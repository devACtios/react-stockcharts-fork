/* eslint-disable no-unused-vars */
import { isNotDefined, path } from "../utils";
import { FRAMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		const Nmas1 = [], Nmas2 = [], Nmas3 = [];
		let previous = 0, N1, N2, N3, initialAccumulator = 0, skip = 0;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				return undefined;
			} else if (i <= (windowSize / 2) + skip) {
				initialAccumulator += v;
				Nmas1.push(v);
				Nmas3.push(v);
				return undefined;
			} else if ((i > (windowSize / 2) + skip) && (i < windowSize + skip + 1)) {
				initialAccumulator += v;
				Nmas2.push(v);
				Nmas3.push(v);
				return undefined;
			} else if (i === windowSize + skip + 1) {
				initialAccumulator += v;
				Nmas2.push(v);
				Nmas3.push(v);
				const initialValue = initialAccumulator / (windowSize + 2);
				previous = initialValue;
				return initialValue;
			} else {
				Nmas1.shift();
				Nmas1.push(Nmas2[0]);
				Nmas2.push(v);
				Nmas2.shift();
				Nmas3.push(v);
				Nmas3.shift();
				N1 = (Math.max.apply(null, Nmas1) - Math.min.apply(null, Nmas1)) / (windowSize / 2);
				N2 = (Math.max.apply(null, Nmas2) - Math.min.apply(null, Nmas2)) / (windowSize / 2);
				N3 = (Math.max.apply(null, Nmas3) - Math.min.apply(null, Nmas3)) / windowSize;
				const d = ((Math.log(N1 + N2) - Math.log(N3))) / Math.log(2);
				const nextValue = (Math.exp(-4.6 * (d - 1))) * v + (1 - (Math.exp(-4.6 * (d - 1)))) * previous;
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
