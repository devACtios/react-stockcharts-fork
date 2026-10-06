import { isNotDefined } from "../utils";
import { ADMIW as defaultOptions } from "./defaultOptionsForComputation";

export default function() {
	let options = defaultOptions;

	function calculator(data) {
		const { windowSize } = options;
		let prevTR = 0,
			tr = 0,
			sumTR = 0,
			prevDm_plus = 0,
			dm_plus = 0,
			sumDm_plus = 0,
			prevDm_minus = 0,
			dm_minus = 0,
			sumDm_minus = 0,
			prevHigh = 0,
			prevLow = 0,
			prevClose = 0,
			prevDx = 0,
			previous = 0,
			initialAccumulator = 0,
			skip = 0;

		return data.map(function(d, i) {
			const { high, low, close } = d;

			if (isNotDefined(previous) && isNotDefined(close)) {
				skip++;
				return undefined;
			} else if (i < windowSize + skip - 1) {
				initialAccumulator += close;

				dm_plus = high - prevHigh > 0 ? high - prevHigh : 0;
				dm_minus = prevLow - low > 0 ? prevLow - low : 0;
				tr = Math.max(
					Math.abs(high - prevHigh),
					Math.abs(high - prevClose),
					Math.abs(low - prevClose)
				);

				sumDm_plus += dm_plus;
				sumDm_minus += dm_minus;
				sumTR += tr;

				prevHigh = high;
				prevLow = low;
				prevClose = close;
				return undefined;
			} else if (i === windowSize + skip - 1) {
				initialAccumulator += close;
				const initialValue = initialAccumulator / windowSize;
				previous = initialValue;

				dm_plus = high - prevHigh > 0 ? high - prevHigh : 0;
				dm_minus = prevLow - low > 0 ? prevLow - low : 0;
				tr = Math.max(
					Math.abs(high - prevHigh),
					Math.abs(high - prevClose),
					Math.abs(low - prevClose)
				);

				sumDm_plus += dm_plus;
				sumDm_minus += dm_minus;
				sumTR += tr;

				prevDm_plus = sumDm_plus / windowSize;
				prevDm_minus = sumDm_minus / windowSize;
				prevTR = sumTR / windowSize;

				const ATR = prevTR;
				const Plus_D = prevDm_plus / ATR * 100;
				const Minus_D = prevDm_minus / ATR * 100;
				const DX =
                    Math.abs(Plus_D - Minus_D) / (Plus_D + Minus_D) * 100;

				prevHigh = high;
				prevLow = low;
				prevClose = close;

				prevDx = DX;

				return {
					plus: Plus_D,
					minus: Minus_D,
					admiw: DX,
				};
			} else if (i === windowSize + skip) {
				const secondValue = (previous * (windowSize - 1) + close) / windowSize;
				previous = secondValue;

				dm_plus = high - prevHigh > 0 ? high - prevHigh : 0;
				dm_minus = prevLow - low > 0 ? prevLow - low : 0;
				tr = Math.max(
					Math.abs(high - prevHigh),
					Math.abs(high - prevClose),
					Math.abs(low - prevClose)
				);
				sumTR += tr;

				const prevSMMA_DM_plus = (prevDm_plus * (windowSize - 1) + dm_plus) / windowSize;
				const prevSMMA_DM_minus = (prevDm_minus * (windowSize - 1) + dm_minus) / windowSize;
				const prevSMMA_TR = (prevTR * (windowSize - 1) + tr) / windowSize;

				const ATR = prevSMMA_TR;
				const Plus_D = prevSMMA_DM_plus / ATR * 100;
				const Minus_D = prevSMMA_DM_minus / ATR * 100;
				const DX = Math.abs(Plus_D - Minus_D) / (Plus_D + Minus_D) * 100;
				const ADX = (prevDx * (windowSize - 1) + DX) / windowSize;

				prevHigh = high;
				prevLow = low;
				prevClose = close;

				prevDm_plus = prevSMMA_DM_plus;
				prevDm_minus = prevSMMA_DM_minus;
				prevTR = prevSMMA_TR;

				prevDx = DX;

				return {
					plus: Plus_D,
					minus: Minus_D,
					admiw: ADX,
				};
			} else {
				const prevsum = previous * windowSize;
				const SMMA = (prevsum - previous + close) / windowSize;
				previous = SMMA;

				dm_plus = high - prevHigh > 0 ? high - prevHigh : 0;
				dm_minus = prevLow - low > 0 ? prevLow - low : 0;
				tr = Math.max(
					Math.abs(high - prevHigh),
					Math.abs(high - prevClose),
					Math.abs(low - prevClose)
				);

				const prevSUM_DM_plus = prevDm_plus * windowSize;
				const prevSUM_DM_minus = prevDm_minus * windowSize;
				const prevSUM_TR = prevTR * windowSize;

				const SMMA_DM_plus = (prevSUM_DM_plus - prevDm_plus + dm_plus) / windowSize;
				const SMMA_DM_minus = (prevSUM_DM_minus - prevDm_minus + dm_minus) / windowSize;
				const SMMA_TR = (prevSUM_TR - prevTR + tr) / windowSize;

				const ATR = SMMA_TR;
				const Plus_D = SMMA_DM_plus / ATR * 100;
				const Minus_D = SMMA_DM_minus / ATR * 100;
				const DX =
                    Math.abs(Plus_D - Minus_D) / (Plus_D + Minus_D) * 100;

				const prevSUM_DX = prevDx * windowSize;
				const ADX = (prevSUM_DX - prevDx + DX) / windowSize;

				prevHigh = high;
				prevLow = low;
				prevClose = close;

				prevDm_plus = SMMA_DM_plus;
				prevDm_minus = SMMA_DM_minus;
				prevTR = SMMA_TR;

				prevDx = DX;

				return {
					plus: Plus_D,
					minus: Minus_D,
					admiw: ADX,
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
