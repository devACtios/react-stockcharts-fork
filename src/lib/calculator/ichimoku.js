

/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/ichimoku.js

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

import { ichimoku as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
// ALGORITHM NAME : Ichimoku
	let options = defaultOptions;

	function calculator(data) {
		const { tenkanPeriod, kijunPeriod, senkouPeriod } = options;

		let skip = 0;

		const ts = tenkanPeriod;
		const tm = kijunPeriod;
		const tl = senkouPeriod;

		const qh_tl = [];
		const qh_tm = [];
		const qh_ts = [];
		const ql_tl = [];
		const ql_tm = [];
		const ql_ts = [];

		const qchikou = [];
		const qsenkou_a = [];
		const qsenkou_b = [];

		let t = 0;
		let k = 0;
		let sa = 0;
		let sb = 0;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const c = d.close;

			if (isNotDefined(h) && isNotDefined(l)) {
				skip++;
				return undefined;
			} else if (i < tl - tm + skip - 1) {
				qh_tl.push(h);
				ql_tl.push(l);
				return undefined;
			} else if ((i < tl - ts + skip - 1) && (i >= tl - tm + skip)) {
				qh_tl.push(h);
				ql_tl.push(l);
				qh_tm.push(h);
				ql_tm.push(l);
				return undefined;
			} else if ((i < tl + skip - 1) && (i >= tl - ts + skip)) {
				qh_tl.push(h);
				ql_tl.push(l);
				qh_tm.push(h);
				ql_tm.push(l);
				qh_ts.push(h);
				ql_ts.push(l);
				return undefined;
			} else if ((i >= tl + skip) && (i < tl + tm + skip - 1)) {
				qh_tl.push(h);
				ql_tl.push(l);
				qh_tm.push(h);
				ql_tm.push(l);
				qh_ts.push(h);
				ql_ts.push(l);
				t = (Math.max.apply(null, qh_ts) + Math.min.apply(null, ql_ts)) / 2;
				k = (Math.max.apply(null, qh_tm) + Math.min.apply(null, ql_tm)) / 2;
				sa = (t + k) / 2;
				sb = (Math.max.apply(null, qh_tl) + Math.min.apply(null, ql_tl)) / 2;

				qchikou.push(c);
				qsenkou_a.push(sa);
				qsenkou_b.push(sb);
				return undefined;
			} else if (i === tl + tm + skip - 1) {
				qh_tl.push(h);
				ql_tl.push(l);
				qh_tm.push(h);
				ql_tm.push(l);
				qh_ts.push(h);
				ql_ts.push(l);
				t = (Math.max.apply(null, qh_ts) + Math.min.apply(null, ql_ts)) / 2;
				k = (Math.max.apply(null, qh_tm) + Math.min.apply(null, ql_tm)) / 2;
				sa = (t + k) / 2;
				sb = (Math.max.apply(null, qh_tl) + Math.min.apply(null, ql_tl)) / 2;
				qchikou.push(c);
				qsenkou_a.push(sa);
				qsenkou_b.push(sb);

				return {
					tenkan: t,
					kijun: k,
					senkou_a: qsenkou_a[0],
					senkou_b: qsenkou_b[0],
					chikou: qchikou[0]
				};
			} else {
				qh_tl.shift();
				ql_tl.shift();
				qh_tm.shift();
				ql_tm.shift();
				qh_ts.shift();
				ql_ts.shift();

				qchikou.shift();
				qsenkou_a.shift();
				qsenkou_b.shift();

				qh_tl.push(h);
				ql_tl.push(l);
				qh_tm.push(h);
				ql_tm.push(l);
				qh_ts.push(h);
				ql_ts.push(l);
				t = (Math.max.apply(null, qh_ts) + Math.min.apply(null, ql_ts)) / 2;
				k = (Math.max.apply(null, qh_tm) + Math.min.apply(null, ql_tm)) / 2;
				sa = (t + k) / 2;
				sb = (Math.max.apply(null, qh_tl) + Math.min.apply(null, ql_tl)) / 2;
				qchikou.push(c);
				qsenkou_a.push(sa);
				qsenkou_b.push(sb);

				return {
					tenkan: t,
					kijun: k,
					senkou_a: qsenkou_a[0],
					senkou_b: qsenkou_b[0],
					chikou: qchikou[0]
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
