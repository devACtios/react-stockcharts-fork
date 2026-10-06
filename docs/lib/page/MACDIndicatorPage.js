

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithMACDIndicator from "lib/charts/CandleStickChartWithMACDIndicator";

class MACDIndicatorPage extends React.Component {
	render() {
		return (
			<ContentSection title={MACDIndicatorPage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/MACD-INDICATOR").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => (<CandleStickChartWithMACDIndicator data={this.props.lotsOfData} type={type} />)}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

MACDIndicatorPage.title = "MACD";

MACDIndicatorPage.propTypes = {
	lotsOfData: PropTypes.array,
};

export default MACDIndicatorPage;
