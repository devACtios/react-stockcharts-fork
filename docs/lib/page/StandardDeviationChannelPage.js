

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithStandardDeviationChannel from "lib/charts/CandleStickChartWithStandardDeviationChannel";

class EquidistantChannelPage extends React.Component {
	render() {
		return (
			<ContentSection title={EquidistantChannelPage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/STANDARD-DEVIATION-CHANNEL").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <CandleStickChartWithStandardDeviationChannel data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

EquidistantChannelPage.title = "Standard Deviation Channel";

EquidistantChannelPage.propTypes = {
	someData: PropTypes.array,
};

export default EquidistantChannelPage;
