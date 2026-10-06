

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import {
	curveLinear,
	curveStep,
	curveStepBefore,
	curveStepAfter,
	curveBasis,
	curveCardinal,
	curveMonotoneX,
	curveCatmullRom,
} from "d3-shape";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import ShowAreaChart from "lib/charts/ShowArea";

const options = {
	none: undefined,
	curveLinear: curveLinear,
	curveStep: curveStep,
	curveStepBefore: curveStepBefore,
	curveStepAfter: curveStepAfter,
	curveBasis: curveBasis,
	curveCardinal: curveCardinal,
	curveMonotoneX: curveMonotoneX,
	curveCatmullRom: curveCatmullRom,
};

class ShowArea extends React.Component {
	constructor(params) {
		super(params);
		this.handleGridChange = this.handleGridChange.bind(this);
		this.handleGridOpacityChange = this.handleGridOpacityChange.bind(this);
		this.handleGridWidthChange = this.handleGridWidthChange.bind(this);
		this.handleInterpolationChange = this.handleInterpolationChange.bind(this);
		this.handleSeriesTypeChange = this.handleSeriesTypeChange.bind(this);
		this.state = {
			tickStrokeDasharray: "Solid",
			tickStrokeOpacity: 0.2,
			tickStrokeWidth: 1,
			interpolation: "none",
			seriesType: "line",
		};
	}
	handleGridChange(e) {
		this.setState({
			tickStrokeDasharray: e.target.value
		});
	}
	handleGridOpacityChange(e) {
		this.setState({
			tickStrokeOpacity: parseFloat(e.target.value)
		});
	}
	handleInterpolationChange(e) {
		this.setState({
			interpolation: e.target.value
		});
	}
	handleGridWidthChange(e) {
		this.setState({
			tickStrokeWidth: parseInt(e.target.value)
		});
	}
	handleSeriesTypeChange(e) {
		this.setState({
			seriesType: e.target.value
		});
	}
	render() {
		const {
			tickStrokeDasharray,
			tickStrokeOpacity,
			tickStrokeWidth,
			interpolation,
			seriesType,
		} = this.state;

		return (
			<ContentSection title={ShowArea.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => (
								<ShowAreaChart
									gridProps={{
										tickStrokeOpacity,
										tickStrokeDasharray,
										tickStrokeWidth
									}}
									interpolation={options[interpolation]}
									seriesType={seriesType}
									data={this.props.someData}
									type={type}
								/>
							)}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/SHOW-AREA").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

ShowArea.title = "Show area";

ShowArea.propTypes = {
	someData: PropTypes.array,
};

export default ShowArea;
