"use strict";

/*
 * Created with @iobroker/create-adapter v2.1.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");

/* Variables for runtime */
let unit;
let production;
let consumption;
let grid_feed;
let grid_consuming;
let grid_different;
let grid_reverse;
let grid_all_positive;
let battery_percent;
let battery_charge;
let battery_discharge;
let battery_different;
let car_charge;
let car_percent;
let car_plugged;
let calculate_consumption;
let recalculate = false;

/* Data Objects */
let valuesObj = {};
let dataObj = {
	values: {},
	animations: {}
};
let configObj = {};
let subscribeArray = new Array();
let parameterObj = {
	lines: {},
	line_colors: {},
	animation_colors: {},
	circles: {},
	colors: {},
	fill_colors: {},
	fonts: {},
	general: {},
	icons: {},
	values: {},
	texts: {}
};

/* Canvas */
let canvas;
let canvas_installed


class Energiefluss extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "energiefluss",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		if (this.config.production) {
			// Initialize your adapter here
			unit = this.config.unit;
			production = this.config.production;
			consumption = this.config.consumption;
			grid_feed = this.config.grid_feed;
			grid_consuming = this.config.grid_consuming;
			grid_different = this.config.grid_different;
			grid_reverse = this.config.grid_reverse ? true : false;
			grid_all_positive = this.config.grid_all_positive ? true : false;
			battery_percent = this.config.battery_percent;
			battery_charge = this.config.battery_charge;
			battery_discharge = this.config.battery_discharge;
			battery_different = this.config.battery_different;
			car_charge = this.config.car_charge;
			car_percent = this.config.car_percent;
			car_plugged = this.config.car_plugged;
			calculate_consumption = this.config.calculate_consumption;

			recalculate = this.config.recalculate ? true : false;
			this.log.info("Starting Energiefluss Adapter");
			// Put all possible variables into an Object and after that, filter empty ones
			configObj = {
				production: production,
				consumption: consumption,
				grid_feed: grid_feed,
				grid_consuming: grid_consuming,
				battery_charge: battery_charge,
				battery_discharge: battery_discharge,
				battery_percent: battery_percent,
				car_charge: car_charge,
				car_percent: car_percent,
				car_plugged: car_plugged
			};
			// Delete empty ones
			configObj = Object.entries(configObj).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
			this.log.debug("Added States for subscribing: " + JSON.stringify(configObj));

			// Load all Data once before subscribing
			valuesObj = await this.getInitialValues(configObj);

			// Build array for subscribing to states
			subscribeArray = Object.values(configObj);

			this.log.debug("Requesting the following states: " + subscribeArray.toString());

			/*
			For every state in the system there has to be also an object of type state
			Here a simple template for a boolean variable named "testVariable"
			Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
			*/
			await this.setObjectNotExistsAsync('configuration', {
				type: 'state',
				common: {
					name: 'Parameters for HTML Output',
					type: 'string',
					role: 'json',
					read: true,
					write: false,
				},
				native: {},
			});

			await this.setObjectNotExistsAsync('data', {
				type: 'state',
				common: {
					name: 'Data for HTML Output',
					type: 'string',
					role: 'json',
					read: true,
					write: false,
				},
				native: {},
			});

			// Delete old State HTML
			await this.deleteStateAsync('HTML');

			/* Build Parameter */
			// Colors
			parameterObj.colors = {
				house: this.config.color_house,
				consumption_value: this.config.color_house_text,
				grid: this.config.color_grid,
				grid_value: this.config.color_grid_text,
				production: this.config.color_production,
				production_value: this.config.color_production_text,
				car: this.config.color_car,
				car_value: this.config.color_car_text,
				car_plugged: this.config.color_car_plugged,
				battery: this.config.color_battery,
				battery_value: this.config.color_battery_text,
				lines: this.config.color_lines,
				animation: this.config.color_animation
			}

			// Fills of the Circles
			parameterObj.fill_colors = {
				house: this.config.fill_color_house,
				grid: this.config.fill_color_grid,
				production: this.config.fill_color_production,
				battery: this.config.fill_color_battery,
				car: this.config.fill_color_car
			}

			// Colors of the lines
			parameterObj.line_colors = {
				solar_to_battery: this.config.color_solar_to_battery,
				solar_to_grid: this.config.color_solar_to_grid,
				solar_to_house: this.config.color_solar_to_house,
				house_to_car: this.config.color_house_to_car,
				grid_to_house: this.config.color_grid_to_house,
				grid_to_battery: this.config.color_grid_to_battery,
				battery_to_house: this.config.color_battery_to_house,
			}

			// Animation Colors of the lines
			parameterObj.animation_colors = {
				solar_to_battery: this.config.animation_color_solar_to_battery,
				solar_to_grid: this.config.animation_color_solar_to_grid,
				solar_to_house: this.config.animation_color_solar_to_house,
				house_to_car: this.config.animation_color_house_to_car,
				grid_to_house: this.config.animation_color_grid_to_house,
				grid_to_battery: this.config.animation_color_grid_to_battery,
				battery_to_house: this.config.animation_color_battery_to_house,
			}

			// Fonts
			parameterObj.fonts = {
				font: this.config.font,
				font_size_label: this.config.font_size_label,
				font_size_value: this.config.font_size_value,
				font_size_percent: this.config.font_size_percent
			}

			// General
			parameterObj.general.no_battery = false;
			parameterObj.general.unit = unit;
			parameterObj.general.line_size = this.config.line_size;


			// buildDataJSON will add some more details to the object

			// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
			this.subscribeForeignStates(subscribeArray);
			// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
			// this.subscribeStates("lights.*");
			// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
			// this.subscribeStates("*");
			this.log.info("Adapter started and listening to " + subscribeArray.length + " States");
			this.log.debug("Initial Values: " + JSON.stringify(valuesObj));
			// check for canvas
			try {
				//canvas = require('canvas');
				//canvas_installed = true;
			} catch (e) {
				this.log.warn('Canvas not installed! Thus, no map drawings are possible. Please see installation instructions on Github (https://github.com/iobroker-community-adapters/ioBroker.roomba#installation).');
				this.log.debug(e.message);
			}
		} else {
			this.log.warn("No production datapoint set");
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		// Check the corresponding state for changes
		// Production
		if (state) {
			if (id == production) {
				valuesObj['production'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == consumption) {
				valuesObj['consumption'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == grid_feed) {
				valuesObj['grid_feed'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == grid_consuming) {
				valuesObj['grid_consuming'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == battery_percent) {
				valuesObj['battery_percent'] = state.val;
			}
			if (id == battery_charge) {
				valuesObj['battery_charge'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == battery_discharge) {
				valuesObj['battery_discharge'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == car_charge) {
				valuesObj['car_charge'] = recalculate ? this.recalculateValue(state.val) : this.floorNumber(state.val);
			}
			if (id == car_percent) {
				valuesObj['car_percent'] = state.val;
			}
			if (id == car_plugged) {
				valuesObj['car_plugged'] = state.val;
			}

			if (calculate_consumption) {
				let prodValue = valuesObj['production'];

				let consumptionValue = 0;
				if (grid_all_positive) {
					consumptionValue = parseFloat(valuesObj['grid_consuming'] + (prodValue - valuesObj['grid_feed']));
				} else {
					consumptionValue = parseFloat(valuesObj['grid_feed'] + prodValue);
				}
				valuesObj['consumption'] = recalculate ? this.recalculateValue(consumptionValue) : this.floorNumber(consumptionValue);
			}
		}

		this.log.debug("States changed: " + JSON.stringify(valuesObj));

		/* Build the JSON Arrays to store in states */
		this.buildDataJSON();
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }
	/**
	 * @param {number} value
	 */
	recalculateValue(value) {
		return parseFloat((value / 1000).toFixed(2));
	}
	/**
	 * @param {number} value
	 */
	floorNumber(value) {
		return parseFloat(value.toFixed(2));
	}

	/**
	 * @param {Object} obj
	 */
	async getInitialValues(obj) {
		let tmpObj = {};
		Object.entries(obj).forEach(entry => {
			const [key, value] = entry;
			//values = values + this.getForeignStateAsync(value);
			this.getForeignState(value, (err, stateValue) => {
				// Check, if key is a number
				if (typeof (stateValue.val) === 'number') {
					if (!key.includes("percent")) {
						tmpObj[key] = recalculate ? this.recalculateValue(stateValue.val) : stateValue.val;
					} else {
						tmpObj[key] = stateValue.val;
					}
				}

				if (typeof (stateValue.val) === 'boolean') {
					tmpObj[key] = stateValue.val ? true : false;
				}
			});

		});
		return tmpObj;
	}

	async buildDataJSON() {
		let dataValueObj = {};

		let circlesObj = {};
		let textObj = {};
		let valueObj = {};
		let iconObj = {};
		let linesObj = {};

		let line_animation = {
			solar_to_house: false,
			grid_to_house: false,
			solar_to_grid: false,
			house_to_car: false,
			grid_to_battery: false,
			solar_to_battery: false,
			battery_to_house: false
		};

		// Change CSS if no battery is present
		if ((valuesObj['battery_charge'] === undefined || valuesObj['battery_discharge'] === undefined) && valuesObj['battery_percent'] === undefined) {
			parameterObj.general.no_battery = true;
		}
		// Consumption
		if (valuesObj['consumption'] != undefined) {
			circlesObj.house = true;
			textObj.consumption_text = true;
			valueObj.consumption_value = true;
			iconObj.icon_house = true;

			dataValueObj.consumption_value = valuesObj['consumption'];
		}

		// Production
		if (valuesObj['production'] != undefined) {
			if (valuesObj['consumption'] > 0 && valuesObj['production'] > 0) {
				line_animation.solar_to_house = true;
			}
			circlesObj.production = true;
			textObj.production_text = true;
			valueObj.production_value = true;
			iconObj.icon_production = true;

			dataValueObj.production_value = valuesObj['production'];
		}

		// Grid
		if (valuesObj['grid_feed'] != undefined && grid_different === false) {
			let gridValue = valuesObj['grid_feed'];
			if (grid_reverse) {
				if (gridValue > 0) {
					line_animation.grid_to_house = true;
				}
				if (gridValue < 0) {
					// Display as positive
					gridValue = gridValue * -1;
					line_animation.solar_to_grid = true;
				}
			} else {
				if (gridValue > 0) {
					line_animation.solar_to_grid = true;
				}
				if (gridValue < 0) {
					// Display as positive
					gridValue = gridValue * -1;
					line_animation.grid_to_house = true;
				}
			}
			circlesObj.grid = true;
			textObj.grid_text = true;
			valueObj.grid_value = true;
			iconObj.icon_grid = true;

			dataValueObj.grid_value = gridValue;
		}

		// User has defined to used different States for consuming from and feeding to the grid
		if (grid_different === true) {
			let gridConsumeValue = valuesObj['grid_consuming'];
			let gridFeedValue = valuesObj['grid_feed'];
			let gridValue = 0 + ' ' + unit;

			if (gridConsumeValue > 0 && gridFeedValue === 0) {
				line_animation.grid_to_house = true;
				gridValue = gridConsumeValue;
			}

			if (gridFeedValue > 0 && gridConsumeValue === 0) {
				line_animation.solar_to_grid = true;
				gridValue = gridFeedValue;
			}

			circlesObj.grid = true;
			textObj.grid_text = true;
			valueObj.grid_value = true;
			iconObj.icon_grid = true;

			dataValueObj.grid_value = gridValue;
		}

		if (valuesObj['car_charge'] != undefined) {
			if (valuesObj['car_charge'] > 0) {
				line_animation.house_to_car = true;
			}
			dataValueObj.car_plugged = valuesObj['car_plugged'];
			circlesObj.car = true;
			textObj.car_text = true;
			valueObj.car_value = true;
			iconObj.icon_car = true;

			dataValueObj.car_value = valuesObj['car_charge'];
		}

		if (valuesObj['car_percent'] != undefined) {
			valueObj.car_percent = true;
			dataValueObj.car_percent = valuesObj['car_percent'];
		}

		if (valuesObj['car_charge'] != undefined && valuesObj['consumption'] === undefined) {
			if (valuesObj['car_charge'] > 0) {
				line_animation.house_to_car = true;
			}
			circlesObj.house = true;
		}

		if (valuesObj['battery_charge'] != undefined && battery_different === false) {
			let batteryValue = valuesObj['battery_charge'];
			// Feeding the grid
			if (batteryValue > 0) {
				line_animation.solar_to_battery = true;
			}
			if (batteryValue < 0) {
				// Display as positive & change animation
				batteryValue = batteryValue * -1;
				line_animation.battery_to_house = true;
			}
			batteryValue = batteryValue;

			circlesObj.battery = true;
			textObj.battery_text = true;
			valueObj.battery_value = true;
			iconObj.icon_battery = true;

			dataValueObj.battery_value = batteryValue;
		}

		// User has defined to used different States for consuming from and feeding to the grid
		if (battery_different === true) {
			let batteryChargeValue = valuesObj['battery_charge'];
			let batteryDischargeValue = valuesObj['battery_discharge'];
			let batteryValue = 0;

			if (batteryChargeValue > 0 && batteryDischargeValue === 0) {
				line_animation.solar_to_battery = true;
				batteryValue = batteryChargeValue;
			}

			if (batteryDischargeValue > 0 && batteryChargeValue === 0) {
				line_animation.battery_to_house = true;
				batteryValue = batteryDischargeValue;
			}

			circlesObj.battery = true;
			textObj.battery_text = true;
			valueObj.battery_value = true;
			iconObj.icon_battery = true;

			dataValueObj.battery_value = batteryValue;
		}

		if (valuesObj['battery_percent'] != undefined && valuesObj['battery_charge'] != undefined) {
			valueObj.battery_percent = true;
			dataValueObj.battery_percent = valuesObj['battery_percent'];
		}

		/* Build all lines */
		if (valuesObj['production'] != undefined && valuesObj['consumption'] != undefined) {
			linesObj.solar_to_house = true;
		}
		if (valuesObj['consumption'] != undefined && (valuesObj['grid_feed'] != undefined || valuesObj['grid_consuming'] != undefined)) {
			linesObj.grid_to_house = true;
		}
		if (valuesObj['production'] != undefined && (valuesObj['grid_feed'] != undefined || valuesObj['grid_consuming'] != undefined)) {
			linesObj.solar_to_grid = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['car_charge'] != undefined) || (valuesObj['car_charge'] != undefined && valuesObj['consumption'] === undefined)) {
			linesObj.house_to_car = true;
		}
		if (valuesObj['battery_charge'] != undefined && valuesObj['grid_feed'] != undefined) {
			linesObj.grid_to_battery = true;
		}
		if (valuesObj['production'] != undefined && valuesObj['battery_charge'] != undefined) {
			linesObj.solar_to_battery = true;
		}
		if (valuesObj['battery_discharge'] != undefined || valuesObj['battery_charge'] != undefined && valuesObj['consumption'] != undefined) {
			linesObj.battery_to_house = true;
		}

		// Build the Parameters to be read inside Javascript on Webpage - called once
		//JSON.parse(JSON.stringify(Object.assign({}, iconArray)));
		parameterObj.circles = circlesObj;
		parameterObj.icons = iconObj;
		parameterObj.lines = linesObj;
		parameterObj.texts = textObj;
		parameterObj.values = valueObj;

		// Build the Values and Animations to be read inside Javascript - called every time a value changes
		dataObj.animations = JSON.parse(JSON.stringify(line_animation));
		dataObj.values = dataValueObj;

		await this.setStateAsync("data", JSON.stringify(dataObj), true);
		await this.setStateAsync("configuration", JSON.stringify(parameterObj), true);
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Energiefluss(options);
} else {
	// otherwise start the instance directly
	new Energiefluss();
}