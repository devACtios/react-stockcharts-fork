

import { isNotDefined } from "../utils";
import { bw_mfi as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		const { multiplier } = options;
		const ml = multiplier;

		// eslint-disable-next-line no-unused-vars
		let skip = 0;
		let rez = 0;

		return data.map(function(d) {
			const h = d.high;
			const l = d.low;

			if ( isNotDefined(h)) {
				skip++;
				return undefined;
			} else {
				rez = ml * (h - l) / l;
				return rez;
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
