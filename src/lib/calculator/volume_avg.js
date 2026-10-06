/*
The MIT License (MIT)

Copyright (c) 2014-2015 Scott Logic Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { slidingWindow } from "../utils";
import { VOLUME_AVG as defaultOptions } from "./defaultOptionsForComputation";
import sma from "./sma";
import tma from "./tma";
import ema from "./ema";
import wma from "./wma";

export default function() {
	let options = defaultOptions;
	const source = d => ({ volume: d.volume });
	// ALGORITHM NAME : Volume_avg
	function calculator(data) {
		const { windowSize, movingAverageType } = options;
		const volume = slidingWindow()
			.windowSize(1)
			.source(source)
			.accumulator(values => {
				const d = values[0];
				return d.volume; // Median Price
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
		return  maAlgorithm(volume(data));
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
