

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import BarChart from "lib/charts/BarChart";

class BarChartPage extends React.Component {
	render() {
		return (
			<ContentSection title={BarChartPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => (<BarChart data={this.props.barData} type={type} />)}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/BAR-CHART").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

BarChartPage.title = "Bar Chart";

BarChartPage.propTypes = {
	barData: PropTypes.array,
};

export default BarChartPage;
