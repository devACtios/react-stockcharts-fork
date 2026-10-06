
import { path, isNotDefined } from "../utils";

import { MAMA as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
// ALGORITHM NAME : mama
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize, sourcePath, fastLimit, slowLimit } = options;

		const source = path(sourcePath);
		const Nprice = [], Nsmooth = [], Ndetrender = [], NI1 = [], NQ1 = [];
		let previousTop, previousBottom, initialAccumulator = 0, skip = 0;
		let smooth = 0, detrender = 0;
		let previousPeriod = 0, period = 0;
		let Q1 = 0, I1 = 0;
		let pQ2 = 0, Q2 = 0, pI2 = 0, I2 = 0;
		let jQ = 0, jI = 0;
		let pRe = 0, Re = 0, pIm = 0, Im = 0;
		let smoothPeriod = 0, previousSmoothPeriod = 0;
		let phase = 0, previousPhase = 0;
		let deltaPhase = 0, alpha = 0;
		return data.map(function(d, i) {
			const v = source(d, i);
			if (isNotDefined(previousTop) && isNotDefined(v)) {
				skip++;
				return undefined;
			} else if (i < (windowSize / 2 + skip - 2)) {
				initialAccumulator += v;
				Nprice.push(v);
				return undefined;
			} else if ((i >= windowSize / 2 + skip - 2) && (i <= windowSize + skip - 2)) {
				initialAccumulator += v;
				Nprice.push(v);
				smooth = (Nprice[0] + Nprice[1] * 2 +  Nprice[2] * 3 + Nprice[3] * 4) / 10;
				Nsmooth.push(smooth);
				Nprice.shift();
			} else if ((i > windowSize + skip - 2) && (i <  3 * windowSize / 2 + skip)) {
				initialAccumulator += v;
				Nprice.push(v);
				smooth = (Nprice[0] + Nprice[1] * 2 +  Nprice[2] * 3 + Nprice[3] * 4) / 10;
				Nsmooth.push(smooth);
				detrender = (.0962 * Nsmooth[6] + .5769 * Nsmooth[4] - .5769 * Nsmooth[2] - .0962 * Nsmooth[0])	* (0.75 * previousPeriod + .54);
				Ndetrender.push(detrender);
				Nprice.shift();
				Nsmooth.shift();
			} else if ((i >= 3 * windowSize / 2  + skip) && (i < 2 * windowSize + 1 + skip)) {
				initialAccumulator += v;
				Nprice.push(v);
				smooth = (Nprice[0] + Nprice[1] * 2 +  Nprice[2] * 3 + Nprice[3] * 4) / 10;
				Nsmooth.push(smooth);
				detrender = (.0962 * Nsmooth[6] + .5769 * Nsmooth[4] - .5769 * Nsmooth[2] - .0962 * Nsmooth[0])	* (0.75 * previousPeriod + .54);
				Ndetrender.push(detrender);
				Q1 = (.0962 * Ndetrender[6] +  .5769 * Ndetrender[4] - .5769 * Ndetrender[2]  - .0962 * Ndetrender[0]) * (0.75 * previousPeriod + .54);
				NQ1.push(Q1);
				I1 = Ndetrender[3];
				NI1.push(I1);
				Nprice.shift();
				Nsmooth.shift();
				Ndetrender.shift();
			} else {
				initialAccumulator += v;
				Nprice.push(v);
				smooth = (Nprice[0] + Nprice[1] * 2 +  Nprice[2] * 3 + Nprice[3] * 4) / 10;
				Nsmooth.push(smooth);
				detrender = (.0962 * Nsmooth[6] + .5769 * Nsmooth[4] - .5769 * Nsmooth[2] - .0962 * Nsmooth[0])	* (0.75 * previousPeriod + .54);
				Ndetrender.push(detrender);
				Q1 = (.0962 * Ndetrender[6] +  .5769 * Ndetrender[4] - .5769 * Ndetrender[2]  - .0962 * Ndetrender[0]) * (0.75 * previousPeriod + .54);
				NQ1.push(Q1);
				I1 = Ndetrender[3];
				NI1.push(I1);
				jI = (.0962 * NI1[6] + .5769 * NI1[4] - .5769 * NI1[2] - .0962 * NI1[0]) * (0.75 * previousPeriod + .54);
				jQ = (.0962 * NQ1[6] + .5769 * NQ1[4] - .5769 * NQ1[2] - .0962 * NQ1[0]) * (0.75 * previousPeriod + .54);
				I2 = I1 - jQ;
				Q2 = Q1 - jI;
				I2 = .2 * I2 + .8 * pI2;
				Q2 = .2 * Q2 + .8 * pQ2;
				Re = I2 * pI2 + Q2 * pQ2;
				Im = I2 * pQ2 - Q2 * pI2;
				Re = .2 * Re + .8 * pRe;
				Im = .2 * Im + .8 * pIm;
				// eslint-disable-next-line eqeqeq
				if ((Im != 0) && (Re != 0)) {
					period = 360 / Math.atan(Im / Re);
				}
				if (period > 1.5 * previousPeriod) {
					period  = 1.5 * previousPeriod;
				}
				if (period < .67 * previousPeriod) {
					period  = .67 * previousPeriod;
				}
				if (period < 6) {
					period  = 6;
				}
				if (period > 50) {
					period  = 50;
				}
				period = .2 * period + .8 * previousPeriod;
				smoothPeriod = .33 * period + .67 * previousSmoothPeriod;
				// eslint-disable-next-line eqeqeq
				if (I1 != 0) {
					phase = Math.atan(Q1 / I1);
				}
				deltaPhase = previousPhase - phase;
				if (deltaPhase < 1) {
					deltaPhase = 1;
				}
				alpha = fastLimit / deltaPhase;
				if (alpha < slowLimit) {
					alpha = slowLimit;
				}
				Nprice.shift();
				Nsmooth.shift();
				Ndetrender.shift();
				NQ1.shift();
				NI1.shift();
				pI2 = I2;
				pQ2 = Q2;
				pRe = Re;
				pIm = Im;
				previousPeriod = period;
				previousSmoothPeriod = smoothPeriod;
				previousPhase = phase;
				if (i === 5 * windowSize / 2 + skip) {
					const initialValue = initialAccumulator / (5 * windowSize / 2 + 1);
					previousTop = initialValue;
					previousBottom = initialValue;
					return {
						mama: initialValue,
						fama: initialValue,
					};
				} else {
					const nextTop = v * alpha + (1 - alpha) * previousTop;
					const nextBottom = 0.5 * nextTop * alpha + (1 - 0.5 * alpha) * previousBottom;
					previousTop = nextTop;
					previousBottom = nextBottom;
					return {
						mama: nextTop,
						fama: nextBottom,
					};
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
