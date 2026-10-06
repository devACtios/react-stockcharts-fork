

import { isNotDefined } from "../utils";
import { williams_r as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Williams %R
		const { windowSize, upborder, bottomborder } = options;

		let skip = 0;
		const qh = [];
		const ql = [];
		let hMax = 0;
		let lMin = 0;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const c = d.close;

			if (isNotDefined(h) && isNotDefined(l)) {
				skip++;
				return undefined;

			} else if  (i < windowSize + skip - 1) {
				qh.push(h);
				ql.push(l);
				return undefined;
			} else if (i === windowSize + skip - 1) {
				qh.push(h);
				ql.push(l);
				hMax = Math.max.apply(null, qh);
				lMin = Math.min.apply(null, ql);
				const toph = upborder;
				const topl = bottomborder;
				const mid = (-100) * (hMax - c) / (hMax - lMin);

				return {
					top: toph,
					middle: mid,
					bottom: topl
				};
			} else {
				qh.shift();
				ql.shift();
				qh.push(h);
				ql.push(l);
				hMax = Math.max.apply(null, qh);
				lMin = Math.min.apply(null, ql);
				const toph = upborder;
				const topl = bottomborder;
				const mid = (-100) * (hMax - c) / (hMax - lMin);

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
