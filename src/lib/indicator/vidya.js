

import { rebind, merge } from "../utils";

import baseIndicator from "./baseIndicator";
import { vidya } from "../calculator";

const ALGORITHM_TYPE = "VIDYA";

export default function() {

	const base = baseIndicator()
		.type(ALGORITHM_TYPE);

	const underlyingAlgorithm = vidya();

	const mergedAlgorithm = merge()
		.algorithm(underlyingAlgorithm)
		.merge((datum, indicator) => { datum.vidya = indicator; });

	const indicator = function(data, options = { merge: true }) {
		if (options.merge) {
			if (!base.accessor()) throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`);
			return mergedAlgorithm(data);
		}
		return underlyingAlgorithm(data);
	};

	rebind(indicator, base, "id", "accessor", "stroke", "echo", "type");
	rebind(indicator, underlyingAlgorithm, "options");
	rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

	return indicator;
}
