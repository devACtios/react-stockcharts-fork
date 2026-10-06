

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithEdge from "lib/charts/CandleStickChartWithEdge";

class LotsOfDataPage extends React.Component {
	render() {
		return (
			<ContentSection title={LotsOfDataPage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/LOTS-OF-DATA").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => <CandleStickChartWithEdge data={this.props.lotsOfData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

LotsOfDataPage.title = "Lots of data";

LotsOfDataPage.propTypes = {
	lotsOfData: PropTypes.array,
};

export default LotsOfDataPage;
