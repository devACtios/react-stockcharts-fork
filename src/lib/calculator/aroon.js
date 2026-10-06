import { isNotDefined } from "../utils";
import { aroon as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Aroon Index
		const { windowSize, uplineSize, middlelineSize, bottomlineSize  } = options;

		let skip = 0;
		let j = 0;

		const qh = [];
		const ql = [];
		let maxh = 0;
		let minl = 0;
		let Up = 0;
		let Down = 0;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;

			if (isNotDefined(h) && isNotDefined(l)) {
				skip++;
				return undefined;
			} else if (i <  skip + windowSize - 1) {
				qh.push(h);
				ql.push(l);
				return undefined;
			} else if (i === windowSize + skip - 1 ) {
				qh.push(h);
				ql.push(l);

				for (j = 0; j < qh.length; j++) {
					if (qh[j] === Math.max.apply(null, qh)) {
						maxh = (1);
					}
				}
				for (j = 0; j < ql.length; j++) {
					if (ql[j] === Math.min.apply(null, ql)) {
						minl = (j);
					}
				}

				Up = (100 * (windowSize - maxh) / windowSize);
				Down = (100 * (windowSize - minl) / windowSize);
				return {
					upline: uplineSize,
					middleline: middlelineSize,
					AU: Up,
					AD: Down,
					bottomline: bottomlineSize
				};

			} else {
				qh.shift();
				ql.shift();
				qh.push(h);
				ql.push(l);

				for (j = 0; j < qh.length; j++) {
					if (qh[j] === Math.max.apply(null, qh)) {
						maxh = (j);
					}
				}
				for (j = 0; j < ql.length; j++) {
					if (ql[j] === Math.min.apply(null, ql)) {
						minl = (j);
					}
				}
				Up = (100 * (windowSize - maxh) / windowSize);
				Down = (100 * (windowSize - minl) / windowSize);
				return {
					upline: uplineSize,
					middleline: middlelineSize,
					AU: Up,
					AD: Down,
					bottomline: bottomlineSize
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
