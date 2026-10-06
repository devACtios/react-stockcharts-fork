

/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/bollingerBands.js

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
import { path, isNotDefined } from "../utils";

import { VIDYA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath } = options;

		const source = path(sourcePath);
		const smoothF = 2 / (windowSize + 1);
		const qC = [];
		const qO = [];
		let previous;
		let initialAccumulator = 0;
		let skip = 0;

		return data.map(function(d, i) {
			const price = source(d, i);
			const c = d.close;
			const o = d.open;
			if (isNotDefined(previous) && isNotDefined(price)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += price;
				qC.push(c);
				qO.push(o);
				return undefined;
			} else if (i === windowSize + skip - 1) {
				qC.push(c);
				qO.push(o);
				initialAccumulator += price;
				const initialValue = initialAccumulator / windowSize;
				previous = initialValue;
				return initialValue;
			} else {
				qC.shift();
				qO.shift();
				qC.push(c);
				qO.push(o);
				let sumUp = 0;
				let sumDown = 0;

				for (let i = 0; i < qC.length; i++) {
					const c = qC[i];
					const o = qO[i];
					const diff = o - c;
					if (diff < 0) {
						sumDown += Math.abs(diff);
					} else {
						sumUp += diff;
					}
				}

				const CMO = Math.abs((sumUp - sumDown) / (sumUp + sumDown));
				const nextValue = price * smoothF * CMO + previous * (1 - smoothF * CMO);
				previous = nextValue;
				return nextValue;
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
