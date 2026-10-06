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

import { MFI as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;
	// ALGORITHM NAME : Market Facilitation Index (MFI)
	function calculator(data) {
		const { windowSize } = options;
		let typical_price, typical_price_privious, money_flow;
		let flow_ratio, flow_index, val_positive_minus, val_negative_minus;
		let val_positive = 0;
		let val_negative = 0;
		let ind = 0;
		const arr_positive = [];
		const arr_negative = [];

		return data.map(function(d, i) {
			if (i === 0) {
				typical_price_privious = (d.high + d.low + d.close) / 3;
				ind++;
			}
			if (i > 0) {
				typical_price = (d.high + d.low + d.close) / 3;
				money_flow = typical_price * d.volume;
				if (typical_price >= typical_price_privious) {
					val_positive += money_flow;
					arr_positive.push(money_flow);
					arr_negative.push(0);
				} else {
					val_negative += money_flow;
					arr_negative.push(money_flow);
					arr_positive.push(0);
				}

				if (ind >= windowSize) {
					if (i !== windowSize) {
						val_positive = val_positive - val_positive_minus;
						val_negative = val_negative - val_negative_minus;
					}
					val_positive_minus = arr_positive[0];
					val_negative_minus = arr_negative[0];
					arr_positive.shift();
					arr_negative.shift();
				}

				typical_price_privious = typical_price;
				if (ind >= windowSize) {
					flow_ratio = val_positive / val_negative;
					flow_index = 100 - (100 / (1 + flow_ratio));
					ind++;
					return flow_index;
				} else {
					ind++;
					return undefined;
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
