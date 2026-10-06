

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import HeikinAshi from "lib/charts/HeikinAshi";

class HeikinAshiPage extends React.Component {
	render() {
		return (
			<ContentSection title={HeikinAshiPage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/HEIKIN-ASHI").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => <HeikinAshi data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

HeikinAshiPage.title = "Heikin Ashi";

HeikinAshiPage.propTypes = {
	someData: PropTypes.array,
};

export default HeikinAshiPage;
