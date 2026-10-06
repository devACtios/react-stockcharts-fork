

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithSAR from "lib/charts/CandleStickChartWithSAR";

class ForceIndexIndicatorPage extends React.Component {
	render() {
		return (
			<ContentSection title={ForceIndexIndicatorPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <CandleStickChartWithSAR data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/SAR-INDICATOR").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

ForceIndexIndicatorPage.title = "SAR";

ForceIndexIndicatorPage.propTypes = {
	someData: PropTypes.array,
};

export default ForceIndexIndicatorPage;
