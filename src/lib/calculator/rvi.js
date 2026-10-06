
import { isNotDefined } from "../utils";
import { rvi as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
// ALGORITHM NAME : Relative Vigor Index
	let options = defaultOptions;

	function calculator(data) {
		let skip = 0;
		const qh = [];
		const ql = [];
		const qo = [];
		const qc = [];
		const MovAverage = [];
		const RangeAverage = [];
		const RVIAverage = [];
		let RVISignal = 0;

		return data.map(function(d, i) {
			const h = d.high;
			const l = d.low;
			const c = d.close;
			const o = d.open;
			if (isNotDefined(l) && isNotDefined(h)) {
				skip++;
				return undefined;
			} else if ((i < 3 + skip) && (i >= skip)) {
				qh.push(h);
				ql.push(l);
				qo.push(o);
				qc.push(c);
				return undefined;
			} else if (i ===  3 + skip) {
				qh.push(h);
				ql.push(l);
				qo.push(o);
				qc.push(c);
				MovAverage.push((qc[3] - qo[3]) + 2 * (qc[2] - qo[2]) + 2 * (qc[1] - qo[1]) + (qc[0] - qo[0]));
				RangeAverage.push((qh[3] - ql[3]) + 2 * (qh[2] - ql[2]) + 2 * (qh[1] - ql[1]) + (qh[0] - ql[0]));
				RVIAverage.push((MovAverage.reduce(function(sum, current) {
					return sum + current;
				})) / (RangeAverage.reduce(function(sum, current) {
					return sum + current;
				})));
				return undefined;
			} else if ((i <  6 + skip) && (i > 3 + skip)) {
				qh.shift();
				ql.shift();
				qo.shift();
				qc.shift();
				qh.push(h);
				ql.push(l);
				qo.push(o);
				qc.push(c);
				MovAverage.push((qc[3] - qo[3]) + 2 * (qc[2] - qo[2]) + 2 * (qc[1] - qo[1]) + (qc[0] - qo[0]));
				RangeAverage.push((qh[3] - ql[3]) + 2 * (qh[2] - ql[2]) + 2 * (qh[1] - ql[1]) + (qh[0] - ql[0]));
				RVIAverage.push((MovAverage.reduce(function(sum, current) {
					return sum + current;
				})) / (RangeAverage.reduce(function(sum, current) {
					return sum + current;
				})));
				return undefined;
			} else if (i === 6 + skip) {
				qh.shift();
				ql.shift();
				qo.shift();
				qc.shift();
				qh.push(h);
				ql.push(l);
				qo.push(o);
				qc.push(c);
				MovAverage.push((qc[3] - qo[3]) + 2 * (qc[2] - qo[2]) + 2 * (qc[1] - qo[1]) + (qc[0] - qo[0]));
				RangeAverage.push((qh[3] - ql[3]) + 2 * (qh[2] - ql[2]) + 2 * (qh[1] - ql[1]) + (qh[0] - ql[0]));
				RVIAverage.push((MovAverage.reduce(function(sum, current) {
					return sum + current;
				})) / (RangeAverage.reduce(function(sum, current) {
					return sum + current;
				})));
				RVISignal = (RVIAverage[3] + 2 * RVIAverage[2] + 2 * RVIAverage[1] + RVIAverage[0]) / 6;
				return {
					signalline: RVISignal,
					line: RVIAverage[3]
				};
			} else {
				qh.shift();
				ql.shift();
				qo.shift();
				qc.shift();

				MovAverage.shift();
				RangeAverage.shift();
				RVIAverage.shift();

				qh.push(h);
				ql.push(l);
				qo.push(o);
				qc.push(c);
				MovAverage.push((qc[3] - qo[3]) + 2 * (qc[2] - qo[2]) + 2 * (qc[1] - qo[1]) + (qc[0] - qo[0]));
				RangeAverage.push((qh[3] - ql[3]) + 2 * (qh[2] - ql[2]) + 2 * (qh[1] - ql[1]) + (qh[0] - ql[0]));

				RVIAverage.push((MovAverage.reduce(function(sum, current) {
					return sum + current;
				})) / (RangeAverage.reduce(function(sum, current) {
					return sum + current;
				})));

				RVISignal = (RVIAverage[3] + 2 * RVIAverage[2] + 2 * RVIAverage[1] + RVIAverage[0]) / 6;
				return {
					signalline: RVISignal,
					line: RVIAverage[3]
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
