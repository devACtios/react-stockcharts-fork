import { Component } from "react";
import PropTypes from "prop-types";

class AToolTip extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return null;
	}

	getDataSet() {
		const { setDataset, options } = this.props;
		const objKeys = (setDataset) ? setDataset(options) : {};
		const result = {};
		for (const k in objKeys) { // It need for safe set datasets
			// eslint-disable-next-line const-immutable/no-mutation
			result["data-" + k] = objKeys[k];
		}
		return result;
	}

	throwDataset() {
		const { options, setDataset } = this.props;
		if (setDataset) {
			return setDataset(options);
		}
		return {};
	}
}

AToolTip.propTypes = {
	setDataset: PropTypes.func,
	options: PropTypes.object,
};

AToolTip.defaultProps = {
};

export default AToolTip;