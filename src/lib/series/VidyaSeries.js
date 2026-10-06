

import React, { Component } from "react";
import PropTypes from "prop-types";
import LineSeries from "./LineSeries";

class VidyaSeries extends Component {
	render() {
		const { className } = this.props;
		const { stroke, strokeWidth, strokeDasharray, onClick } = this.props;

		return (
			<g className={className} >
				<LineSeries onClick={onClick} yAccessor={this.props.yAccessor} highlightOnHover={true}
					stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} fill="none" />
			</g>
		);
	}
}

VidyaSeries.propTypes = {
	yAccessor: PropTypes.func.isRequired,
	className: PropTypes.string,
	type: PropTypes.string,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number,
	strokeDasharray: PropTypes.string,
	onClick: PropTypes.func
};

VidyaSeries.defaultProps = {
	className: "react-stockcharts-vidya-series",
	strokeWidth: 1,
	strokeDasharray: "Solid",
	onClick: function(e) { console.log("Click me here", e); },
};

export default VidyaSeries;
