

import React from "react";
import PropTypes from "prop-types";
import AToolTip from "./ATooltip";

class ToolTipTSpanLabel extends AToolTip {

	constructor(props) {
		super(props);
	}

	render() {
		const attr = { ...this.props };
		const { children } = this.props;
		// eslint-disable-next-line const-immutable/no-mutation
		delete attr.setDataset;

		const dataset = this.getDataSet();

		return <tspan className="react-stockcharts-tooltip-label" {...attr} {...dataset}>{children}</tspan>;
	}
}

ToolTipTSpanLabel.propTypes = {
	children: PropTypes.node.isRequired,
	fill: PropTypes.string.isRequired,
	setDataset: PropTypes.func,
};

ToolTipTSpanLabel.defaultProps = {
	fill: "#4682B4"
};

export default ToolTipTSpanLabel;
