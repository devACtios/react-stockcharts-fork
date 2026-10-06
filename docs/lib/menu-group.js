
import React from "react";
import PropTypes from "prop-types";

class MenuGroup extends React.Component {
	render() {
		return (
			<ul className="nav nav-sidebar">{this.props.children}</ul>
		);
	}
}

MenuGroup.propTypes = {
	children: PropTypes.any,
};

export default MenuGroup;