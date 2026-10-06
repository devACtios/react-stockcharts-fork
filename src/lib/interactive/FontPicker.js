"use strict";
import React, { Component } from "react";
import PropTypes from "prop-types";

class FontPicker extends Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		const { onChange } = this.props;
		onChange(e.target.value);
	}

	render() {
		const { selected } = this.props;
		return (
			<span>
				<select value={selected} className="form-control" style={{ width: "170px" }} onChange={this.handleChange}>
					<option value="Arial">Arial</option>
					<option value="Times New Roman">Times New Roman</option>
					<option value="Verdana">Verdana</option>
				</select>
			</span>
		);
	}
}

FontPicker.propTypes = {
	selected: PropTypes.string,
	onChange: PropTypes.func,
};

export default FontPicker;
