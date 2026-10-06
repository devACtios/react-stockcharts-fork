

import React from "react";
import PropTypes from "prop-types";
import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithCHMousePointer from "lib/charts/CandleStickChartWithCHMousePointer";

class MousePointerPage extends React.Component {
	render() {
		return (
			<ContentSection title={MousePointerPage.title}>
				<Row>
					<Section colSpan={2}>
						<CandleStickChartWithCHMousePointer data={this.props.someData} type="svg" />
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/MOUSEPOINTER").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

MousePointerPage.title = "Mouse pointer";

MousePointerPage.propTypes = {
	someData: PropTypes.array,
};

export default MousePointerPage;
