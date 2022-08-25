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
let battery_reverse;
let car_charge;
let car_percent;
let car_plugged;
let calculate_consumption;
let consumption_reverse;
let recalculate;
let house_netto;
let custom0, custom1, custom2, custom3;
let fraction;
let fraction_battery;
let threshold;

/* Data Objects */
let valuesObj = {};
let dataObj = {
	values: {},
	animations: {},
	battery_animation: {},
	color: {}
};
let configObj = {};
let subscribeArray = new Array();
let parameterObj = {
	lines: {
		lines: {},
		style: {},
		color: {},
		animation_colors: {}
	},
	elements: {
		elements: {},
		style: {},
		fill: {},
		color: {}
	},
	fonts: {},
	general: {},
	icons: {},
	texts: {
		texts: {},
		labels: {}
	},
	values: {
		values: {}
	},
	custom_symbol: {}
};

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
			consumption_reverse = this.config.consumption_reverse ? true : false;
			grid_feed = this.config.grid_feed;
			grid_consuming = this.config.grid_consuming;
			grid_different = this.config.grid_different;
			grid_reverse = this.config.grid_reverse ? true : false;
			grid_all_positive = this.config.grid_all_positive ? true : false;
			battery_percent = this.config.battery_percent;
			battery_charge = this.config.battery_charge;
			battery_discharge = this.config.battery_discharge;
			battery_different = this.config.battery_different;
			battery_reverse = this.config.battery_reverse ? true : false;
			car_charge = this.config.car_charge;
			car_percent = this.config.car_percent;
			car_plugged = this.config.car_plugged;
			calculate_consumption = this.config.calculate_consumption;
			custom0 = this.config.custom0;
			custom1 = this.config.custom1;
			custom2 = this.config.custom2;
			custom3 = this.config.custom3;
			house_netto = this.config.house_netto;
			fraction = this.config.fraction;
			fraction_battery = this.config.fraction_battery;
			threshold = this.config.threshold ? this.config.threshold : 0;

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
				car_plugged: car_plugged,
				custom0: custom0,
				custom1: custom1,
				custom2: custom2,
				custom3: custom3,
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
			// Colors of the circles
			parameterObj.elements.color = {
				house: this.config.color_house,
				grid: this.config.color_grid,
				production: this.config.color_production,
				battery: this.config.color_battery,
				car: this.config.color_car,
				custom0: this.config.color_custom0,
				custom1: this.config.color_custom1,
				custom2: this.config.color_custom2,
				custom3: this.config.color_custom3
			}

			// Fills of the Circles
			parameterObj.elements.fill = {
				house: this.config.fill_color_house,
				grid: this.config.fill_color_grid,
				production: this.config.fill_color_production,
				battery: this.config.fill_color_battery,
				car: this.config.fill_color_car,
				custom0: this.config.fill_color_custom0,
				custom1: this.config.fill_color_custom1,
				custom2: this.config.fill_color_custom2,
				custom3: this.config.fill_color_custom3,
			}

			// Colors of the lines
			parameterObj.lines.color = {
				solar_to_battery: this.config.color_solar_to_battery,
				solar_to_grid: this.config.color_solar_to_grid,
				solar_to_house: this.config.color_solar_to_house,
				house_to_car: this.config.color_house_to_car,
				grid_to_house: this.config.color_grid_to_house,
				grid_to_battery: this.config.color_grid_to_battery,
				battery_to_house: this.config.color_battery_to_house,
				default: this.config.color_lines,
				house_to_custom0: this.config.color_house_to_custom0,
				house_to_custom1: this.config.color_house_to_custom1,
				house_to_custom2: this.config.color_house_to_custom2,
				house_to_custom3: this.config.color_house_to_custom3
			}

			// Animation Colors of the lines
			parameterObj.lines.animation_colors = {
				solar_to_battery: this.config.animation_color_solar_to_battery,
				solar_to_grid: this.config.animation_color_solar_to_grid,
				solar_to_house: this.config.animation_color_solar_to_house,
				house_to_car: this.config.animation_color_house_to_car,
				grid_to_house: this.config.animation_color_grid_to_house,
				grid_to_battery: this.config.animation_color_grid_to_battery,
				battery_to_house: this.config.animation_color_battery_to_house,
				default: this.config.color_animation,
				house_to_custom0: this.config.animation_color_house_to_custom0,
				house_to_custom1: this.config.animation_color_house_to_custom1,
				house_to_custom2: this.config.animation_color_house_to_custom2,
				house_to_custom3: this.config.animation_color_house_to_custom3,
			}

			parameterObj.lines.style = {
				line_size: this.config.line_size,
				animation_width: this.config.animation_width,
				animation: this.config.animation
			}

			// Fonts
			parameterObj.fonts = {
				font_src: this.config.font_src,
				font: this.config.font,
				font_size_label: this.config.font_size_label,
				font_size_value: this.config.font_size_value,
				font_size_percent: this.config.font_size_percent,
				font_size_unit: this.config.font_size_unit,
				font_size_unit_percent: this.config.font_size_unit_percent
			}

			// Labels
			parameterObj.texts.labels = {
				consumption: this.config.label_house,
				production: this.config.label_production,
				grid: this.config.label_grid,
				battery: this.config.label_battery,
				car: this.config.label_car,
				custom0: this.config.label_custom0,
				custom1: this.config.label_custom1,
				custom2: this.config.label_custom2,
				custom3: this.config.label_custom3
			}

			// Label Color
			parameterObj.texts.color = this.config.color_label;

			// Custom's
			parameterObj.custom_symbol = {
				icon_custom0: this.config.custom_icon0,
				icon_custom1: this.config.custom_icon1,
				icon_custom2: this.config.custom_icon2,
				icon_custom3: this.config.custom_icon3
			}

			// General
			parameterObj.general.no_battery = false;
			parameterObj.general.unit = unit;
			parameterObj.general.battery_animation = this.config.battery_animation;
			parameterObj.general.type = this.config.element_type;

			// Element - Style
			parameterObj.elements.style.size = this.config.element_size || 2;
			parameterObj.elements.style.circle_radius = this.config.circle_radius || 50;
			parameterObj.elements.style.shadow = this.config.element_shadow;
			parameterObj.elements.style.shadow_color = this.config.element_shadow_color;
			parameterObj.elements.style.rect_height = this.config.rect_height;
			parameterObj.elements.style.rect_width = this.config.rect_width;
			parameterObj.elements.style.rect_corner = this.config.rect_corner;

			// buildDataJSON will add some more details to the object

			// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
			this.subscribeForeignStates(subscribeArray);
			// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
			// this.subscribeStates("lights.*");
			// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
			// this.subscribeStates("*");
			this.log.info("Adapter started and listening to " + subscribeArray.length + " States");
			this.log.debug("Initial Values: " + JSON.stringify(valuesObj));

			// Build the Configuration JSON
			this.buildConfigJSON();
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
			if (id == custom0) {
				valuesObj['custom0'] = state.val;
			}
			if (id == custom1) {
				valuesObj['custom1'] = state.val;
			}
			if (id == custom2) {
				valuesObj['custom2'] = state.val;
			}
			if (id == custom3) {
				valuesObj['custom3'] = state.val;
			}
			if (id == production) {
				valuesObj['production'] = state.val;
			}
			if (id == consumption) {
				let consumption = state.val;
				if (consumption_reverse) {
					consumption = consumption * (-1);
				}
				valuesObj['consumption'] = consumption;
			}
			if (id == grid_feed) {
				valuesObj['grid_feed'] = state.val;
			}
			if (id == grid_consuming) {
				valuesObj['grid_consuming'] = state.val;
			}
			if (id == battery_percent) {
				valuesObj['battery_percent'] = (Math.round(state.val * 100) / 100).toFixed(fraction_battery);
			}
			if (id == battery_charge) {
				valuesObj['battery_charge'] = state.val;
			}
			if (id == battery_discharge) {
				valuesObj['battery_discharge'] = state.val;
			}
			if (id == car_charge) {
				valuesObj['car_charge'] = state.val;
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
					//consumptionValue = parseFloat(valuesObj['grid_consuming'] + (prodValue - valuesObj['grid_feed']));
					consumptionValue = valuesObj['grid_consuming'] + (prodValue - valuesObj['grid_feed']);
				} else {
					if (grid_reverse) {
						consumptionValue = valuesObj['grid_feed'] + prodValue;
					} else {
						consumptionValue = (valuesObj['grid_feed'] * -1) + prodValue;
					}
				}
				valuesObj['consumption'] = consumptionValue;
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
		return (Math.round((value / 1000) * 100) / 100).toFixed(fraction);
	}
	/**
	 * @param {number} value
	 */
	floorNumber(value) {
		return (Math.round(value * 100) / 100).toFixed(fraction);
	}

	/**
	 * @param {Object} obj
	 */
	async getInitialValues(obj) {
		let tmpObj = {};
		for (var key of Object.keys(obj)) {
			const value = obj[key];
			const stateValue = await this.getForeignStateAsync(value);
			if (stateValue) {
				if (typeof (stateValue.val) === 'number') {
					if (!key.includes("percent")) {
						tmpObj[key] = stateValue.val;
					} else {
						tmpObj[key] = stateValue.val;
					}
				}
				if (typeof (stateValue.val) === 'boolean') {
					tmpObj[key] = stateValue.val ? true : false;
				}
			} else {
				this.log.warn("The adapter could not find the state " + value + "! Please review the config!");
			}
		}
		if (calculate_consumption) {
			tmpObj.consumption = 0;
		}
		return tmpObj;
	}

	async buildConfigJSON() {
		// Elements - init as false
		let elementsObj = {
			house: false,
			production: false,
			grid: false,
			car: false,
			battery: false,
			custom0: false,
			custom1: false,
			custom2: false,
			custom3: false,
		};

		// Texts
		let textObj = {
			consumption_text: false,
			production_text: false,
			grid_text: false,
			battery_text: false,
			car_text: false,
			custom0_text: false,
			custom1_text: false,
			custom2_text: false,
			custom3_text: false
		};

		// Values
		let valueObj = {
			consumption_value: false,
			production_value: false,
			grid_value: false,
			car_value: false,
			car_percent: false,
			battery_value: false,
			battery_percent: false,
			custom0_value: false,
			custom1_value: false,
			custom2_value: false,
			custom3_value: false,
		};

		// Icons
		let iconObj = {
			house: false,
			production: false,
			grid: false,
			car: false,
			battery: false,
			custom0: false,
			custom1: false,
			custom2: false,
			custom3: false,
		};

		// Lines
		let linesObj = {
			solar_to_house: false,
			grid_to_house: false,
			solar_to_grid: false,
			house_to_car: false,
			grid_to_battery: false,
			solar_to_battery: false,
			battery_to_house: false,
			house_to_custom0: false,
			house_to_custom1: false,
			house_to_custom2: false,
			house_to_custom3: false,
		};

		// Change CSS if no battery is present
		if ((valuesObj['battery_charge'] === undefined || valuesObj['battery_discharge'] === undefined && battery_different) && valuesObj['battery_percent'] === undefined) {
			parameterObj.general.no_battery = true;
		}

		// Consumption
		if (valuesObj['consumption'] != undefined) {
			elementsObj.house = true;
			textObj.consumption_text = true;
			valueObj.consumption_value = true;
			iconObj.house = true;
		}

		// Production
		if (valuesObj['production'] != undefined) {
			elementsObj.production = true;
			textObj.production_text = true;
			valueObj.production_value = true;
			iconObj.production = true;
		}

		// Grid
		if (valuesObj['grid_feed'] != undefined && grid_different === false) {
			elementsObj.grid = true;
			textObj.grid_text = true;
			valueObj.grid_value = true;
			iconObj.grid = true;
		}

		// User has defined to used different States for consuming from and feeding to the grid
		if (grid_different === true) {
			elementsObj.grid = true;
			textObj.grid_text = true;
			valueObj.grid_value = true;
			iconObj.grid = true;
		}

		// Car charge
		if (valuesObj['car_charge'] != undefined) {
			elementsObj.car = true;
			textObj.car_text = true;
			valueObj.car_value = true;
			iconObj.car = true;
		}

		if (valuesObj['car_percent'] != undefined) {
			valueObj.car_percent = true;
		}

		if (valuesObj['car_charge'] != undefined && valuesObj['consumption'] === undefined) {
			elementsObj.house = true;
		}

		// Battery Charge
		if (valuesObj['battery_charge'] != undefined && battery_different === false) {
			elementsObj.battery = true;
			textObj.battery_text = true;
			valueObj.battery_value = true;
			iconObj.battery = true;
		}

		// User has defined to used different States for charging and discharging the battery
		if (battery_different === true) {
			elementsObj.battery = true;
			textObj.battery_text = true;
			valueObj.battery_value = true;
			iconObj.battery = true;
		}

		// Battery percent
		if (valuesObj['battery_percent'] != undefined && valuesObj['battery_charge'] != undefined) {
			valueObj.battery_percent = true;
		}

		// Custom Circle - 0
		if (valuesObj['custom0'] != undefined) {
			elementsObj.custom0 = true;
			textObj.custom0_text = true;
			valueObj.custom0_value = true;
			iconObj.custom0 = true;
		}

		// Custom Circle - 1
		if (valuesObj['custom1'] != undefined) {
			elementsObj.custom1 = true;
			textObj.custom1_text = true;
			valueObj.custom1_value = true;
			iconObj.custom1 = true;
		}

		// Custom Circle - 2
		if (valuesObj['custom2'] != undefined) {
			elementsObj.custom2 = true;
			textObj.custom2_text = true;
			valueObj.custom2_value = true;
			iconObj.custom2 = true;
		}

		// Custom Circle - 3
		if (valuesObj['custom3'] != undefined) {
			elementsObj.custom3 = true;
			textObj.custom3_text = true;
			valueObj.custom3_value = true;
			iconObj.custom3 = true;
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
		if ((valuesObj['consumption'] != undefined && valuesObj['custom0'] != undefined)) {
			linesObj.house_to_custom0 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom1'] != undefined)) {
			linesObj.house_to_custom1 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom2'] != undefined)) {
			linesObj.house_to_custom2 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom3'] != undefined)) {
			linesObj.house_to_custom3 = true;
		}

		// Build the Parameters to be read inside Javascript on Webpage - called once
		parameterObj.elements.elements = elementsObj;
		parameterObj.icons = iconObj;
		parameterObj.lines.lines = linesObj;
		parameterObj.texts.texts = textObj;
		parameterObj.values.values = valueObj;

		await this.setStateAsync("configuration", JSON.stringify(parameterObj), true);

		this.log.debug('Configuration build up successfull!');
		this.log.debug('Elements to be displayed: ' + JSON.stringify(elementsObj));
	}

	async buildDataJSON() {
		// Reset Battery Animation
		dataObj.battery_animation.direction = 'none';
		let values = {};

		// Colors of the values
		let color = {
			consumption_value: this.config.color_house_text,
			grid_value: this.config.color_grid_text,
			production_value: this.config.color_production_text,
			car_value: this.config.color_car_text,
			car_plugged: this.config.color_car_plugged,
			car_percent: this.config.color_car_percent,
			battery_value: this.config.color_battery_text,
			battery_percent: this.config.color_battery_percent,
			custom0_value: this.config.color_custom0_text,
			custom1_value: this.config.color_custom1_text,
			custom2_value: this.config.color_custom2_text,
			custom3_value: this.config.color_custom3_text
		}

		// Line-Animation
		let line_animation = {
			solar_to_house: false,
			grid_to_house: false,
			solar_to_grid: false,
			house_to_car: false,
			grid_to_battery: false,
			solar_to_battery: false,
			battery_to_house: false,
			house_to_custom0: false,
			house_to_custom1: false,
			house_to_custom2: false,
			house_to_custom3: false,
		};


		// Consumption
		if (valuesObj['consumption'] != undefined) {
			if (valuesObj['consumption'] > threshold) {
				color.consumption_value = this.config.color_house_text;
				values.consumption_value = recalculate ? this.recalculateValue(valuesObj['consumption']) : this.floorNumber(valuesObj['consumption']);
			} else {
				color.consumption_value = this.config.color_house_text_no_prod ? this.config.color_house_text_no_prod : this.config.color_house_text;
				values.consumption_value = this.floorNumber(0);
			}
		}

		// Production
		if (valuesObj['production'] != undefined) {
			if (valuesObj['consumption'] > threshold && valuesObj['production'] > threshold) {
				line_animation.solar_to_house = true;
			}

			if (valuesObj['production'] > threshold) {
				color.production_value = this.config.color_production_text;
				values.production_value = recalculate ? this.recalculateValue(valuesObj['production']) : this.floorNumber(valuesObj['production']);
			} else {
				color.production_value = this.config.color_production_text_no_prod ? this.config.color_production_text_no_prod : this.config.color_production_text;
				values.production_value = this.floorNumber(0);
			}
		}

		// Grid
		if (valuesObj['grid_feed'] != undefined && grid_different === false) {
			let gridValue = valuesObj['grid_feed'];
			if (grid_reverse) {
				if (gridValue > threshold) {
					line_animation.grid_to_house = true;
				}
				if (gridValue < (threshold * -1)) {
					// Display as positive
					gridValue = gridValue * -1;
					line_animation.solar_to_grid = true;
				}
			} else {
				if (gridValue > threshold) {
					line_animation.solar_to_grid = true;
				}
				if (gridValue < (threshold * -1)) {
					// Display as positive
					gridValue = gridValue * -1;
					line_animation.grid_to_house = true;
				}
			}

			if (gridValue > threshold) {
				color.grid_value = this.config.color_grid_text;
				values.grid_value = recalculate ? this.recalculateValue(gridValue) : this.floorNumber(gridValue);
			} else {
				color.grid_value = this.config.color_grid_text_no_prod ? this.config.color_grid_text_no_prod : this.config.color_grid_text;
				values.grid_value = this.floorNumber(0);
			}
		}

		// User has defined to used different States for consuming from and feeding to the grid
		if (grid_different === true) {
			let gridConsumeValue = valuesObj['grid_consuming'];
			let gridFeedValue = valuesObj['grid_feed'];
			let gridValue = 0;

			if (gridConsumeValue > threshold && gridFeedValue === 0) {
				line_animation.grid_to_house = true;
				gridValue = gridConsumeValue;
			}

			if (gridFeedValue > threshold && gridConsumeValue === 0) {
				line_animation.solar_to_grid = true;
				gridValue = gridFeedValue;
			}

			if (gridValue > threshold) {
				color.grid_value = this.config.color_grid_text;
				values.grid_value = recalculate ? this.recalculateValue(gridValue) : this.floorNumber(gridValue);
			} else {
				color.grid_value = this.config.color_grid_text_no_prod ? this.config.color_grid_text_no_prod : this.config.color_grid_text;
				values.grid_value = this.floorNumber(0);
			}
		}

		// Car charge
		if (valuesObj['car_charge'] != undefined) {
			if (valuesObj['car_charge'] > threshold) {
				line_animation.house_to_car = true;
			}
			if (valuesObj['car_charge'] > threshold || valuesObj['car_plugged']) {
				values.car_plugged = true;
			}

			values.car_value = recalculate ? this.recalculateValue(valuesObj['car_charge']) : this.floorNumber(valuesObj['car_charge']);
		}

		if (valuesObj['car_percent'] != undefined) {
			values.car_percent = valuesObj['car_percent'];
		}

		if (valuesObj['car_charge'] != undefined && valuesObj['consumption'] === undefined) {
			if (valuesObj['car_charge'] > threshold) {
				line_animation.house_to_car = true;
			}
		}

		// Battery Charge
		if (valuesObj['battery_charge'] != undefined && battery_different === false) {
			let batteryValue = valuesObj['battery_charge'];
			if (battery_reverse) {
				if (batteryValue > threshold) {
					line_animation.battery_to_house = true;
					dataObj.battery_animation.direction = 'discharge';
				}
				if (batteryValue < (threshold * -1)) {
					// Display as positive
					batteryValue = batteryValue * -1;
					line_animation.solar_to_battery = true;
					dataObj.battery_animation.direction = 'charge';
				}
			} else {
				if (batteryValue > threshold) {
					line_animation.solar_to_battery = true;
					dataObj.battery_animation.direction = 'charge';
				}
				if (batteryValue < (threshold * -1)) {
					// Display as positive
					batteryValue = batteryValue * -1;
					line_animation.battery_to_house = true;
					dataObj.battery_animation.direction = 'discharge';
				}
			}

			if (batteryValue > threshold) {
				color.battery_value = this.config.color_battery_text;
				values.battery_value = recalculate ? this.recalculateValue(batteryValue) : this.floorNumber(batteryValue);
			} else {
				color.battery_value = this.config.color_battery_text_no_prod ? this.config.color_battery_text_no_prod : this.config.color_battery_text;
				values.battery_value = this.floorNumber(0);
			}
		}

		// User has defined to used different States for charging and discharging the battery
		if (battery_different === true) {
			let batteryChargeValue = valuesObj['battery_charge'];
			let batteryDischargeValue = valuesObj['battery_discharge'];
			let batteryValue = 0;

			if (batteryChargeValue > threshold && batteryDischargeValue === 0) {
				line_animation.solar_to_battery = true;
				batteryValue = batteryChargeValue;
				dataObj.battery_animation.direction = 'charge';
			}

			if (batteryDischargeValue > threshold && batteryChargeValue === 0) {
				line_animation.battery_to_house = true;
				batteryValue = batteryDischargeValue;
				dataObj.battery_animation.direction = 'discharge';
			}

			if (batteryValue > threshold) {
				color.battery_value = this.config.color_battery_text;
				values.battery_value = recalculate ? this.recalculateValue(batteryValue) : this.floorNumber(batteryValue);
			} else {
				color.battery_value = this.config.color_battery_text_no_prod ? this.config.color_battery_text_no_prod : this.config.color_battery_text;
				values.battery_value = this.floorNumber(0);
			}
		}

		// Battery percent
		if (valuesObj['battery_percent'] != undefined && valuesObj['battery_charge'] != undefined) {
			values.battery_percent = valuesObj['battery_percent'];
		}

		// Custom Circle - 0
		if (valuesObj['custom0'] != undefined) {
			if (valuesObj['custom0'] > threshold) {
				line_animation.house_to_custom0 = true;
				color.custom0_value = this.config.color_custom0_text;
				values.custom0_value = recalculate ? this.recalculateValue(valuesObj['custom0']) : this.floorNumber(valuesObj['custom0']);
			} else {
				color.custom0_value = this.config.color_custom0_text_no_prod ? this.config.color_custom0_text_no_prod : this.config.color_custom0_text;
				values.custom0_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 1
		if (valuesObj['custom1'] != undefined) {
			if (valuesObj['custom1'] > threshold) {
				line_animation.house_to_custom1 = true;
				color.custom1_value = this.config.color_custom1_text;
				values.custom1_value = recalculate ? this.recalculateValue(valuesObj['custom1']) : this.floorNumber(valuesObj['custom1']);
			} else {
				color.custom1_value = this.config.color_custom1_text_no_prod ? this.config.color_custom1_text_no_prod : this.config.color_custom1_text;
				values.custom1_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 2
		if (valuesObj['custom2'] != undefined) {
			if (valuesObj['custom2'] > threshold) {
				line_animation.house_to_custom2 = true;
				color.custom2_value = this.config.color_custom2_text;
				values.custom2_value = recalculate ? this.recalculateValue(valuesObj['custom2']) : this.floorNumber(valuesObj['custom2']);
			} else {
				color.custom2_value = this.config.color_custom2_text_no_prod ? this.config.color_custom2_text_no_prod : this.config.color_custom2_text;
				values.custom2_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 3
		if (valuesObj['custom3'] != undefined) {
			if (valuesObj['custom3'] > threshold) {
				line_animation.house_to_custom3 = true;
				color.custom3_value = this.config.color_custom3_text;
				values.custom3_value = recalculate ? this.recalculateValue(valuesObj['custom3']) : this.floorNumber(valuesObj['custom3']);
			} else {
				color.custom3_value = this.config.color_custom3_text_no_prod ? this.config.color_custom3_text_no_prod : this.config.color_custom3_text;
				values.custom3_value = this.floorNumber(0);
			}
		}

		// Battery substraction from Consumption
		if (calculate_consumption) {
			// Check, which direction we have
			let tmpValue = parseFloat(values.consumption_value);

			// Fallback if no charging
			let tmpResult = tmpValue;

			if (dataObj.battery_animation.direction == 'charge') {
				tmpResult = tmpValue - parseFloat(values.battery_value);
			}

			if (dataObj.battery_animation.direction == 'discharge') {
				tmpResult = tmpValue + parseFloat(values.battery_value);
			}

			// Set the Value
			values.consumption_value = tmpResult;
		}

		// House netto - Reduce House consumption with Custom-Circle and Car-Charge
		if (house_netto) {
			let tmpValue = parseFloat(values.consumption_value);
			let tmpResult = tmpValue;

			if (values.car_value) {
				tmpResult = tmpValue - parseFloat(values.car_value);
			}

			if (values.custom0_value0) {
				tmpResult = tmpResult - parseFloat(values.custom0_value);
			}
			if (values.custom1_value) {
				tmpResult = tmpResult - parseFloat(values.custom1_value);
			}
			if (values.custom2_value) {
				tmpResult = tmpResult - parseFloat(values.custom2_value);
			}
			if (values.custom3_value) {
				tmpResult = tmpResult - parseFloat(values.custom3_value);
			}

			// Set the Value
			values.consumption_value = tmpResult;
		}

		// After the things are done, we need to recalculate the consumption

		if (house_netto || calculate_consumption) {
			values.consumption_value = this.floorNumber(values.consumption_value);
		}

		// Build the Values and Animations to be read inside Javascript - called every time a value changes
		dataObj.animations = line_animation;
		dataObj.values = values;
		dataObj.color = color;

		await this.setStateAsync("data", JSON.stringify(dataObj), true);
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