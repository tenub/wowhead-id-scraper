import Promise from 'bluebird';
import fetch from 'node-fetch';

import FetchError from './fetch-error';
import stringify from './stringify';

fetch.Promise = Promise;

/**
 * Simple Wowhead scraper
 */
class Wowhead {
	constructor(timeout = 5000) {
		this.validRoutes = ['items', 'item-sets', 'outfits', 'transmog-sets', 'icons', 'sounds', 'achievements', 'battle-pets', 'classes', 'hunter-pets', 'skills', 'races', 'resources', 'spells', 'titles', 'currencies', 'factions', 'garrisons', 'maps', 'affixes', 'npcs', 'objects', 'events', 'quests', 'zones'];
		this.fetchOptions = { timeout };
	}

	/**
	 * Async fetch wrapper that rejects on fetch error or timeout
	 * @returns {Promise} Resolves on fetch completion
	 */
	request({ route, pathParams, queryParams }) {
		return new Promise((resolve, reject) => {
			if (!route || this.validRoutes.indexOf(route) < 0) {
				return reject(new TypeError('Invalid route set'));
			}

			const pathString = Object.values(pathParams).join('/');
			const queryString = Object.values(queryParams).join('&');

			return fetch(`http://www.wowhead.com/${route}/${pathString}?${queryString}`, this.fetchOptions)
				.bind({})
				.then(function reqRespCallback(res) {
					this.status = res.status;
					return res.text();
				})
				.then(function reqBodyCallback(body) {
					return /^2\d{2}$/.test(this.status) ?
						resolve(body) :
						reject(new FetchError(this.status, body.reason));
				})
				.catch((err) => (
					reject(err)
				));
		});
	}

	get(route, options) {
		return new Promise((resolve, reject) => (
			this.request({ route, ...stringify(options) })
				.then((body) => {
					const re = /_\[(\d+?)]=\{.+?\};/g;
					const items = [];

					let match;

					while ((match = re.exec(body)) !== null) {
						const [, id] = match;
						items.push(Number(id));
					}

					return resolve(items);
				})
				.catch((err) => (
					reject(err)
				))
		));
	}
}

export default Wowhead;
