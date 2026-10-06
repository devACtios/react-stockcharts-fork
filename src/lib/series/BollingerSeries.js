

import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";
import AreaOnlySeries from "./AreaOnlySeries";

class BollingerSeries extends Component {
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
		const { areaClassName, className, opacity } = this.props;
		const { stroke, strokeWidth, strokeDasharray, fill, onClick } = this.props;

		return (
			<g className={className} >
				<LineSeries onClick={onClick} yAccessor={this.yAccessorForTop} highlightOnHover={true}
					stroke={stroke.top} strokeWidth={strokeWidth.top} strokeDasharray={strokeDasharray.top} fill="none" />
				<LineSeries onClick={onClick} yAccessor={this.yAccessorForMiddle} highlightOnHover={true}
					stroke={stroke.middle} strokeWidth={strokeWidth.middle} strokeDasharray={strokeDasharray.middle} fill="none" />
				<LineSeries onClick={onClick} yAccessor={this.yAccessorForBottom} highlightOnHover={true}
					stroke={stroke.bottom} strokeWidth={strokeWidth.bottom} strokeDasharray={strokeDasharray.bottom} fill="none" />
				<AreaOnlySeries onClick={onClick} className={areaClassName}
					yAccessor={this.yAccessorForTop}
					base={this.yAccessorForScalledBottom}
					stroke="none" fill={fill}
					opacity={opacity} />
			</g>
		);
	}
}

BollingerSeries.propTypes = {
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
	strokeWidth: PropTypes.shape({
		top: PropTypes.number,
		middle: PropTypes.number,
		bottom: PropTypes.number,
	}),
	strokeDasharray: PropTypes.shape({
		top: PropTypes.string,
		middle: PropTypes.string,
		bottom: PropTypes.string,
	}),
	fill: PropTypes.string.isRequired,
	onClick: PropTypes.func
};

BollingerSeries.defaultProps = {
	className: "react-stockcharts-bollinger-band-series",
	areaClassName: "react-stockcharts-bollinger-band-series-area",
	opacity: 0.2,
	strokeWidth: {
		top: 1,
		middle: 1,
		bottom: 1,
	},
	strokeDasharray: {
		top: "Solid",
		middle: "Solid",
		bottom: "Solid",
	},
	onClick: function(e) { console.log("Click me here", e); },
};

export default BollingerSeries;
