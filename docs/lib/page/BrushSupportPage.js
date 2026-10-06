

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithBrush from "lib/charts/CandleStickChartWithBrush";

class BrushSupportPage extends React.Component {
	render() {
		return (
			<ContentSection title={BrushSupportPage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/BRUSH-INTERACTIVE-INDICATOR").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <CandleStickChartWithBrush data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

BrushSupportPage.title = "Brush";

BrushSupportPage.propTypes = {
	someData: PropTypes.array,
};

export default BrushSupportPage;
