/**
 * Smoothed Moving Average
 */
import { rebind, merge } from "../utils";

import { smma } from "../calculator";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "SMMA";

export default function() {

	const base = baseIndicator()
		.type(ALGORITHM_TYPE)
		.accessor(d => d.smma);

	const underlyingAlgorithm = smma();

	const mergedAlgorithm = merge()
		.algorithm(underlyingAlgorithm)
		.merge((datum, indicator) => { datum.smma = indicator; });

	const indicator = function(data, options = { merge: true }) {
		if (options.merge) {
			if (!base.accessor()) throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`);
			return mergedAlgorithm(data);
		}
		return underlyingAlgorithm(data);
	};
	rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
	rebind(indicator, underlyingAlgorithm, "undefinedLength");
	rebind(indicator, underlyingAlgorithm, "options");
	rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");


	return indicator;
}
