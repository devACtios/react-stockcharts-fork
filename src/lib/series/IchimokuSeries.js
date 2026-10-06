

import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";
import AreaOnlySeries from "./AreaOnlySeries";

class IchimokuSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorFortenkan = this.yAccessorFortenkan.bind(this);
		this.yAccessorForkijun = this.yAccessorForkijun.bind(this);
		this.yAccessorForsenkou_a = this.yAccessorForsenkou_a.bind(this);
		this.yAccessorForsenkou_b = this.yAccessorForsenkou_b.bind(this);
		this.yAccessorForchikou = this.yAccessorForchikou.bind(this);
		this.yAccessorForScalledBottom = this.yAccessorForScalledBottom.bind(this);
	}

	yAccessorFortenkan(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).tenkan;
	}
	yAccessorForkijun(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).kijun;
	}
	yAccessorForsenkou_a(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).senkou_a;
	}
	yAccessorForsenkou_b(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).senkou_b;
	}
	yAccessorForScalledBottom(scale, d) {
		const { yAccessor } = this.props;
		return scale(yAccessor(d) && yAccessor(d).senkou_b);
	}
	yAccessorForchikou(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).chikou;
	}

	render() {
		const { areaClassName, className, opacity } = this.props;
		const { stroke, strokeWidth, strokeDasharray, fill, onClick } = this.props;

		return (
			<g className={className}>
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorFortenkan}
					stroke={stroke.tenkan} strokeWidth={strokeWidth.tenkan} strokeDasharray={strokeDasharray.tenkan} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForkijun}
					stroke={stroke.kijun} strokeWidth={strokeWidth.kijun} strokeDasharray={strokeDasharray.kijun} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForsenkou_a}
					stroke={stroke.senkou_a} strokeWidth={strokeWidth.senkou_a} strokeDasharray={strokeDasharray.senkou_a} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForsenkou_b}
					stroke={stroke.senkou_b} strokeWidth={strokeWidth.senkou_b} strokeDasharray={strokeDasharray.senkou_b} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForchikou}
					stroke={stroke.chikou} strokeWidth={strokeWidth.chikou} strokeDasharray={strokeDasharray.chikou} fill="none" />
				<AreaOnlySeries onClick={onClick} className={areaClassName}
					yAccessor={this.yAccessorForsenkou_a}
					base={this.yAccessorForScalledBottom}
					stroke="none" fill={fill}
					opacity={opacity} />
			</g>
		);
	}
}

IchimokuSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		tenkan: PropTypes.string.isRequired,
		kijun: PropTypes.string.isRequired,
		chikou: PropTypes.string.isRequired,
		senkou_a: PropTypes.string.isRequired,
		senkou_b: PropTypes.string.isRequired,
	}).isRequired,
	strokeWidth: PropTypes.shape({
		tenkan: PropTypes.number,
		kijun: PropTypes.number,
		chikou: PropTypes.number,
		senkou_a: PropTypes.number,
		senkou_b: PropTypes.number,
	}),
	strokeDasharray: PropTypes.shape({
		tenkan: PropTypes.string,
		kijun: PropTypes.string,
		chikou: PropTypes.string,
		senkou_a: PropTypes.string,
		senkou_b: PropTypes.string,
	}),
	fill: PropTypes.string.isRequired,
	onClick: PropTypes.func
};

IchimokuSeries.defaultProps = {
	className: "react-stockcharts-ichimoku-band-series",
	areaClassName: "react-stockcharts-ichimoku-band-series-area",
	opacity: 0.2,
	strokeWidth: {
		tenkan: 1,
		kijun: 1,
		chikou: 1,
		senkou_a: 1,
		senkou_b: 1,
	},
	strokeDasharray: {
		tenkan: "Solid",
		kijun: "Solid",
		chikou: "Solid",
		senkou_a: "Solid",
		senkou_b: "Solid",
	},
	onClick: function(e) { console.log("Click", e); }
};

export default IchimokuSeries;
