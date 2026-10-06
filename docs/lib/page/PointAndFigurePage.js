

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import PointAndFigure from "lib/charts/PointAndFigure";

class PointAndFigurePage extends React.Component {
	render() {
		return (
			<ContentSection title={PointAndFigurePage.title}>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/POINT-AND-FIGURE").default }}></aside>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => <PointAndFigure data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

PointAndFigurePage.title = "Point & Figure";

PointAndFigurePage.propTypes = {
	someData: PropTypes.array,
};

export default PointAndFigurePage;
