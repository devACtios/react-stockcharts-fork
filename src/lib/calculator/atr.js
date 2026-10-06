

import { ATR as defaultOptions } from "./defaultOptionsForComputation";
import { slidingWindow } from "../utils";
import ema from "./ema";
import sma from "./sma";
import wma from "./wma";
import tma from "./tma";

export default function() {

	let options = defaultOptions;
	let source = d => ({ open: d.open, high: d.high, low: d.low, close: d.close });

	function calculator(data) {
		const { windowSize, movingAverageType } = options;

		const trueRangeAlgorithm = slidingWindow()
			.windowSize(2)
			.source(source)
			.undefinedValue(d => d.high - d.low) // the first TR value is simply the High minus the Low
			.accumulator(values => {
				const prev = values[0];
				const d = values[1];
				return Math.max(d.high - d.low,
					d.high - prev.close,
					d.low - prev.close);
			});

		let maAlgorithm;
		switch ( movingAverageType ) {
			case "sma":
				maAlgorithm = sma().options({ windowSize: windowSize, sourcePath: undefined });
				break;
			case "ema":
				maAlgorithm = ema().options({ windowSize: windowSize, sourcePath: undefined });
				break;
			case "wma":
				maAlgorithm = wma().options({ windowSize: windowSize, sourcePath: undefined });
				break;
			case "tma":
				maAlgorithm = tma().options({ windowSize: windowSize, sourcePath: undefined });
				break;
		}
		const newData = maAlgorithm(trueRangeAlgorithm(data));
		return newData;
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

	calculator.source = function(x) {
		if (!arguments.length) {
			return source;
		}
		source = x;
		return calculator;
	};

	return calculator;
}
