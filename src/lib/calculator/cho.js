import a_d from "./a_d";
import sma from "./sma";

import { isDefined, zipper } from "../utils";
import { cho as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Chaikin Oscillator (CHO)  --------------------------------
		// CHO = SMA(A/D , 3) - SMA(A/D , 10)
		const { maPeriod1, maPeriod2 } = options;
		const p1 = maPeriod1;
		const p2 = maPeriod2;

		const adAlgorithm = a_d().options({ sourcePath: undefined });
		const ma1Algorithm = sma().options({ windowSize: p1, sourcePath: undefined });
		const ma2Algorithm = sma().options({ windowSize: p2, sourcePath: undefined });

		const dataMA1 = ma1Algorithm(adAlgorithm(data));
		const dataMA2 = ma2Algorithm(adAlgorithm(data));

		const choAlgorithm = zipper().combine(
			(dataMA1, dataMA2) => (isDefined(dataMA1) && isDefined(dataMA2)) ? dataMA1 - dataMA2 : undefined
		);

		const cho = choAlgorithm(dataMA1, dataMA2); // CHO

		return cho;
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
