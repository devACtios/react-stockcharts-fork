import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithUpdatingData from "lib/charts/CandleStickChartWithUpdatingData";

class UpdatingDataPageForCandleStick extends React.Component {
	render() {
		return (
			<ContentSection title={UpdatingDataPageForCandleStick.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => <CandleStickChartWithUpdatingData data={this.props.lotsOfData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/UPDATING-DATA").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

UpdatingDataPageForCandleStick.title = "Updating Data";

UpdatingDataPageForCandleStick.propTypes = {
	lotsOfData: PropTypes.array,
};

export default UpdatingDataPageForCandleStick;
