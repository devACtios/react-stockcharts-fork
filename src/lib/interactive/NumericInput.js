/* eslint-disable react/jsx-no-bind */
"use strict";
import React, { Component } from "react";
import NumericInput from "react-numeric-input";

class NumInput extends Component {
	constructor(props) {
		super(props);
	}

	setValue(e) {
		const key = e.keyCode || e.which;
		if ((key < 48 || key > 57) && !(key === 8 || key === 9 || key === 13 || key === 37 || key === 39 || key === 46)) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	render() {

		return (
			<div style={{ width: "70px" }}>
				<NumericInput ref={NumericInput => {this.mySpin = NumericInput;}} className="form-control" min={1} max={10} onKeyPress={this.setValue}/>
			</div>
		);
	}
}

export default NumInput;
