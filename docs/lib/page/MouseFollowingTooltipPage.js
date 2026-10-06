

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithHoverTooltip from "lib/charts/CandleStickChartWithHoverTooltip";

class MouseFollowingTooltipPage extends React.Component {
	render() {
		return (
			<ContentSection title={MouseFollowingTooltipPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => (<CandleStickChartWithHoverTooltip data={this.props.someData} type={type} />)}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/HOVER-TOOLTIP").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

MouseFollowingTooltipPage.title = "Hover Tooltip";

MouseFollowingTooltipPage.propTypes = {
	someData: PropTypes.array,
};

export default MouseFollowingTooltipPage;
