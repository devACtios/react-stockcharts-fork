/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-bind */
"use strict";
import React, { Component } from "react";
import NumericInput from "react-numeric-input";

class NumInputFont extends Component {

	constructor(props) {
		super(props);

		this.min = 7;
		this.max = 25;
		this.default = 14;
		this.isActive = false;

		this.setValue = this.setValue.bind(this);
		this.valueChanged = this.valueChanged.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	setValue(e) {
		const key = e.keyCode || e.which;
		if (this.isSymbolKeys(key)) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	isSymbolKeys(key) {
		return (key < 48 || key > 57) && !(key === 8 || key === 9 || key === 13 || key === 37 || key === 39 || key === 46);
	}

	onFocus() {
		this.isActive = true;
	}

	onBlur() {
		this.isActive = false;
		const { value } = this.props;
		this.valueChanged(value);
	}

	valueChanged(valueAsNumber) {
		if (!this.isActive) {
			if (valueAsNumber <= this.min) {
				valueAsNumber = this.min;
			}
			if (valueAsNumber > this.max) {
				valueAsNumber = this.max;
			}
		}
		const { NumInputFontChange } = this.props;
		NumInputFontChange(valueAsNumber);
	}

	render() {
		return (
			<div style={{ width: "70px" }}>
				<NumericInput ref={input => {this.myInput = input;}} name={this.props.name} className="form-control"
					value={this.props.value === undefined ? this.default : this.props.value}
					min={this.min} max={this.max}
					onKeyPress={this.setValue} onChange={this.valueChanged}
					onFocus={this.onFocus} onBlur={this.onBlur}/>
			</div>
		);
	}
}

export default NumInputFont;