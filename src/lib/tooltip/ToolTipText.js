

import React from "react";
import PropTypes from "prop-types";

import AToolTip from "./ATooltip";

class ToolTipText extends AToolTip {

	constructor(props) {
		super(props);
	}

	render() {
		const dataset = this.getDataSet();
		const attr = { ...this.props };
		const { children } = this.props;
		// eslint-disable-next-line const-immutable/no-mutation
		delete attr.setDataset;

		return <text
			fontFamily={this.props.fontFamily}
			fontSize={this.props.fontSize}
			{...attr}
			className="react-stockcharts-tooltip"
			{...dataset}>{children}</text>;
	}
}

ToolTipText.propTypes = {
	fontFamily: PropTypes.string.isRequired,
	fontSize: PropTypes.number.isRequired,
	children: PropTypes.node.isRequired,
	setDataset: PropTypes.func,
};

ToolTipText.defaultProps = {
	fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
	fontSize: 11,
};

export default ToolTipText;
