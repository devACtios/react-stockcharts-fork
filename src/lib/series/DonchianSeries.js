

import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";

class DonchianSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorForTop = this.yAccessorForTop.bind(this);
		this.yAccessorForMiddle = this.yAccessorForMiddle.bind(this);
		this.yAccessorForBottom = this.yAccessorForBottom.bind(this);
		this.yAccessorForScalledBottom = this.yAccessorForScalledBottom.bind(this);
	}
	yAccessorForTop(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).top;
	}
	yAccessorForMiddle(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).middle;
	}
	yAccessorForBottom(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).bottom;
	}
	yAccessorForScalledBottom(scale, d) {
		const { yAccessor } = this.props;
		return scale(yAccessor(d) && yAccessor(d).bottom);
	}
	render() {
		const { className } = this.props;
		const { stroke } = this.props;

		return (
			<g className={className}>
				<LineSeries yAccessor={this.yAccessorForTop}
					stroke={stroke.top} fill="none" />
				<LineSeries yAccessor={this.yAccessorForMiddle}
					stroke={stroke.middle} fill="none" />
				<LineSeries yAccessor={this.yAccessorForBottom}
					stroke={stroke.bottom} fill="none" />
			</g>
		);
	}
}

DonchianSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		top: PropTypes.string.isRequired,
		middle: PropTypes.string.isRequired,
		bottom: PropTypes.string.isRequired,
	}).isRequired,
};

DonchianSeries.defaultProps = {
	className: "react-stockcharts-donchian-band-series",
	areaClassName: "react-stockcharts-donchian-series-area",
	opacity: 0.2
};

export default DonchianSeries;
