

import React from "react";
import PropTypes from "prop-types";
import { TypeChooser } from "react-stockcharts/lib/helper";

import ContentSection from "lib/content-section";
import Row from "lib/row";
import Section from "lib/section";

import VolumeProfileBySessionChart from "lib/charts/VolumeProfileBySessionChart";

class VolumeProfileBySessionPage extends React.Component {
	render() {
		return (
			<ContentSection title={VolumeProfileBySessionPage.title}>
				<Row>
					<Section colSpan={2}>
						<TypeChooser>
							{(type) => (<VolumeProfileBySessionChart data={this.props.lotsOfData} type={type} />)}
						</TypeChooser>
					</Section>
				</Row>
				<Row>
					<Section colSpan={2}>
						<aside dangerouslySetInnerHTML={{ __html: require("md/VOLUME-PROFILE-BY-SESSION").default }}></aside>
					</Section>
				</Row>
			</ContentSection>
		);
	}
}

VolumeProfileBySessionPage.title = "Volume profile by Session";

VolumeProfileBySessionPage.propTypes = {
	lotsOfData: PropTypes.array,
};

export default VolumeProfileBySessionPage;