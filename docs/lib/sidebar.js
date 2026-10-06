
import React from "react";
import PropTypes from "prop-types";

class SideBar extends React.Component {
	render() {
		return (
			<div className="col-sm-3 col-md-2 sidebar">{this.props.children}</div>
		);
	}
}

SideBar.propTypes = {
	children: PropTypes.any,
};

export default SideBar;