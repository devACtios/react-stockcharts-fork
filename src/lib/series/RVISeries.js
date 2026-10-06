
import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";

class RVISeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorForsignalline = this.yAccessorForsignalline.bind(this);
		this.yAccessorForline = this.yAccessorForline.bind(this);
	}
	yAccessorForsignalline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).signalline;
	}
	yAccessorForline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).line;
	}

	render() {
		const { className } = this.props;
		const { stroke } = this.props;

		return (
			<g className={className}>
				<LineSeries yAccessor={this.yAccessorForsignalline}
					stroke={stroke.signalline} fill="none" />
				<LineSeries yAccessor={this.yAccessorForline}
					stroke={stroke.line} fill="none" />
			</g>
		);
	}
}

RVISeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		signalline: PropTypes.any,
		line: PropTypes.any,
	}).isRequired,
	fill: PropTypes.string.isRequired,
};

RVISeries.defaultProps = {
	className: "react-stockcharts-rvisiries-band-series",
	areaClassName: "react-stockcharts-rvisiries-band-series-area",
	opacity: 0.2
};

export default RVISeries;
