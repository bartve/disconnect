'use strict';

/**
 * Cache client section instances in a WeakMap
 * @type {WeakMap}
 */
const sectionMap = new WeakMap();

/**
 * DiscogsSectionFactory class definition
 */
class DiscogsSectionFactory {

    /**
     * Get a cached client section instance
     * @param {function} section - A section class definition, like DiscogsDatabase
     * @param {DiscogsClient} client - A DiscogsClient instance
     * @returns {object}
     */
    static get(section, client) {
        if (!sectionMap.has(client)) {
            sectionMap.set(client, {});
        }
        if (!sectionMap.get(client)[section.name]) {
            sectionMap.get(client)[section.name] = new section(client);
        }
        return sectionMap.get(client)[section.name];
    }
}

/**
 * Expose DiscogsSectionFactory
 */
module.exports = DiscogsSectionFactory;