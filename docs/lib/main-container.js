import React from "react";
import PropTypes from "prop-types";

import Row from "lib/row";

class MainContainer extends React.Component {
	render() {
		return (
			<div className="container-fluid" id="MainContainer">
				<Row>{this.props.children}</Row>
			</div>
		);
	}
}

MainContainer.propTypes = {
	children: PropTypes.any,
};

export default MainContainer;