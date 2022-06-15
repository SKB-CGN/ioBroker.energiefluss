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
let battery_percent;
let battery_charge;
let battery_discharge;
let battery_different;
let car_charge;
let car_percent;
let recalculate = false;
let valuesObj = {};
let configObj = {};
let subscribeArray = new Array();

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
			unit = ' ' + this.config.unit;
			production = this.config.production;
			consumption = this.config.consumption;
			grid_feed = this.config.grid_feed;
			grid_consuming = this.config.grid_consuming;
			grid_different = this.config.grid_different;
			grid_reverse = this.config.grid_reverse ? true : false;
			battery_percent = this.config.battery_percent;
			battery_charge = this.config.battery_charge;
			battery_discharge = this.config.battery_discharge;
			battery_different = this.config.battery_different;
			car_charge = this.config.car_charge;
			car_percent = this.config.car_percent;

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
				car_percent: car_percent
			};
			// Delete empty ones
			configObj = Object.entries(configObj).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
			this.log.debug("Added States for subscribing: " + JSON.stringify(configObj));

			// Load all Data once before subscribing
			valuesObj = await this.getInitialValues(configObj);

			this.log.debug("Initial Values: " + JSON.stringify(valuesObj));

			// Build array for subscribing to states
			subscribeArray = Object.values(configObj);

			this.log.debug("Requesting the following states: " + subscribeArray.toString());

			/*
			For every state in the system there has to be also an object of type state
			Here a simple template for a boolean variable named "testVariable"
			Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
			*/
			await this.setObjectNotExistsAsync("HTML", {
				type: "state",
				common: {
					name: "HTML Output",
					type: "string",
					role: "html",
					read: true,
					write: false,
				},
				native: {},
			});

			// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
			this.subscribeForeignStates(subscribeArray);
			// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
			// this.subscribeStates("lights.*");
			// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
			// this.subscribeStates("*");
			this.log.info("Adapter started and listening to " + subscribeArray.length + " States");
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
		if (id == production) {
			valuesObj['production'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == consumption) {
			valuesObj['consumption'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == grid_feed) {
			valuesObj['grid_feed'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == grid_consuming) {
			valuesObj['grid_consuming'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == battery_percent) {
			valuesObj['battery_percent'] = state.val;
		}
		if (id == battery_charge) {
			valuesObj['battery_charge'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == battery_discharge) {
			valuesObj['battery_discharge'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == car_charge) {
			valuesObj['car_charge'] = recalculate ? this.recalculateValue(state.val) : state.val;
		}
		if (id == car_percent) {
			valuesObj['car_percent'] = state.val;
		}

		/*
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
		*/
		this.rebuildHTML();
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
		return (value / 1000).toFixed(2);
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
				if (err) {
					this.log.error(err);
				} else {
					if (!key.includes("percent")) {
						tmpObj[key] = recalculate ? this.recalculateValue(stateValue.val) : stateValue.val;
					} else {
						tmpObj[key] = stateValue.val;
					}
				}
			});
		});
		return tmpObj;
	}

	async rebuildHTML() {
		let circle_defs = new Array();
		let line_defs = new Array();
		let circle_uses = new Array();
		let line_uses = new Array();
		let line_animation = new Array();

		let html_head = '<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width,initial-scale=1.0"> <title>Energiefluss</title> <style>/* border consuming */ svg{height: auto; width: 95%;}circle{stroke-width: 4px; fill: none; /* fill: transparent;*/}.path{stroke-width: 4px; fill: none;}.icon_color{opacity: 0.7;}circle{stroke-width: 2px; fill: white;}.bg{/* stroke: #efeff0; */ stroke: #000000; stroke-dasharray: 1000; opacity: 0.7;}.elm_solar{stroke: #ffce4a;}.text_solar{fill: #ffce4a;}.elm_house{stroke: #00b5dd;}.text_house{fill: #00b5dd;}.elm_car{stroke: #c5902e;}.text_car{fill: #c5902e;}.elm_battery{stroke: #a1d343;}.text_battery{fill: #a1d343;}.elm_grid{stroke: #61687a;}.text_grid{fill: #61687a;}.text_inside_circle{font: 10px sans-serif; opacity: 0.7;}.value_inside_circle{font: 14px sans-serif;}.value_inside_circle_small{font: 10px sans-serif;}.consumption_animation{animation: cons 4s infinite steps(21); stroke: #ffce4a; stroke-dasharray: 4 12 4 12 4 120; stroke-linecap: round;}@keyframes cons{0%{stroke-dashoffset: 368;}100%{stroke-dashoffset: 32;}}body{background: white;}.shadow {-webkit-filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, .7));filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, .7));}</style></head><body> <svg viewBox="0 0 510 510" width="510" height="510">';
		/* Build all circles */
		if (valuesObj['consumption'] != undefined) {
			circle_defs.push('<circle id="home_present" cx="448" cy="250" r="50"/> <path id="icon_house" transform="translate(436,207)" class="icon_color" d="M0,21V10L7.5,5L15,10V21H10V14H5V21H0M24,2V21H17V8.93L16,8.27V6H14V6.93L10,4.27V2H24M21,14H19V16H21V14M21,10H19V12H21V10M21,6H19V8H21V6Z"/> <text text-anchor="middle" id="text_house" x="450" y="280">Verbrauch</text> <text text-anchor="middle" id="text_house_value" x="450" y="255">' + valuesObj['consumption'] + ' ' + unit + '</text>');
			circle_uses.push('<use class="elm_house shadow" xlink:href="#home_present"/> <use class="text_inside_circle" xlink:href="#text_house"/> <use class="value_inside_circle text_house" xlink:href="#text_house_value"/> <use xlink:href="#icon_house"/>');
		}
		if (valuesObj['production'] != undefined) {
			if (valuesObj['consumption'] > 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#solar_to_house" />');
			}
			circle_defs.push('<circle id="solar_present" cx="250" cy="52" r="50" /><path id="icon_solar" transform="translate(238,8)" class="icon_color" d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" /><text text-anchor="middle" id="text_solar" x="250" y="79">Erzeugung</text><text text-anchor="middle" id="text_solar_value" x="250" y="54">' + valuesObj['production'] + ' ' + unit + '</text>');
			circle_uses.push('<use class="elm_solar shadow" xlink:href="#solar_present" /><use class="text_inside_circle" xlink:href="#text_solar" /><use class="value_inside_circle text_solar" xlink:href="#text_solar_value" /><use xlink:href="#icon_solar" />');
		}
		if (valuesObj['grid_feed'] != undefined && grid_different === false) {
			let gridValue = valuesObj['grid_feed'];
			if (grid_reverse) {
				if (gridValue > 0) {
					line_animation.push('<use class="consumption_animation" xlink:href="#grid_to_house" />');
				}
				if (gridValue < 0) {
					// Display as positive
					gridValue = gridValue * -1;
					line_animation.push('<use class="consumption_animation" xlink:href="#solar_to_grid" />');
				}
			} else {
				if (gridValue > 0) {
					line_animation.push('<use class="consumption_animation" xlink:href="#solar_to_grid" />');
				}
				if (gridValue < 0) {
					// Display as positive
					gridValue = gridValue * -1;
					line_animation.push('<use class="consumption_animation" xlink:href="#grid_to_house" />');
				}
			}
			// Feeding the grid

			gridValue = gridValue + ' ' + unit;

			circle_defs.push('<circle id="grid_present" cx="250" cy="448" r="50" /><path id="icon_grid" transform="translate(238,406)" class="icon_color" d="M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z" /><text text-anchor="middle" id="text_grid" x="250" y="478">Netz</text><text text-anchor="middle" id="text_grid_value" x="250" y="453">' + gridValue + '</text>');
			circle_uses.push('<use class="elm_grid shadow" xlink:href="#grid_present" /><use class="text_inside_circle" xlink:href="#text_grid" /><use class="value_inside_circle text_grid" xlink:href="#text_grid_value" /><use xlink:href="#icon_grid" />');
		}

		// User has defined to used different States for consuming from and feeding to the grid
		if (grid_different === true) {
			let gridConsumeValue = valuesObj['grid_consuming'];
			let gridFeedValue = valuesObj['grid_feed'];
			let gridValue = 0 + ' ' + unit;

			if (gridConsumeValue > 0 && gridFeedValue === 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#grid_to_house" />');
				gridValue = gridConsumeValue + ' ' + unit;
			}

			if (gridFeedValue > 0 && gridConsumeValue === 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#solar_to_grid" />');
				gridValue = gridFeedValue + ' ' + unit;
			}

			circle_defs.push('<circle id="grid_present" cx="250" cy="448" r="50" /><path id="icon_grid" transform="translate(238,406)" class="icon_color" d="M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z" /><text text-anchor="middle" id="text_grid" x="250" y="478">Netz</text><text text-anchor="middle" id="text_grid_value" x="250" y="453">' + gridValue + '</text>');
			circle_uses.push('<use class="elm_grid shadow" xlink:href="#grid_present" /><use class="text_inside_circle" xlink:href="#text_grid" /><use class="value_inside_circle text_grid" xlink:href="#text_grid_value" /><use xlink:href="#icon_grid" />');
		}

		if (valuesObj['car_charge'] != undefined) {
			if (valuesObj['car_charge'] > 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#house_to_car" />');
			}
			circle_defs.push('<circle id="car_present" cx="448" cy="448" r="50" /><path id="icon_car" transform="translate(436,406)" class="icon_color" d="M18.92 2C18.72 1.42 18.16 1 17.5 1H6.5C5.84 1 5.29 1.42 5.08 2L3 8V16C3 16.55 3.45 17 4 17H5C5.55 17 6 16.55 6 16V15H18V16C18 16.55 18.45 17 19 17H20C20.55 17 21 16.55 21 16V8L18.92 2M6.85 3H17.14L18.22 6.11H5.77L6.85 3M19 13H5V8H19V13M7.5 9C8.33 9 9 9.67 9 10.5S8.33 12 7.5 12 6 11.33 6 10.5 6.67 9 7.5 9M16.5 9C17.33 9 18 9.67 18 10.5S17.33 12 16.5 12C15.67 12 15 11.33 15 10.5S15.67 9 16.5 9M7 20H11V18L17 21H13V23L7 20Z" /><text text-anchor="middle" id="text_car" x="450" y="478">Auto</text><text text-anchor="middle" id="text_car_value" x="450" y="453">' + valuesObj['car_charge'] + ' ' + unit + '</text>');
			circle_uses.push('<use class="elm_car shadow" xlink:href="#car_present" /><use class="text_inside_circle" xlink:href="#text_car" /><use class="value_inside_circle text_car" xlink:href="#text_car_value" /><use xlink:href="#icon_car" />');
		}

		if (valuesObj['car_percent'] != undefined) {
			circle_defs.push('<text text-anchor="middle" id="text_car_percent" x="450" y="466">' + valuesObj['car_percent'] + '%</text>');
			circle_uses.push('<use class="value_inside_circle_small text_car" xlink:href="#text_car_percent" />');
		}

		if (valuesObj['car_charge'] != undefined && valuesObj['consumption'] === undefined) {
			if (valuesObj['car_charge'] > 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#house_to_car" />');
			}
			circle_defs.push('<circle id="home_present" cx="448" cy="250" r="50"/> <path id="icon_house" transform="translate(436,207)" class="icon_color" d="M0,21V10L7.5,5L15,10V21H10V14H5V21H0M24,2V21H17V8.93L16,8.27V6H14V6.93L10,4.27V2H24M21,14H19V16H21V14M21,10H19V12H21V10M21,6H19V8H21V6Z"/>');
			circle_uses.push('<use class="elm_house shadow" xlink:href="#home_present"/><use xlink:href="#icon_house"/>');
		}

		if (valuesObj['battery_charge'] != undefined && battery_different === false) {
			let batteryValue = valuesObj['battery_charge'];
			// Feeding the grid
			if (batteryValue > 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#solar_to_battery" />');
			}
			if (batteryValue < 0) {
				// Display as positive & change animation
				batteryValue = batteryValue * -1;
				line_animation.push('<use class="consumption_animation" xlink:href="#battery_to_house" />');
			}
			batteryValue = batteryValue + ' ' + unit;
			circle_defs.push('<circle id="battery_present" cx="52" cy="250" r="50" /><path id="icon_battery" transform="translate(40,207)" class="icon_color" d="M16 20H8V6H16M16.67 4H15V2H9V4H7.33C6.6 4 6 4.6 6 5.33V20.67C6 21.4 6.6 22 7.33 22H16.67C17.41 22 18 21.41 18 20.67V5.33C18 4.6 17.4 4 16.67 4M15 16H9V19H15V16M15 7H9V10H15V7M15 11.5H9V14.5H15V11.5Z" /><text text-anchor="middle" id="text_battery" x="52" y="280">Batterie</text><text text-anchor="middle" id="text_battery_value" x="52" y="255">' + batteryValue + '</text>');
			circle_uses.push('<use class="elm_battery shadow" xlink:href="#battery_present" /><use class="text_inside_circle" xlink:href="#text_battery" /><use class="value_inside_circle text_battery" xlink:href="#text_battery_value" /><use xlink:href="#icon_battery" />');
		}

		// User has defined to used different States for consuming from and feeding to the grid
		if (battery_different === true) {
			let batteryChargeValue = valuesObj['battery_charge'];
			let batteryDischargeValue = valuesObj['battery_discharge'];
			let batteryValue = 0 + ' ' + unit;

			if (batteryChargeValue > 0 && batteryDischargeValue === 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#solar_to_battery" />');
				batteryValue = batteryChargeValue + ' ' + unit;
			}

			if (batteryDischargeValue > 0 && batteryChargeValue === 0) {
				line_animation.push('<use class="consumption_animation" xlink:href="#battery_to_house" />');
				batteryValue = batteryDischargeValue + ' ' + unit;
			}

			circle_defs.push('<circle id="grid_present" cx="250" cy="448" r="50" /><path id="icon_grid" transform="translate(238,406)" class="icon_color" d="M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z" /><text text-anchor="middle" id="text_grid" x="250" y="478">Netz</text><text text-anchor="middle" id="text_grid_value" x="250" y="453">' + batteryValue + '</text>');
			circle_uses.push('<use class="elm_grid shadow" xlink:href="#grid_present" /><use class="text_inside_circle" xlink:href="#text_grid" /><use class="value_inside_circle text_grid" xlink:href="#text_grid_value" /><use xlink:href="#icon_grid" />');
		}

		if (valuesObj['battery_percent'] != undefined) {
			circle_defs.push('<text text-anchor="middle" id="text_battery_percent" x="52" y="268">' + valuesObj['battery_percent'] + '%</text>');
			circle_uses.push('<use class="value_inside_circle_small text_battery" xlink:href="#text_battery_percent" />');
		}


		/* 
		circle_defs.push('');
		circle_uses.push('');
		line_defs.push('');
		line_uses.push('');
		}
		*/

		/* Build all lines */
		if (valuesObj['production'] != undefined && valuesObj['consumption'] != undefined) {
			line_defs.push('<path id="solar_to_house" d="M 270,98 v 132 l 0,0 h 132" class="path"/>');
			line_uses.push('<use class="bg" xlink:href="#solar_to_house"/>');
		}
		if (valuesObj['consumption'] != undefined && (valuesObj['grid_feed'] != undefined || valuesObj['grid_consuming'] != undefined)) {
			line_defs.push('<path id="grid_to_house" d="M 270,402 v -132 l 0,0 h 132" class="path" />');
			line_uses.push('<use class="bg" xlink:href="#grid_to_house" />');
		}
		if (valuesObj['production'] != undefined && (valuesObj['grid_feed'] != undefined || valuesObj['grid_consuming'] != undefined)) {
			line_defs.push('<path id="solar_to_grid" d="M 250,102 v 295" class="path" />');
			line_uses.push('<use class="bg" xlink:href="#solar_to_grid" />');
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['car_charge'] != undefined) || (valuesObj['car_charge'] != undefined && valuesObj['consumption'] === undefined)) {
			line_defs.push('<path id="house_to_car" d="M 448,300 v 97" class="path" />');
			line_uses.push('<use class="bg" xlink:href="#house_to_car" />');
		}
		if (valuesObj['battery_charge'] != undefined && valuesObj['grid_feed'] != undefined) {
			line_defs.push('<path id="solar_to_battery" d="M 230,98 v 132 l 0,0 h -132" class="path" /><path id="grid_to_battery" d="M 230,402 v -132 l 0,0 h -132" class="path" />');
			line_uses.push('<use class="bg" xlink:href="#solar_to_battery" /><use class="bg" xlink:href="#grid_to_battery" />');
		}
		if (valuesObj['battery_charge'] != undefined && valuesObj['consumption'] != undefined) {
			line_defs.push('<path id="battery_to_house" d="M 102,250 h 295" class="path" />');
			line_uses.push('<use class="bg" xlink:href="#battery_to_house" />');
		}


		//let def_production = '<circle id="grid_present" cx="250" cy="448" r="50"/> <path id="icon_grid" transform="translate(238,406)" class="icon_color" d="M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z"/> <text text-anchor="middle" id="text_grid" x="250" y="478">Netz</text> <text text-anchor="middle" id="text_grid_value" x="250" y="453">' + valuesObj['production'] + '</text> <path id="solar_to_grid" d="M 250,102 v 295" class="path"/> <path id="grid_to_house" d="M 270,402 v -132 l 0,0 h 132" class="path"/> <path id="grid_to_battery" d="M 230,402 v -132 l 0,0 h -132" class="path"/>';

		//let html_standard = '<use class="elm_house" xlink:href="#home_present"/> <use class="elm_solar" xlink:href="#solar_present"/> <use class="elm_grid" xlink:href="#grid_present"/> <use class="bg" xlink:href="#solar_to_grid"/> <use class="bg" xlink:href="#solar_to_house"/> <use class="bg" xlink:href="#grid_to_house"/> <use xlink:href="#icon_house"/> <use xlink:href="#icon_solar"/> <use xlink:href="#icon_grid"/> <use class="text_inside_circle" xlink:href="#text_house"/> <use class="value_inside_circle text_house" xlink:href="#text_house_value"/> <use class="text_inside_circle" xlink:href="#text_solar"/> <use class="value_inside_circle text_solar" xlink:href="#text_solar_value"/> <use class="text_inside_circle" xlink:href="#text_grid"/> <use class="value_inside_circle text_grid" xlink:href="#text_grid_value"/>';

		// Put definitions together
		/* Lines */
		let defs_html = '<dev>';
		line_defs.forEach(function (id, i) {
			defs_html = defs_html + id;
		});
		/* Circles */
		circle_defs.forEach(function (id, i) {
			defs_html = defs_html + id;
		});
		defs_html = defs_html + '</dev>';

		// Put uses together
		/* Lines */
		let uses_html = "";
		line_uses.forEach(function (value) {
			uses_html = uses_html + value;
		});
		/* Animations */
		line_animation.forEach(function (value) {
			uses_html = uses_html + value;
		});

		/* Circles */
		circle_uses.forEach(function (value) {
			uses_html = uses_html + value;
		});

		let html = html_head + defs_html + uses_html + '</svg></body></html>';

		await this.setStateAsync("HTML", html, true);
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