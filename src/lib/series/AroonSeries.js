

import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";

class AroonSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorForupline = this.yAccessorForupline.bind(this);
		this.yAccessorFormiddleline = this.yAccessorFormiddleline.bind(this);
		this.yAccessorForbottomline = this.yAccessorForbottomline.bind(this);
		this.yAccessorForAU = this.yAccessorForAU.bind(this);
		this.yAccessorForAD = this.yAccessorForAD.bind(this);
	}

	yAccessorForupline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).upline;
	}
	yAccessorFormiddleline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).middleline;
	}
	yAccessorForbottomline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).bottomline;
	}
	yAccessorForAU(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).AU;
	}
	yAccessorForAD(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).AD;
	}

	render() {
		const { className } = this.props;
		const { stroke } = this.props;

		return (
			<g className={className}>
				<LineSeries yAccessor={this.yAccessorForupline}
					stroke={stroke.upline} fill="none" />
				<LineSeries yAccessor={this.yAccessorFormiddleline}
					stroke={stroke.middleline} fill="none" />
				<LineSeries yAccessor={this.yAccessorForbottomline}
					stroke={stroke.AU} fill="none" />
				<LineSeries yAccessor={this.yAccessorForAU}
					stroke={stroke.AD} fill="none" />
				<LineSeries yAccessor={this.yAccessorForAD}
					stroke={stroke.bottomline} fill="none" />
			</g>
		);
	}
}

AroonSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		upline: PropTypes.string.isRequired,
		middleline: PropTypes.string.isRequired,
		AU: PropTypes.string.isRequired,
		AD: PropTypes.string.isRequired,
		bottomline: PropTypes.string.isRequired,
	}).isRequired,
	fill: PropTypes.string.isRequired,
};

AroonSeries.defaultProps = {
	className: "react-stockcharts-ichimoku-band-series",
	areaClassName: "react-stockcharts-ichimoku-band-series-area",
	opacity: 0.2
};

export default AroonSeries;
