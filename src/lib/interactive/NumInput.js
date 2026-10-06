/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-bind */
"use strict";
import React, { Component } from "react";
import NumericInput from "react-numeric-input";

class NumInput extends Component {
	constructor(props) {
		super(props);
		this.valueChanged = this.valueChanged.bind(this);
	}

	setValue(e) {
		const key = e.keyCode || e.which;
		if ((key < 48 || key > 57) && !(key === 8 || key === 9 || key === 13 || key === 37 || key === 39 || key === 46)) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	valueChanged(valueAsNumber) {
		const { numInputChange } = this.props;
		if (valueAsNumber <= 0) {
			valueAsNumber = 1;
		}
		if (valueAsNumber > 10) {
			valueAsNumber = 10;
		}
		numInputChange(valueAsNumber);
	}

	render() {
		return (
			<div style={{ width: "70px" }}>
				<NumericInput ref={input => {this.myInput = input;}} name={this.props.name} className="form-control"
					value={this.props.value === undefined ? 1 : this.props.value} min={1} max={10} onKeyPress={this.setValue} onChange={this.valueChanged}/>
			</div>
		);
	}
}

export default NumInput;
