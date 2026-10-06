// Williams' Percent Range
import { max, min } from "d3-array";

import { last, slidingWindow } from "../utils";
import { WPR as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;
	let source = d => ({ high: d.high, low: d.low, close: d.close });

	function calculator(data) {
		const { windowSize } = options;

		const high = d => source(d).high;
		const low = d => source(d).low;
		const close = d => source(d).close;

		const williamsPercentRange = slidingWindow()
			.windowSize(windowSize)
			.accumulator(values => {
				const maxHigh = max(values, high);
				const minLow = min(values, low);

				const currentClose = close(last(values));
				const percentRange = -(maxHigh - currentClose) / (maxHigh - minLow) * 100;

				return percentRange;
			});

		return williamsPercentRange(data);
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

	calculator.source = function(x) {
		if (!arguments.length) {
			return source;
		}

		source = x;

		return calculator;
	};

	return calculator;
}