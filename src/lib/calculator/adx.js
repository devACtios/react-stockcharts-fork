import { ADX as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize } = options;
		const dPeriod = 2;

		let periodSum = 0;
		const sumArgs = [];

		let prevHigh;
		let prevLow;

		return data.map((d, i) => {
			if (i < dPeriod - 1) {
				prevHigh = d.high;
				prevLow = d.low;

				return undefined;
			}

			const highDiff = d.high - prevHigh;
			const lowDiff = d.low - prevLow;

			const plusDI = highDiff > 0 && highDiff > lowDiff ? highDiff : 0;
			const minusDI = lowDiff > 0 && lowDiff > highDiff ? lowDiff : 0;

			const currentSum = (plusDI - minusDI) / (plusDI - minusDI);
			sumArgs.push(currentSum);
			periodSum += currentSum;

			if (i < windowSize - 1) {
				return {
					plusDI,
					minusDI,
					adx: undefined
				};
			}

			prevHigh = d.high;
			prevLow = d.low;
			periodSum -= sumArgs.shift();

			return {
				plusDI,
				minusDI,
				adx: periodSum / windowSize
			};
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