import { isNotDefined } from "../utils";
import { demarker as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize } = options;

		let skip = 0;
		let prevHigh = 0;
		let prevLow = 0;
		const DeMax = [];
		const DeMin = [];
		let SMADeMax = 0;
		let SMADeMin = 0;

		return data.map(function(d, i) {
			const high = d.high;
			const low = d.low;

			if (isNotDefined(high) && isNotDefined(low)) {
				skip++;
				return undefined;
			}

			if (i === skip + 1) {
				prevLow = low;
				prevHigh = high;
			} else if ((i > skip + 1) && (i < windowSize + skip - 1)) {
				if (high > prevHigh) {
					DeMax.push((high - prevHigh));
				} else {
					DeMax.push(0);
				}
				if (low < prevLow) {
					DeMin.push((prevLow - low));
				} else {
					DeMin.push(0);
				}
				prevLow = low;
				prevHigh = high;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				if (high > prevHigh) {
					DeMax.push((high - prevHigh));
				} else {
					DeMax.push(0);
				}
				if (low < prevLow) {
					DeMin.push((prevLow - low));
				} else {
					DeMin.push(0);
				}
				prevLow = low;
				prevHigh = high;

				SMADeMax = ((DeMax.reduce(function(sum, current) {return sum + current;})) / windowSize);
				SMADeMin = ((DeMin.reduce(function(sum, current) {return sum + current;})) / windowSize);

				return SMADeMax / (SMADeMax + SMADeMin);
			} else {
				DeMax.shift();
				DeMin.shift();

				if (high > prevHigh) {
					DeMax.push((high - prevHigh));
				} else {
					DeMax.push(0);
				}
				if (low < prevLow) {
					DeMin.push((prevLow - low));
				} else {
					DeMin.push(0);
				}
				prevLow = low;
				prevHigh = high;

				SMADeMax = ((DeMax.reduce(function(sum, current) {return sum + current;})) / windowSize);
				SMADeMin = ((DeMin.reduce(function(sum, current) {return sum + current;})) / windowSize);

				return SMADeMax / (SMADeMax + SMADeMin);
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
