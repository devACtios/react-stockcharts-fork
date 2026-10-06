/* eslint-disable no-unused-vars */
import { isNotDefined, path } from "../utils";
import { KAMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath, fast_ma_period, slow_ma_period } = options;

		const source = path(sourcePath);
		const queueprice = [], queuesum = [];
		const fastest = 2 / (fast_ma_period + 1);
		const slowest = 2 / (slow_ma_period + 1);
		let vprev, previous, initialAccumulator = 0, skip = 0;

		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				vprev = v;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += v;
				queueprice.push(v);
				queuesum.push(Math.abs(v - vprev));
				vprev = v;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += v;
				queueprice.push(v);
				queuesum.push(Math.abs(v - vprev));
				const initialValue = initialAccumulator / windowSize;
				vprev = v;
				previous = initialValue;
				return initialValue;
			} else {
				queueprice.shift();
				queuesum.shift();
				queueprice.push(v);
				queuesum.push(Math.abs(v - vprev));
				const signal = Math.abs(v - queueprice[0]);
				const ssc = queuesum.reduce(function(sum, current) {
					return sum + current;
				});
				const er = (ssc > 0) ? signal / ssc : 0;
				const sc = Math.pow(er * (fastest - slowest) + slowest, 2);
				const nextValue = previous + sc * (v - previous);
				previous = nextValue;
				vprev = v;
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
