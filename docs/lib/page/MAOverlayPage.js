

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithMA from "lib/charts/CandleStickChartWithMA";

class MAOverlayPage extends React.Component {
	render() {
		return (
			<ContentSection title={MAOverlayPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <CandleStickChartWithMA data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/MOVING-AVERAGE-OVERLAY").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

MAOverlayPage.title = "Moving Average";

MAOverlayPage.propTypes = {
	someData: PropTypes.array,
};

export default MAOverlayPage;
