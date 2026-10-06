

import { rebind, merge } from "../utils";

import { roc } from "../calculator";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "roc";

export default function() {

	const base = baseIndicator()
		.type(ALGORITHM_TYPE)
		.accessor(d => d.roc);

	const underlyingAlgorithm = roc();

	const mergedAlgorithm = merge()
		.algorithm(underlyingAlgorithm)
		.merge((datum, indicator) => { datum.roc = indicator; });

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
