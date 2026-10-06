

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartForDiscontinuousIntraDay from "lib/charts/CandleStickChartForDiscontinuousIntraDay";

class IntraDayContinuousDataPage extends React.Component {
	render() {
		return (
			<ContentSection title={IntraDayContinuousDataPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => (<CandleStickChartForDiscontinuousIntraDay data={this.props.intraDayDiscontinuousData} type={type} />)}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/INTRA-DAY-DISCONTINUOUS").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

IntraDayContinuousDataPage.title = "Intra day with discontinuous scale";

IntraDayContinuousDataPage.propTypes = {
	intraDayDiscontinuousData: PropTypes.array,
};

export default IntraDayContinuousDataPage;