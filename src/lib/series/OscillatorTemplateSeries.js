

import React, { Component } from "react";
import PropTypes from "prop-types";
import LineSeries from "./LineSeries";

class OscillatorTemplateSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessorForTop = this.yAccessorForTop.bind(this);
		this.yAccessorForMiddle = this.yAccessorForMiddle.bind(this);
		this.yAccessorForBottom = this.yAccessorForBottom.bind(this);
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

	render() {
		const { className } = this.props;
		const { stroke, strokeWidth, strokeDasharray, onClick } = this.props;

		return (
			<g className={className}>
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForTop}
					stroke={stroke.top} strokeWidth={strokeWidth.top} strokeDasharray={strokeDasharray.top} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForMiddle}
					stroke={stroke.middle} strokeWidth={strokeWidth.middle} strokeDasharray={strokeDasharray.middle} fill="none" />
				<LineSeries onClick={onClick} highlightOnHover={true} yAccessor={this.yAccessorForBottom}
					stroke={stroke.bottom} strokeWidth={strokeWidth.bottom} strokeDasharray={strokeDasharray.bottom} fill="none" />
			</g>
		);
	}
}

OscillatorTemplateSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	areaClassName: PropTypes.string,
	opacity: PropTypes.number,
	type: PropTypes.string,
	stroke: PropTypes.shape({
		top: PropTypes.string,
		middle: PropTypes.string,
		bottom: PropTypes.string,
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
	onClick: PropTypes.func
};

OscillatorTemplateSeries.defaultProps = {
	className: "react-stockcharts-terminate-band-series",
	areaClassName: "react-stockcharts-terminate-band-series-area",
	opacity: 0.2,
	strokeWidth: {
		top: 1,
		middle: 1,
		bottom: 1
	},
	strokeDasharray: {
		top: "Solid",
		middle: "Solid",
		bottom: "Solid"
	},
	onClick: function(e) { console.log("Click me here", e); },
};

export default OscillatorTemplateSeries;
