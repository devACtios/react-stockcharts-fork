

/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/donchianchannel.js

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

import { donchianchannel as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
// ALGORITHM NAME : Donchian Channel
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, percent } = options;

		let skip = 0;
		const qh = [];
		const ql = [];

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;

			if (isNotDefined(h) && isNotDefined(l)) {
				skip++;
				return undefined;

			} else if (i < windowSize + skip - 1) {
				qh.push(h);
				ql.push(l);
				return undefined;

			} else if (i === windowSize + skip - 1) {
				qh.push(h);
				ql.push(l);
				const toph = Math.max.apply(null, qh);
				const topl = Math.min.apply(null, ql);
				const mid = (toph + topl) / 2;
				return {
					top: toph,
					middle: mid,
					bottom: topl
				};
			} else {
				qh.push(h);
				ql.push(l);
				const toph = Math.max.apply(null, qh);
				const topl = Math.min.apply(null, ql);
				const mid = toph - (toph - topl) * (percent / 100 );
				return {
					top: toph,
					middle: mid,
					bottom: topl
				};
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
