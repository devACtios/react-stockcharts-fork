import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithGannFan from "lib/charts/CandleStickChartWithGannFan";

class GannFanPage extends React.Component {
	render() {
		return (
			<ContentSection title={GannFanPage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/GANN-FAN").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <CandleStickChartWithGannFan data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

GannFanPage.title = "Gann Fan";

GannFanPage.propTypes = {
	someData: PropTypes.array,
};

export default GannFanPage;
