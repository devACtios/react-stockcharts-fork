

import { rebind, merge } from "../utils";

import { williams_r } from "../calculator";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "williams_r";

export default function() {

	const base = baseIndicator()
		.type(ALGORITHM_TYPE)
		.accessor(d => d.williams_r);

	const underlyingAlgorithm = williams_r();

	const mergedAlgorithm = merge()
		.algorithm(underlyingAlgorithm)
		.merge((datum, indicator) => { datum.williams_r = indicator; });

	const indicator = function(data, options = { merge: true }) {
		if (options.merge) {
			if (!base.accessor()) throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`);
			return mergedAlgorithm(data);
		}
		return underlyingAlgorithm(data);
	};

	rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
	rebind(indicator, underlyingAlgorithm, "options", "undefinedLength");
	rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

	return indicator;
}
