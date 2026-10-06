

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import PointAndFigureWithUpdatingData from "lib/charts/PointAndFigureWithUpdatingData";

class UpdatingDataPage extends React.Component {
	render() {
		return (
			<ContentSection title={UpdatingDataPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => <PointAndFigureWithUpdatingData data={this.props.someData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

UpdatingDataPage.title = "Updating Data";

UpdatingDataPage.propTypes = {
	someData: PropTypes.array,
};

export default UpdatingDataPage;
