
import { isNotDefined, path } from "../utils";
import { momentum as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;
	function calculator(data) {
		const { windowSize, sourcePath } = options;

		let skip = 0;
		const source = path(sourcePath);

		const arr_data = [];
		return data.map(function(d, i) {
			const p = source(d, i);
			if (isNotDefined(p)) {
				arr_data.push(p);
				skip++;
				return undefined;
			} else if (i < windowSize + skip) {
				arr_data.push(p);
				return undefined;
			} else if (i === windowSize + skip) {
				arr_data.push(p);
				return p - arr_data[0];
			} else {
				arr_data.shift();
				arr_data.push(p);
				return p - arr_data[0];
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
