
import sma from "./sma";

import { isDefined, zipper } from "../utils";
import { osma as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
// ALGORITHM NAME : Oscillator of MA (OsMA)
	let options = defaultOptions;

	function calculator(data) {
		const { fast, slow, signal, sourcePath } = options;

		const fastMA = sma()
			.options({ windowSize: fast, sourcePath: sourcePath });
		const slowMA = sma()
			.options({ windowSize: slow, sourcePath: sourcePath });
		const signalMA = sma()
			.options({ windowSize: signal, sourcePath: undefined });

		const osmaCalculator = zipper()
			.combine((fastMA, slowMA) => (isDefined(fastMA) && isDefined(slowMA)) ? fastMA - slowMA : undefined);

		const osmaArray = osmaCalculator(fastMA(data), slowMA(data));

		const undefinedArray = new Array(slow);
		const signalArray = undefinedArray.concat(signalMA(osmaArray.slice(slow)));

		const zip = zipper()
			.combine((osma, signal) => ({
				osma,
				signal,
				divergence: (isDefined(osma) && isDefined(signal)) ? osma - signal : undefined,
			}));

		const osma = zip(osmaArray, signalArray);

		return osma;

	}

	calculator.undefinedLength = function() {
		const { slow, signal } = options;
		return slow + signal - 1;
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
