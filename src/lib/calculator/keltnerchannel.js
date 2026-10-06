

/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/keltnerchannel.js

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

import { mean } from "d3-array";

import ema from "./ema";
import atr from "./atr";

import { last, slidingWindow, zipper } from "../utils";

import { keltnerchannel as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, windowSize_atr, multiplier, movingAverageType, sourcePath } = options;

		const meanAlgorithm = movingAverageType === "ema"
			? ema().options({ windowSize, sourcePath })
			: slidingWindow().windowSize(windowSize)
				.accumulator(values => mean(values)).sourcePath(sourcePath);

		const atrAlgorithm = atr().options({ windowSize_atr });

		const keltnerchannelAlgorithm = slidingWindow()
			.windowSize(windowSize)
			.accumulator((values) => {
				const atr = last(values).atr;
				const mean = last(values).mean;
				return {
					top: mean + multiplier * atr,
					middle: mean,
					bottom: mean - multiplier * atr
				};
			});

		const zip = zipper()
			.combine((datum, atr, mean) => ({ datum, atr, mean }));
		const tuples = zip(data, atrAlgorithm(data), meanAlgorithm(data));

		return keltnerchannelAlgorithm(tuples);
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
