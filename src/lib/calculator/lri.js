

/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/exponentialMovingAverage.js

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
import { lri as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	function calculator(data) {
		// ALGORITHM NAME : Linear Regression Indicator (LRI)
		const { windowSize } = options;

		let skip = 0;
		let j = 0;
		let ii = 0;

		const qh = [];
		const ql = [];
		const qc = [];
		const qi = [];
		let k1, k2, k3, k4;
		k1 = k2 = k3 = k4 = 0;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const c = d.close;
			const n = windowSize;
			let y1 = 0;
			let alpha = 0;
			let beta = 0;

			if (isNotDefined(h) && isNotDefined(c)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				qh.push(h);
				ql.push(l);
				qc.push(c);
				ii = i + 1;
				qi.push(ii);
				return undefined;
			} else if (i === windowSize + skip - 1) {
				qh.push(h);
				ql.push(l);
				qc.push(c);
				ii = i + 1;
				qi.push(ii);
				for (j = 0; j < qi.length; j++) {
					k1 += (qi[j]) * qc[j];
				}
				for (j = 0; j < qi.length; j++) {
					k2 += (qi[j]) * (qi[j]);
				}
				k3 = qc.reduce(function(sum, current) {
					return sum + current;
				});
				k4 = qi.reduce(function(sum, current) {
					return sum + current;
				});
				beta = (n * k1 - k4 * k3) / (n * k2 - k4 * k4);
				alpha = (k3 - beta * k4) / n;
				y1 = alpha + beta * n;
				return y1;
			} else {
				k1 = 0;
				k2 = 0;
				k3 = 0;
				k4 = 0;
				qh.push(h);
				ql.push(l);
				qc.push(c);
				qh.shift();
				ql.shift();
				qc.shift();
				for (j = 0; j < qi.length; j++) {
					k1 += (qi[j]) * qc[j];
				}
				for (j = 0; j < qi.length; j++) {
					k2 += (qi[j]) * (qi[j]);
				}
				k3 = qc.reduce(function(sum, current) {
					return sum + current;
				});
				k4 = qi.reduce(function(sum, current) {
					return sum + current;
				});
				beta = (n * k1 - k4 * k3) / (n * k2 - k4 * k4);
				alpha = (k3 - beta * k4) / n;
				y1 = alpha + beta * n;
				return y1;
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
