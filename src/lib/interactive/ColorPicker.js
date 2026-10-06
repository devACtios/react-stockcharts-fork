"use strict";
import React, { Component } from "react";
import PropTypes from "prop-types";

import reactCSS from "reactcss";
import { CompactPicker } from "react-color";

import { hexToRGBA_Object, isDefined } from "../utils";

class ColorPicker extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleChange = this.handleChange.bind(this);

		const { currentColor } = this.props;
		if (currentColor === undefined) {
			this.state = {
				displayColorPicker: false,
				color: {
					r: 0,
					g: 0,
					b: 0,
					a: "1",
				}
			};
		} else {
			const rgbaColor = hexToRGBA_Object(currentColor);
			this.state = {
				displayColorPicker: false,
				color: {
					r: rgbaColor.r,
					g: rgbaColor.g,
					b: rgbaColor.b,
					a: "1",
				}
			};
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.currentColor !== this.props.currentColor) {
			const rgbaColor = hexToRGBA_Object(this.props.currentColor);
			this.setState({
				color: {
					r: rgbaColor.r,
					g: rgbaColor.g,
					b: rgbaColor.b,
					a: "1",
				},
			});
		}
	}

	handleClick() {
		this.setState({ displayColorPicker: !this.state.displayColorPicker });
	}

	handleClose() {
		this.setState({ displayColorPicker: false });
	}

	handleChange(color) {
		const { onColorChange } = this.props;
		this.setState({
			color: color.rgb,
			displayColorPicker: false,
		});
		if (isDefined(onColorChange)) {
			onColorChange(color.hex);
		}
	}

	render() {
		const color = this.state.color.r === undefined ? { r: 0, g: 0, b: 0, a: 1 } : this.state.color;


		const styles = reactCSS({
			"default": {
				color: {
					width: "36px",
					height: "14px",
					borderRadius: "1px",
					background: `rgba(${ color.r }, ${ color.g },  ${ color.b },  ${ color.a } )`,
				},
				swatch: {
					padding: "5px",
					background: "#fff",
					borderRadius: "1px",
					boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
					display: "inline-block",
					cursor: "pointer",
				},
				popover: {
					position: "absolute",
					zIndex: "2",
				},
				cover: {
					position: "fixed",
					top: "0px",
					right: "0px",
					bottom: "0px",
					left: "0px",
				},
			}
		});

		return (
			<span>
				<div style={ styles.swatch } onClick={this.handleClick}>
					<div style={ styles.color }/>
				</div>
				{this.state.displayColorPicker ?
					<div style={ styles.popover }>
						<div style={ styles.cover } onClick={this.handleClose} />
						<CompactPicker color={this.state.color} onChange={this.handleChange}/>
					</div> : null
				}
			</span>
		);
	}
}

ColorPicker.propTypes = {
	currentColor: PropTypes.string,
	onColorChange: PropTypes.func,
};

export default ColorPicker;
