/* eslint-disable no-unused-vars */
import { isNotDefined, path } from "../utils";
import { HMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;
		const source = path(sourcePath);
		const alpha = 1 / windowSize;
		const beta = 2 / windowSize;
		const queueprice = [], hullprice = [];
		let previous, hprevious, initialAccumulator = 0, hinitialAccumulator = 0,
			skip = 0, fprice, hfprice;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += v;
				queueprice.push(v);
				if (i > windowSize / 2 + skip - 1) {
					hinitialAccumulator += v;
					hullprice.push(v);
				}
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += v;
				queueprice.push(v);
				const initialValue = initialAccumulator * alpha;
				previous = initialValue;
				hinitialAccumulator += v;
				hullprice.push(v);
				const hinitialValue = hinitialAccumulator * beta;
				hprevious = hinitialValue;
				return 2 * hinitialValue - initialValue;
			} else {
				fprice = queueprice.shift();
				queueprice.push(v);
				const nextValue = previous + (v - fprice) * alpha;
				previous = nextValue;
				hfprice = hullprice.shift();
				hullprice.push(v);
				const hnextValue = hprevious + (v - hfprice) * beta;
				hprevious = hnextValue;
				return 2 * hnextValue - nextValue;
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
