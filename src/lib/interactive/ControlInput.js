"use strict";
import React from "react";
import PropTypes from "prop-types";

import ColorPicker from "./ColorPicker";

class ControlInput extends React.Component {
	constructor(props) {
		super(props);
	}

	getValue() {
		return "value" in this.refs.input ? this.refs.input.value : this.refs.input.getValue();
	}

	render() {
		const { type, id, value } = this.props;
		switch (type) {
			case "colorPicker":
				return (
					// eslint-disable-next-line react/no-string-refs
					<ColorPicker ref={"input"} id={id} currentColor={value}/>
				);
		}
	}
}

ControlInput.propTypes = {
	type: PropTypes.oneOf([
		"colorPicker",
	]).isRequired,
	id: PropTypes.string.isRequired,
	options: PropTypes.array,
	value: PropTypes.any,
};

export default ControlInput;

