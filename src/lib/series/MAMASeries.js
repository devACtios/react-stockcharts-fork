import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";
import AreaOnlySeries from "./AreaOnlySeries";

class MAMASeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorMama = this.yAccessorMama.bind(this);
		this.yAccessorFama = this.yAccessorFama.bind(this);
		this.yAccessorForScalledFama = this.yAccessorForScalledFama.bind(this);
	}

	yAccessorMama(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).mama;
	}
	yAccessorFama(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).fama;
	}
	yAccessorForScalledFama(scale, d) {
		const { yAccessor } = this.props;
		return scale(yAccessor(d) && yAccessor(d).fama);
	}

	render() {
		const { areaClassName, className, opacity } = this.props;
		const { stroke, strokeWidth, strokeDasharray, fill, onClick } = this.props;

		return (
			<g className={className}>
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorMama}
					stroke={stroke.mama} strokeWidth={strokeWidth.mama} strokeDasharray={strokeDasharray.mama} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorFama}
					stroke={stroke.fama} strokeWidth={strokeWidth.fama} strokeDasharray={strokeDasharray.fama} fill="none" />
				<AreaOnlySeries onClick={onClick} className={areaClassName}
					yAccessor={this.yAccessorMama}
					base={this.yAccessorForScalledFama}
					stroke="none" fill={fill}
					opacity={opacity} />
			</g>
		);
	}
}

MAMASeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		mama: PropTypes.string.isRequired,
		fama: PropTypes.string.isRequired,
	}).isRequired,
	strokeWidth: PropTypes.shape({
		mama: PropTypes.number,
		fama: PropTypes.number,
	}),
	strokeDasharray: PropTypes.shape({
		mama: PropTypes.string,
		fama: PropTypes.string,
	}),
	fill: PropTypes.string.isRequired,
	onClick: PropTypes.func
};

MAMASeries.defaultProps = {
	className: "react-stockcharts-ichimoku-band-series",
	areaClassName: "react-stockcharts-ichimoku-band-series-area",
	opacity: 0.2,
	strokeWidth: {
		mama: 1,
		fama: 1,
	},
	strokeDasharray: {
		mama: "Solid",
		fama: "Solid",
	},
	onClick: function() { }
};

export default MAMASeries;
