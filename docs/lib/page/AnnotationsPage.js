

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import CandleStickChartWithAnnotation from "lib/charts/CandleStickChartWithAnnotation";

class AnnotationsPage extends React.Component {
	render() {
		return (
			<ContentSection title={AnnotationsPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => (<CandleStickChartWithAnnotation data={this.props.someData} type={type} />)}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/ANNOTATIONS").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

AnnotationsPage.title = "Annotations";

AnnotationsPage.propTypes = {
	someData: PropTypes.array,
};

export default AnnotationsPage;
