

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import VolumeProfileChart from "lib/charts/VolumeProfileChart";

class VolumeProfilePage extends React.Component {
	render() {
		return (
			<ContentSection title={VolumeProfilePage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{type => <VolumeProfileChart data={this.props.lotsOfData} type={type} />}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/VOLUME-PROFILE").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

VolumeProfilePage.title = "Volume profile";

VolumeProfilePage.propTypes = {
	lotsOfData: PropTypes.array,
};

export default VolumeProfilePage;