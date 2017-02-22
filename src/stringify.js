export default (options) => {
	const stringified = {
		pathParams: {},
		queryParams: {}
	};

	Object.entries(options).forEach(([key, value]) => {
		switch (key) {
			case 'filter':
				Object.assign(stringified.queryParams, {
					[key]: `${key}=${value.map((filter) => filter[0]).join(':')};${value.map((filter) => filter[1]).join(':')};${value.map((filter) => filter[2]).join(':')}`
				});
				break;
			case 'xml':
				Object.assign(stringified.queryParams, {
					[key]: `${key}=${value}`
				});
				break;
			default:
				Object.assign(stringified.pathParams, {
					[key]: (value.constructor === Array) ? `${key}:${value.join(':')}` : `${key}:${value}`
				});
		}
	});

	return stringified;
};
