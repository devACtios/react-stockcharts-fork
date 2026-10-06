
import { isNotDefined, path } from "../utils";
import { dpo as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;

		const source = path(sourcePath);
		let previous;
		const queueprice = [];
		const queueSMA = [];
		const alpha = 1 / (windowSize);
		let initialAccumulator = 0;
		let fprice;
		// eslint-disable-next-line no-unused-vars
		let fSMA;
		let skip = 0;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				return undefined;

			} else if (i < windowSize + skip - 1) {
				initialAccumulator += v;
				queueprice.push(v);
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += v;
				queueprice.push(v);
				const initialValue = initialAccumulator * alpha;
				previous = initialValue;
				queueSMA.push(initialValue);
				return undefined;
			} else if ((i > windowSize + skip - 1) && (i < windowSize + skip + windowSize / 2)) {
				fprice = queueprice.shift();
				queueprice.push(v);
				const nextValue =  previous + (v - fprice) * alpha;
				previous = nextValue;
				queueSMA.push(nextValue);
				return undefined;
			} else if (i === windowSize + skip + windowSize / 2) {
				fprice = queueprice.shift();
				queueprice.push(v);
				const nextValue =  previous + (v - fprice) * alpha;
				previous = nextValue;
				queueSMA.push(nextValue);
				return v - queueSMA[0];
			} else {
				fprice = queueprice.shift();
				queueprice.push(v);
				const nextValue =  previous + (v - fprice) * alpha;
				previous = nextValue;
				fSMA = queueSMA.shift();
				queueSMA.push(nextValue);
				return v - queueSMA[0];
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
