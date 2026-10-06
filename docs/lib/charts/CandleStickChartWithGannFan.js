
import PropTypes from "prop-types";
import React from "react";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { Chart, ChartCanvas } from "react-stockcharts";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";
import {
	CandlestickSeries,
} from "react-stockcharts/lib/series";

import { fitWidth } from "react-stockcharts/lib/helper";
import { DrawingObjectSelector, GannFan } from "react-stockcharts/lib/interactive";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
} from "react-stockcharts/lib/tooltip";
import { last, toObject } from "react-stockcharts/lib/utils";
import {
	getInteractiveNodes,
	saveInteractiveNodes,
} from "./interactiveutils";

class CandleStickChartWithGannFan extends React.Component {
	constructor(props) {
		super(props);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onDrawComplete = this.onDrawComplete.bind(this);
		this.handleSelection = this.handleSelection.bind(this);
		this.saveInteractiveNode = this.saveInteractiveNode.bind(this);
		this.saveCanvasNode = this.saveCanvasNode.bind(this);

		this.saveInteractiveNodes = saveInteractiveNodes.bind(this);
		this.getInteractiveNodes = getInteractiveNodes.bind(this);

		this.state = {
			enableInteractiveObject: true,
			fans_1: [],
		};
	}
	saveInteractiveNode(node) {
		this.node = node;
	}
	saveCanvasNode(node) {
		this.canvasNode = node;
	}
	componentDidMount() {
		document.addEventListener("keyup", this.onKeyPress);
	}
	componentWillUnmount() {
		document.removeEventListener("keyup", this.onKeyPress);
	}
	handleSelection(interactives) {
		const state = toObject(interactives, each => {
			return [
				"fans_1",
				each.objects,
			];
		});
		this.setState(state);
	}
	onDrawComplete(fans_1) {
		this.setState({
			enableInteractiveObject: false,
			fans_1
		});
	}
	onKeyPress(e) {
		const keyCode = e.which;

		switch (keyCode) {
			case 46: { // DEL
				const fans_1 = this.state.fans_1
					.filter(each => !each.selected);

				this.canvasNode.cancelDrag();
				this.setState({
					fans_1,
				});

				break;
			}
			case 27: { // ESC
				this.node.terminate();
				this.canvasNode.cancelDrag();
				this.setState({
					enableInteractiveObject: false
				});
				break;
			}
			case 68: // D - Draw drawing object
			case 69: { // E - Enable drawing object
				this.setState({
					enableInteractiveObject: true
				});
				break;
			}
		}
	}
	render() {
		const { type, data: initialData, width, ratio } = this.props;

		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(initialData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];
		const fans = this.state.fans_1;
		let appearance = undefined;

		if (fans.length > 0) {
			const lastAppearance = fans[fans.length - 1].appearance;

			appearance = {
				fans: lastAppearance.fans,
				strokeWidth: lastAppearance.strokeWidth,
				strokeOpacity: lastAppearance.strokeOpacity,
				strokeDasharray: lastAppearance.strokeDasharray,
				edgeStrokeWidth: lastAppearance.edgeStrokeWidth,
				edgeFill: lastAppearance.edgeFill,
				edgeStroke: lastAppearance.edgeStroke,
				fill: lastAppearance.fill,
				fillOpacity: lastAppearance.fillOpacity,
				edgeFill2: lastAppearance.edgeFill2,
				r: lastAppearance.r,
				fontFamily: lastAppearance.fontFamily,
				fontSize: lastAppearance.fontSize,
				fontFill: lastAppearance.fontFill,
				nsEdgeFill: lastAppearance.nsEdgeFill,
				text: "",
			};
		}

		return (
			<div>
				<ChartCanvas ref={this.saveCanvasNode}
					height={400}
					width={width}
					ratio={ratio}
					margin={{ left: 70, right: 70, top: 20, bottom: 30 }}
					type={type}
					seriesName="MSFT"
					data={data}
					xScale={xScale}
					xAccessor={xAccessor}
					displayXAccessor={displayXAccessor}
					xExtents={xExtents}
				>
					<Chart id={1}
						yExtents={[d => [d.high, d.low]]}
						padding={{ top: 10, bottom: 20 }}
					>

						<YAxis axisAt="right" orient="right" ticks={5} />
						<XAxis axisAt="bottom" orient="bottom" />

						<MouseCoordinateY
							at="right"
							orient="right"
							displayFormat={format(".2f")} />
						<MouseCoordinateX
							at="bottom"
							orient="bottom"
							displayFormat={timeFormat("%Y-%m-%d")} />
						<CandlestickSeries />

						<EdgeIndicator itemType="last" orient="right" edgeAt="right"
							yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"} />

						<OHLCTooltip origin={[-40, 0]} />

						<GannFan
							ref={this.saveInteractiveNodes("GannFan", 1)}
							enabled={this.state.enableInteractiveObject}
							onComplete={this.onDrawComplete}
							fans={fans}
							appearance={appearance}
						/>
					</Chart>
					<CrossHairCursor />
					<DrawingObjectSelector
						enabled={!this.state.enableInteractiveObject}
						getInteractiveNodes={this.getInteractiveNodes}
						drawingObjectMap={{
							GannFan: "fans"
						}}
						onSelect={this.handleSelection}
					/>
				</ChartCanvas>
			</div>
		);
	}
}

CandleStickChartWithGannFan.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithGannFan.defaultProps = {
	type: "svg",
};

CandleStickChartWithGannFan = fitWidth(CandleStickChartWithGannFan);

export default CandleStickChartWithGannFan;
