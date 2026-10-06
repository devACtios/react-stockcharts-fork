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

import { OBV as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;
	// ALGORITHM NAME : On Balance Volume (OBV)
	function calculator(data) {
		let obv, obv_pr, cl, cl_pr;

		return data.map(function(d, i) {
			if (i === 0) {
				cl_pr = d.close;
				obv_pr = d.volume;
				obv = undefined;
			}
			if (i > 0) {
				cl = d.close;
				if (cl > cl_pr) {
					obv = obv_pr + d.volume;
				}
				if (cl < cl_pr) {
					obv = obv_pr - d.volume;
				}
				if (cl === cl_pr) {
					obv = obv_pr;
				}
				cl_pr = cl;
				obv_pr = obv;
			}

			return obv;
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
