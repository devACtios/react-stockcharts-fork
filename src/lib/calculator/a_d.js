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

import { isNotDefined } from "../utils";
import { A_D as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;
	// ALGORITHM NAME : Accumulation/Distribution(A/D)
	// a_d(i) = (( close(i)-low(i))-(high(i)-close(i))*volume(i)/(high(i)-low(i))+a_d(i-1);
	function calculator(data) {
		let previous;
		let skip = 0;
		let InitialVal;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const v = d.volume;
			const c = d.close;

			let nextValue;

			if (isNotDefined(previous) && isNotDefined(v)) {
				skip++;
				return undefined;
			} else if (i + skip === 0) {
				InitialVal = v * ((c - l) - (h - c)) / (h - l);
				previous = InitialVal;
				return InitialVal;
			} else {
				if ((Math.abs(h - l)) > 0) {
					nextValue = v * ((c - l) - (h - c)) / (h - l) + previous;
					previous = nextValue;
					return nextValue;
				} else {
					nextValue = previous;
					return nextValue;
				}
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
