

import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";

class TironeSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorForupline = this.yAccessorForupline.bind(this);
		this.yAccessorForline2 = this.yAccessorForline2.bind(this);
		this.yAccessorForline3 = this.yAccessorForline3.bind(this);
		this.yAccessorForline4 = this.yAccessorForline4.bind(this);
		this.yAccessorForbottomline = this.yAccessorForbottomline.bind(this);
	}

	yAccessorForupline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).upline;
	}
	yAccessorForline2(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).line2;
	}
	yAccessorForline3(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).line3;
	}
	yAccessorForline4(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).line4;
	}
	yAccessorForbottomline(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).bottomline;
	}

	render() {
		const { className } = this.props;
		const { stroke } = this.props;

		return (
			<g className={className}>
				<LineSeries yAccessor={this.yAccessorForupline}
					stroke={stroke.upline} fill="none" />
				<LineSeries yAccessor={this.yAccessorForline2}
					stroke={stroke.line2} fill="none" />
				<LineSeries yAccessor={this.yAccessorForline3}
					stroke={stroke.line3} fill="none" />
				<LineSeries yAccessor={this.yAccessorForline4}
					stroke={stroke.line4} fill="none" />
				<LineSeries yAccessor={this.yAccessorForbottomline}
					stroke={stroke.bottomline} fill="none" />
			</g>
		);
	}
}

TironeSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		upline: PropTypes.string.isRequired,
		line2: PropTypes.string.isRequired,
		line3: PropTypes.string.isRequired,
		line4: PropTypes.string.isRequired,
		bottomline: PropTypes.string.isRequired,
	}).isRequired,
	fill: PropTypes.string.isRequired,
};

TironeSeries.defaultProps = {
	className: "react-stockcharts-tirone-band-series",
	areaClassName: "react-stockcharts-tirone-band-series-area",
	opacity: 0.2
};

export default TironeSeries;
