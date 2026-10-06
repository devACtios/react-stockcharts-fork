import React, { Component } from "react";
import PropTypes from "prop-types";

import { noop } from "./utils";
import ChartContext from "./ChartContext";

class SettingsButtons extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { chartConfig } = this.context;
		const { width, height } = chartConfig;
		const { size, heightFromBase, rx, ry } = this.props;
		const { stroke, strokeOpacity, fill, strokeWidth, fillOpacity } = this.props;
		const { textFill, origin, openSettingsOrigin, closeOrigin } = this.props;
		const { onClose, onOpenSettings, isFullMode } = this.props;
		const centerX = Math.round(width / 2);
		const y = height - heightFromBase;
		const [w, h] = size;
		const openSettingsX = centerX;
		const closeX = centerX + w + 2 * strokeWidth;

		return (
			<g transform={`translate (${openSettingsX + origin[0]}, ${-y + origin[1]})`} className="react-stockcharts-settings-button">
				{ !isFullMode && (<rect
					x={openSettingsX - w / 2}
					y={y}
					rx={rx}
					ry={ry}
					height={h}
					width={w}
					fill={fill}
					fillOpacity={fillOpacity}
					stroke={stroke}
					strokeOpacity={strokeOpacity}
					strokeWidth={strokeWidth}
				/>)}
				{ !isFullMode && (<g transform={`translate (${openSettingsX + openSettingsOrigin[0]}, ${(y + h / 4) + openSettingsOrigin[1]}) scale(.165)`}>
					<path stroke={textFill} fill={textFill} d="M99.4,42.2c-0.1-0.7-0.6-1.2-1.3-1.4l-5.2-1.3c-3-0.7-5.2-2.4-6.2-4.7c-1-2.3-0.6-5.1,1-7.7l2.8-4.6
                            c0.4-0.6,0.3-1.3-0.1-1.9c-3.1-4.2-6.8-8-11-11c-0.6-0.4-1.3-0.4-1.9-0.1l-4.6,2.8c-1.7,1-3.4,1.5-5,1.5c-3.6,0-6.4-2.6-7.4-6.7
                            l-1.2-5.2c-0.2-0.7-0.7-1.2-1.4-1.3c-5.1-0.8-10.5-0.8-15.6,0c-0.7,0.1-1.2,0.6-1.4,1.3l-1.3,5.2c-1,4.1-3.9,6.7-7.4,6.7
                            c-1.6,0-3.4-0.5-5-1.5l-4.6-2.8c-0.6-0.4-1.3-0.3-1.9,0.1c-4.2,3.1-8,6.8-11,11c-0.4,0.6-0.4,1.3-0.1,1.9l2.8,4.6
                            c1.6,2.7,2,5.4,1,7.7c-1,2.3-3.2,4-6.2,4.7l-5.2,1.3c-0.7,0.2-1.2,0.7-1.3,1.4C0.2,44.8,0,47.4,0,50c0,2.6,0.2,5.2,0.6,7.8
                            c0.1,0.7,0.6,1.2,1.3,1.4l5.2,1.3c3,0.7,5.2,2.4,6.2,4.7c1,2.3,0.6,5.1-1,7.7l-2.8,4.6c-0.4,0.6-0.3,1.3,0.1,1.9
                            c3.1,4.2,6.8,8,11,11c0.6,0.4,1.3,0.4,1.9,0.1l4.6-2.8c1.7-1,3.4-1.6,5-1.6c3.6,0,6.4,2.6,7.4,6.7l1.3,5.2c0.2,0.7,0.7,1.2,1.4,1.3
                            c2.6,0.4,5.2,0.6,7.8,0.6c2.6,0,5.2-0.2,7.8-0.6c0.7-0.1,1.2-0.6,1.4-1.3l1.2-5.2c1-4.1,3.9-6.7,7.4-6.7c1.6,0,3.4,0.5,5,1.6
                            l4.6,2.8c0.6,0.4,1.3,0.3,1.9-0.1c4.2-3.1,8-6.8,11-11c0.4-0.6,0.4-1.3,0.1-1.9l-2.8-4.6c-1.6-2.7-2-5.4-1-7.7c1-2.3,3.2-4,6.2-4.7
                            l5.2-1.3c0.7-0.2,1.2-0.7,1.3-1.4c0.4-2.6,0.6-5.2,0.6-7.8C100,47.4,99.8,44.8,99.4,42.2z M96.2,56.2l-4.1,1
                            c-4.1,1-7.2,3.4-8.6,6.8c-1.4,3.4-0.9,7.2,1.3,10.8l2.2,3.6c-2.5,3.3-5.4,6.2-8.7,8.7l-3.6-2.2c-2.2-1.3-4.5-2.1-6.8-2.1
                            c-5.2,0-9.4,3.7-10.8,9.3l-1,4.1c-4.1,0.5-8.2,0.5-12.3,0l-1-4.1c-1.4-5.7-5.6-9.3-10.8-9.3c-2.3,0-4.6,0.7-6.8,2.1L21.7,87
                            c-3.3-2.5-6.2-5.4-8.7-8.7l2.2-3.6c2.2-3.6,2.7-7.5,1.3-10.8c-1.4-3.4-4.4-5.8-8.6-6.8l-4.1-1c-0.3-2-0.4-4.1-0.4-6.2
                            c0-2,0.1-4.1,0.4-6.2l4.1-1c4.1-1,7.2-3.4,8.6-6.8c1.4-3.4,0.9-7.2-1.3-10.8L13,21.7c2.5-3.3,5.4-6.2,8.7-8.7l3.6,2.2
                            c2.2,1.4,4.6,2.1,6.8,2.1c5.2,0,9.4-3.7,10.8-9.3l1-4.1c4.1-0.5,8.2-0.5,12.3,0l1,4.1c1.4,5.7,5.6,9.3,10.8,9.3
                            c2.3,0,4.6-0.7,6.8-2.1l3.6-2.2c3.3,2.5,6.2,5.4,8.7,8.7l-2.2,3.6c-2.2,3.6-2.7,7.5-1.3,10.8c1.4,3.4,4.4,5.8,8.6,6.8l4.1,1
                            c0.3,2,0.4,4.1,0.4,6.2C96.6,52.1,96.4,54.1,96.2,56.2z"/>
					<path stroke={textFill} fill={textFill} d="M50,22c-1,0-1.7,0.8-1.7,1.7c0,0.9,0.8,1.7,1.7,1.7c13.6,0,24.6,11.1,24.6,24.6c0,0.9,0.8,1.7,1.7,1.7
                            c0.9,0,1.7-0.8,1.7-1.7C78,34.5,65.5,22,50,22z"/>
					<path stroke={textFill} fill={textFill} d="M67.4,67.4c-4.7,4.7-10.8,7.2-17.4,7.2c-6.6,0-12.8-2.6-17.4-7.2c-9.6-9.6-9.6-25.2,0-34.8c0.7-0.7,0.7-1.7,0-2.4
                            c-0.7-0.7-1.7-0.7-2.4,0c-10.9,10.9-10.9,28.7,0,39.7C35.5,75.1,42.5,78,50,78c7.5,0,14.5-2.9,19.8-8.2c0.7-0.7,0.7-1.7,0-2.4
                            C69.2,66.7,68.1,66.7,67.4,67.4z"/>
					<path stroke={textFill} fill={textFill} d="M50,64.9c8.2,0,14.9-6.7,14.9-14.9c0-8.2-6.7-14.9-14.9-14.9c-8.2,0-14.9,6.7-14.9,14.9C35.1,58.2,41.8,64.9,50,64.9z
                            M50,38.5c6.3,0,11.5,5.1,11.5,11.5c0,6.3-5.1,11.5-11.5,11.5c-6.3,0-11.5-5.1-11.5-11.5C38.5,43.7,43.7,38.5,50,38.5z"/>
				</g>)}
				<rect
					x={closeX - w / 2}
					y={y}
					rx={rx}
					ry={ry}
					height={h}
					width={w}
					fill={fill}
					fillOpacity={fillOpacity}
					stroke={stroke}
					strokeOpacity={strokeOpacity}
					strokeWidth={strokeWidth}
				/>
				<g transform={`translate (${openSettingsX + closeOrigin[0]}, ${((y + h / 4) + closeOrigin[1])}) scale(0.15)`}>
					<line stroke={textFill} fill={textFill} style={{ strokeWidth: "10", strokeLinecap: "round", strokeLinejoin: "round" }} x1="94.8"
						y1="95" x2="161.3" y2="161.5"/>
					<line stroke={textFill} fill={textFill} style={{ strokeWidth: "10", strokeLinecap: "round", strokeLinejoin: "round" }} x1="161.3"
						y1="95" x2="94.8" y2="161.5"/>
				</g>
				{ !isFullMode && (<rect className="react-stockcharts-enable-interaction settings"
					onClick={onOpenSettings}
					x={openSettingsX - w / 2}
					y={y}
					rx={rx}
					ry={ry}
					height={h}
					width={w}
					fill="none"
				/>)}
				<rect className="react-stockcharts-enable-interaction close"
					onClick={onClose}
					x={closeX - w / 2}
					y={y}
					rx={rx}
					ry={ry}
					height={h}
					width={w}
					fill="none"
				/>
			</g>
		);
	}
}

SettingsButtons.propTypes = {
	zoomMultiplier: PropTypes.number.isRequired,
	size: PropTypes.array.isRequired,
	heightFromBase: PropTypes.number.isRequired,
	rx: PropTypes.number.isRequired,
	ry: PropTypes.number.isRequired,
	stroke: PropTypes.string.isRequired,
	strokeWidth: PropTypes.number.isRequired,
	strokeOpacity: PropTypes.number.isRequired,
	fill: PropTypes.string.isRequired,
	fillOpacity: PropTypes.number.isRequired,
	fontSize: PropTypes.number.isRequired,
	textDy: PropTypes.string.isRequired,
	textFill: PropTypes.string.isRequired,
	textStrokeWidth: PropTypes.number.isRequired,
	isFullMode: PropTypes.bool,
	origin: PropTypes.array,
	openSettingsOrigin: PropTypes.array,
	closeOrigin: PropTypes.array,
	onOpenSettings: PropTypes.func,
	onClose: PropTypes.func,
};

SettingsButtons.defaultProps = {
	size: [30, 24],
	origin: [-50, 10],
	openSettingsOrigin: [-8, -2],
	closeOrigin: [13, -13],
	heightFromBase: 50,
	rx: 3,
	ry: 3,
	stroke: "#000000",
	strokeOpacity: 0.3,
	strokeWidth: 1,
	fill: "#D6D6D6",
	fillOpacity: 0.4,
	fontSize: 16,
	textDy: ".3em",
	textFill: "#000000",
	textStrokeWidth: 2,
	zoomMultiplier: 1.5,
	onOpenSettings: noop,
	onClose: noop
};

SettingsButtons.contextType = ChartContext;

export default SettingsButtons;
