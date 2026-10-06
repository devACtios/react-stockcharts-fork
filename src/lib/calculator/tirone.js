
import { isNotDefined } from "../utils";

import { tirone as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { windowSize } = options;

		let skip = 0;
		const qh = [];
		const ql = [];
		let maxh, minl;
		let l1, l2, l3, l4, l5, adj_mean;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const c = d.close;

			if (isNotDefined(h) && isNotDefined(c)) {
				skip++;
				return undefined;

			} else if (i <= windowSize + skip - 1) {
				ql.push(l);
				qh.push(h);
				return undefined;

			} else if (i === windowSize + skip) {
				ql.push(l);
				qh.push(h);
				maxh = Math.max.apply(null, qh);
				minl = Math.min.apply(null, ql);
				adj_mean = (maxh + minl + c) / 3;

				l1 = adj_mean + (maxh - minl);
				l2 = 2 * adj_mean - minl;
				l3 = adj_mean;
				l4 = 2 * adj_mean - maxh;
				l5 = adj_mean - (maxh - minl);

				return {
					upline: l1,
					line2: l2,
					line3: l3,
					line4: l4,
					bottomline: l5
				};
			} else {
				qh.shift();
				ql.shift();
				ql.push(l);
				qh.push(h);
				maxh = Math.max.apply(null, qh);
				minl = Math.min.apply(null, ql);
				adj_mean = (maxh + minl + c) / 3;

				l1 = adj_mean + (maxh - minl);
				l2 = 2 * adj_mean - minl;
				l3 = adj_mean;
				l4 = 2 * adj_mean - maxh;
				l5 = adj_mean - (maxh - minl);

				return {
					upline: l1,
					line2: l2,
					line3: l3,
					line4: l4,
					bottomline: l5
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
