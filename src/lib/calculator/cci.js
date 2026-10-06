

import { isNotDefined } from "../utils";
import { cci as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Commodity Channel Index
		const { windowSize, upborder, bottomborder } = options;

		let skip = 0;

		const qTP = [];
		let quout = 0;
		let previous;
		let initialAccumulator = 0;
		let Drazn = 0;
		let SMADrazn = 0;
		let tmp = 0;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const c = d.close;
			let tp = (h + l + c) / 3;

			if (isNotDefined(previous) && isNotDefined(h)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				tp = (h + l + c) / 3;
				initialAccumulator += tp;
				qTP.push(tp);
				return undefined;
			} else if (i === windowSize + skip - 1) {
				tp = (h + l + c) / 3;
				initialAccumulator += tp;
				qTP.push(tp);
				previous = initialAccumulator / windowSize;
				Drazn = tp - previous;
				SMADrazn = qTP.reduce(function(sum, current) {return Math.abs(previous + sum - current);}) / windowSize;

				const toph = upborder;
				const topl = bottomborder;
				const mid = Drazn / (SMADrazn * 0.015);

				return {
					top: toph,
					middle: mid,
					bottom: topl
				};

			} else {
				tp = (h + l + c) / 3;
				quout = qTP.shift();
				qTP.push(tp);
				tmp = (previous + (tp - quout) / windowSize);
				Drazn = tp - tmp;
				SMADrazn = qTP.reduce(function(sum, current) {return Math.abs(tmp + sum - current);}) / windowSize;

				const toph = upborder;
				const topl = bottomborder;
				const mid = Drazn / (SMADrazn * 0.015);
				previous = tmp;

				return {
					top: toph,
					middle: mid,
					bottom: topl
				};
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
