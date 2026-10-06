import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";

class ADMIWSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorForPlus = this.yAccessorForPlus.bind(this);
		this.yAccessorForMinus = this.yAccessorForMinus.bind(this);
		this.yAccessorForADMIW = this.yAccessorForADMIW.bind(this);
	}
	yAccessorForPlus(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).plus;
	}
	yAccessorForMinus(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).minus;
	}
	yAccessorForADMIW(d) {
		const { yAccessor } = this.props;
		return yAccessor(d) && yAccessor(d).admiw;
	}
	render() {
		const { className } = this.props;
		const { stroke, strokeWidth, strokeDasharray, onClick } = this.props;

		return (
			<g className={className} >
				<LineSeries onClick={onClick} yAccessor={this.yAccessorForPlus} highlightOnHover={true}
					stroke={stroke.plus} strokeWidth={strokeWidth.plus} strokeDasharray={strokeDasharray.plus} fill="none" />
				<LineSeries onClick={onClick} yAccessor={this.yAccessorForMinus} highlightOnHover={true}
					stroke={stroke.minus} strokeWidth={strokeWidth.minus} strokeDasharray={strokeDasharray.minus} fill="none" />
				<LineSeries onClick={onClick} yAccessor={this.yAccessorForADMIW} highlightOnHover={true}
					stroke={stroke.admiw} strokeWidth={strokeWidth.admiw} strokeDasharray={strokeDasharray.admiw} fill="none" />
			</g>
		);
	}
}

ADMIWSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		plus: PropTypes.string.isRequired,
		minus: PropTypes.string.isRequired,
		admiw: PropTypes.string.isRequired,
	}).isRequired,
	strokeWidth: PropTypes.shape({
		plus: PropTypes.number,
		minus: PropTypes.number,
		admiw: PropTypes.number,
	}),
	strokeDasharray: PropTypes.shape({
		plus: PropTypes.string,
		minus: PropTypes.string,
		admiw: PropTypes.string,
	}),
	fill: PropTypes.string.isRequired,
	onClick: PropTypes.func
};

ADMIWSeries.defaultProps = {
	className: "react-stockcharts-admiw-series",
	areaClassName: "react-stockcharts-admiw-series-area",
	opacity: 0.2,
	strokeWidth: {
		plus: 1,
		minus: 1,
		admiw: 1,
	},
	strokeDasharray: {
		plus: "Solid",
		minus: "Solid",
		admiw: "Solid",
	},
	onClick: function(e) { console.log("Click me here", e); },
};

export default ADMIWSeries;
