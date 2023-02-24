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
let unit_swap;
let production;
let production0;
let production1;
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
let battery_dod;
let calculate_consumption;
let consumption_reverse;
let recalculate;
let custom0, custom1, custom2, custom3, custom4, custom5, custom6, custom7, custom8, custom9, custom10;
let swap_consumption, swap_production, swap_production0, swap_production1, swap_grid;
let house_netto = {}
let fraction;
let fraction_battery;
let threshold;
let battery_info;
let battery_capacity;
let custom0_percent;
let custom10_percent;
let car_custom_plugged;
let car_custom10_plugged;
let custom_type, custom4_type, custom9_type, custom10_type;
let automatic_animation = false;
let no_feed_in;
let neg_feed_in;

/* Data Objects */
let kwCalc = {};
let valuesObj = {};
let dataObj = {
	values: {},
	animations: {},
	battery_animation: {},
	color: {},
	swap_values: {},
	automatic_animation: {}
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
	icons: {
		icons: {},
		color: {},
		style: {}
	},
	texts: {
		texts: {},
		labels: {},
		color: {},
		style: {}
	},
	values: {
		values: {},
		style: {}
	},
	percent: {
		style: {}
	},
	custom_symbol: {},
	swap_texts: {
		labels: {}
	}
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
		// Upgrade older config
		if (await this.migrateConfig()) {
			return;
		}

		// Initialize your adapter here
		unit = this.config.unit;
		neg_feed_in = this.config.neg_feed_in ? this.config.neg_feed_in : false;
		unit_swap = this.config.unit_swap;
		production = this.config.production;
		production0 = this.config.production0;
		production1 = this.config.production1;
		consumption = this.config.consumption;
		consumption_reverse = this.config.consumption_reverse ? this.config.consumption_reverse : false;
		grid_feed = this.config.grid_feed;
		grid_consuming = this.config.grid_consuming;
		grid_different = this.config.grid_different;
		grid_reverse = this.config.grid_reverse ? true : false;
		grid_all_positive = this.config.grid_all_positive ? true : false;
		battery_percent = this.config.battery_percent;
		battery_charge = this.config.battery_charge;
		battery_discharge = this.config.battery_discharge;
		battery_different = this.config.battery_different;
		battery_reverse = this.config.battery_reverse ? this.config.battery_reverse : false;
		calculate_consumption = this.config.calculate_consumption ? this.config.calculate_consumption : false;
		automatic_animation = this.config.automatic_animation ? this.config.automatic_animation : false;
		no_feed_in = this.config.no_feed_in ? this.config.no_feed_in : false;
		custom0 = this.config.custom0;
		custom1 = this.config.custom1;
		custom2 = this.config.custom2;
		custom3 = this.config.custom3;
		custom4 = this.config.custom4;
		custom5 = this.config.custom5;
		custom6 = this.config.custom6;
		custom7 = this.config.custom7;
		custom8 = this.config.custom8;
		custom9 = this.config.custom9;
		custom10 = this.config.custom10;
		house_netto = {
			custom0: this.config.house_netto_custom0,
			custom1: this.config.house_netto_custom1,
			custom2: this.config.house_netto_custom2,
			custom3: this.config.house_netto_custom3,
			custom4: this.config.house_netto_custom4,
			custom5: this.config.house_netto_custom5,
			custom6: this.config.house_netto_custom6,
			custom7: this.config.house_netto_custom7,
			custom8: this.config.house_netto_custom8,
			custom9: this.config.house_netto_custom9,
			custom10: this.config.house_netto_custom10,
		}
		fraction = this.config.fraction;
		fraction_battery = this.config.fraction_battery;
		threshold = this.config.threshold ? this.config.threshold : 0;
		battery_info = this.config.battery_capacity_info ? this.config.battery_capacity_info : false;
		battery_capacity = this.config.battery_capacity ? this.config.battery_capacity : 0;
		battery_dod = this.config.battery_dod ? this.config.battery_dod : 0;
		custom0_percent = this.config.car_custom_percent;
		car_custom_plugged = this.config.car_custom_plugged;
		custom10_percent = this.config.car_custom10_percent;
		car_custom10_plugged = this.config.car_custom10_plugged;
		custom_type = this.config.custom_type;
		custom10_type = this.config.custom10_type;
		custom4_type = this.config.custom4_type;
		custom9_type = this.config.custom9_type;
		recalculate = this.config.recalculate ? this.config.recalculate : false;
		swap_consumption = this.config.swap_consumption;
		swap_grid = this.config.swap_grid;
		swap_production = this.config.swap_production;
		swap_production0 = this.config.swap_production0;
		swap_production1 = this.config.swap_production1;

		this.log.info("Starting Energiefluss Adapter");

		// Put all kW Sources into an Object
		kwCalc = {
			production: this.config.kw_production ? this.config.kw_production : false,
			production0: this.config.kw_production0 ? this.config.kw_production0 : false,
			production1: this.config.kw_production1 ? this.config.kw_production1 : false,
			consumption: this.config.kw_consumption ? this.config.kw_consumption : false,
			grid_feed: this.config.kw_grid_feed ? this.config.kw_grid_feed : false,
			grid_consuming: this.config.kw_grid_consuming ? this.config.kw_grid_consuming : false,
			battery_charge: this.config.kw_battery_charge ? this.config.kw_battery_charge : false,
			battery_discharge: this.config.kw_battery_discharge ? this.config.kw_battery_discharge : false,
			custom0: this.config.kw_custom0 ? this.config.kw_custom0 : false,
			custom1: this.config.kw_custom1 ? this.config.kw_custom1 : false,
			custom2: this.config.kw_custom2 ? this.config.kw_custom2 : false,
			custom3: this.config.kw_custom3 ? this.config.kw_custom3 : false,
			custom4: this.config.kw_custom4 ? this.config.kw_custom4 : false,
			custom5: this.config.kw_custom5 ? this.config.kw_custom5 : false,
			custom6: this.config.kw_custom6 ? this.config.kw_custom6 : false,
			custom7: this.config.kw_custom7 ? this.config.kw_custom7 : false,
			custom8: this.config.kw_custom8 ? this.config.kw_custom8 : false,
			custom9: this.config.kw_custom9 ? this.config.kw_custom9 : false,
			custom10: this.config.kw_custom10 ? this.config.kw_custom10 : false
		}

		// Put all possible variables into an Object and after that, filter empty ones
		configObj = {
			production: production,
			production0: production0,
			production1: production1,
			consumption: consumption,
			grid_feed: grid_feed,
			grid_consuming: grid_consuming,
			battery_charge: battery_charge,
			battery_discharge: battery_discharge,
			battery_percent: battery_percent,
			custom0: custom0,
			custom1: custom1,
			custom2: custom2,
			custom3: custom3,
			custom4: custom4,
			custom5: custom5,
			custom6: custom6,
			custom7: custom7,
			custom8: custom8,
			custom9: custom9,
			custom10: custom10,
			custom0_percent: custom0_percent,
			car_custom_plugged: car_custom_plugged,
			custom10_percent: custom10_percent,
			car_custom10_plugged: car_custom10_plugged,
			swap_consumption: swap_consumption,
			swap_production: swap_production,
			swap_production0: swap_production0,
			swap_production1: swap_production1,
			swap_grid: swap_grid
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
				type: 'json',
				role: 'state',
				read: true,
				write: false,
			},
			native: {},
		});

		await this.setObjectNotExistsAsync('data', {
			type: 'state',
			common: {
				name: 'Data for HTML Output',
				type: 'json',
				role: 'state',
				read: true,
				write: false,
			},
			native: {},
		});

		await this.setObjectNotExistsAsync('battery_remaining', {
			type: 'state',
			common: {
				name: 'Remaining Time of the battery',
				type: 'string',
				role: 'text',
				read: true,
				write: false,
			},
			native: {},
		});

		// Delete old State HTML
		await this.deleteStateAsync('HTML');

		/* Build Parameter */
		// Colors of the Elements
		parameterObj.elements.color = {
			house: this.config.color_house,
			grid: this.config.color_grid,
			solar: this.config.color_production,
			solar0: this.config.color_production0,
			solar1: this.config.color_production1,
			battery: this.config.color_battery,
			custom0: this.config.color_custom0,
			custom1: this.config.color_custom1,
			custom2: this.config.color_custom2,
			custom3: this.config.color_custom3,
			custom4: this.config.color_custom4,
			custom5: this.config.color_custom5,
			custom6: this.config.color_custom6,
			custom7: this.config.color_custom7,
			custom8: this.config.color_custom8,
			custom9: this.config.color_custom9,
			custom10: this.config.color_custom10
		}

		// Fills of the Elements
		parameterObj.elements.fill = {
			house: this.config.fill_color_house,
			grid: this.config.fill_color_grid,
			solar: this.config.fill_color_production,
			solar0: this.config.fill_color_production0,
			solar1: this.config.fill_color_production1,
			battery: this.config.fill_color_battery,
			custom0: this.config.fill_color_custom0,
			custom1: this.config.fill_color_custom1,
			custom2: this.config.fill_color_custom2,
			custom3: this.config.fill_color_custom3,
			custom4: this.config.fill_color_custom4,
			custom5: this.config.fill_color_custom5,
			custom6: this.config.fill_color_custom6,
			custom7: this.config.fill_color_custom7,
			custom8: this.config.fill_color_custom8,
			custom9: this.config.fill_color_custom9,
			custom10: this.config.fill_color_custom10
		}

		// Colors of the lines
		parameterObj.lines.color = {
			solar_to_battery: this.config.color_solar_to_battery,
			solar_to_grid: this.config.color_solar_to_grid,
			solar_to_house: this.config.color_solar_to_house,
			solar0_to_solar: this.config.color_solar0_to_solar,
			solar1_to_solar: this.config.color_solar1_to_solar,
			grid_to_house: this.config.color_grid_to_house,
			grid_to_battery: this.config.color_grid_to_battery,
			battery_to_house: this.config.color_battery_to_house,
			default: this.config.color_lines,
			house_to_custom0: this.config.color_house_to_custom0,
			house_to_custom1: this.config.color_house_to_custom1,
			house_to_custom2: this.config.color_house_to_custom2,
			house_to_custom3: this.config.color_house_to_custom3,
			house_to_custom4: this.config.color_house_to_custom4,
			house_to_custom5: this.config.color_house_to_custom5,
			house_to_custom6: this.config.color_house_to_custom6,
			house_to_custom7: this.config.color_house_to_custom7,
			house_to_custom8: this.config.color_house_to_custom8,
			house_to_custom9: this.config.color_house_to_custom9,
			house_to_custom10: this.config.color_house_to_custom10,
		}

		// Animation Colors of the lines
		parameterObj.lines.animation_colors = {
			solar_to_battery: this.config.animation_color_solar_to_battery,
			solar_to_grid: this.config.animation_color_solar_to_grid,
			solar_to_house: this.config.animation_color_solar_to_house,
			solar0_to_solar: this.config.animation_color_solar0_to_solar,
			solar1_to_solar: this.config.animation_color_solar1_to_solar,
			grid_to_house: this.config.animation_color_grid_to_house,
			grid_to_battery: this.config.animation_color_grid_to_battery,
			battery_to_house: this.config.animation_color_battery_to_house,
			default: this.config.color_animation,
			house_to_custom0: this.config.animation_color_house_to_custom0,
			house_to_custom1: this.config.animation_color_house_to_custom1,
			house_to_custom2: this.config.animation_color_house_to_custom2,
			house_to_custom3: this.config.animation_color_house_to_custom3,
			house_to_custom4: this.config.animation_color_house_to_custom4,
			house_to_custom5: this.config.animation_color_house_to_custom5,
			house_to_custom6: this.config.animation_color_house_to_custom6,
			house_to_custom7: this.config.animation_color_house_to_custom7,
			house_to_custom8: this.config.animation_color_house_to_custom8,
			house_to_custom9: this.config.animation_color_house_to_custom9,
			house_to_custom10: this.config.animation_color_house_to_custom10
		}

		// Style of the Lines
		parameterObj.lines.style = {
			line_size: this.config.line_size,
			animation_width: this.config.animation_width,
			animation: this.config.animation,
			animation_duration: this.config.animation_duration,
			animation_linecap: this.config.animation_linecap,
			animation_type: this.config.animation_type
		}

		// Fonts
		parameterObj.fonts = {
			font_src: this.config.font_src,
			font: this.config.font,
			font_size_label: this.config.font_size_label,
			font_size_value: this.config.font_size_value,
			font_size_percent: this.config.font_size_percent,
			font_size_unit: this.config.font_size_unit,
			font_size_unit_percent: this.config.font_size_unit_percent,
			font_size_remaining: this.config.font_size_remaining
		}

		// Labels
		parameterObj.texts.labels = {
			house: this.config.label_house,
			solar: this.config.label_production,
			solar0: this.config.label_production0,
			solar1: this.config.label_production1,
			grid: this.config.label_grid,
			battery: this.config.label_battery,
			battery_remaining: this.config.label_battery_remaining,
			custom0: this.config.label_custom0,
			custom1: this.config.label_custom1,
			custom2: this.config.label_custom2,
			custom3: this.config.label_custom3,
			custom4: this.config.label_custom4,
			custom5: this.config.label_custom5,
			custom6: this.config.label_custom6,
			custom7: this.config.label_custom7,
			custom8: this.config.label_custom8,
			custom9: this.config.label_custom9,
			custom10: this.config.label_custom10,
		}

		// Label Color
		parameterObj.texts.color = {
			default: this.config.color_label,
			// Label Battery Remaining Time Color
			battery_remaining: this.config.color_battery_remain
		}
		parameterObj.texts.style = {
			shadow: this.config.text_shadow,
			shadow_color: this.config.text_shadow_color,
		}

		// Icon Color
		parameterObj.icons.color.default = this.config.color_icon;
		parameterObj.icons.style = {
			shadow: this.config.icons_shadow,
			shadow_color: this.config.icons_shadow_color,
		}

		// Custom's
		parameterObj.custom_symbol = {
			icon_custom0: this.config.custom_icon0,
			icon_custom1: this.config.custom_icon1,
			icon_custom2: this.config.custom_icon2,
			icon_custom3: this.config.custom_icon3,
			icon_custom4: this.config.custom_icon4,
			icon_custom5: this.config.custom_icon5,
			icon_custom6: this.config.custom_icon6,
			icon_custom7: this.config.custom_icon7,
			icon_custom8: this.config.custom_icon8,
			icon_custom9: this.config.custom_icon9,
			icon_custom10: this.config.custom_icon10,
			icon_solar: this.config.icon_production,
			icon_solar0: this.config.icon_production0,
			icon_solar1: this.config.icon_production1,
			icon_grid: this.config.icon_grid,
			icon_house: this.config.icon_house
		}

		// General
		parameterObj.general = {
			no_battery: false,
			unit: unit,
			unit_swap: unit_swap,
			battery_animation: this.config.battery_animation,
			fill_elements: this.config.fill_elements,
			slim_design: this.config.slim_design,
			type: this.config.element_type,
			custom_type: this.config.custom_type,
			offset_icon: this.config.offset_icon || 0,
			offset_text: this.config.offset_text || 0,
			offset_value: this.config.offset_value || 0,
			offset_percent: this.config.offset_percent || 0,
			offset_remaining: this.config.offset_remaining || 0,
			opacity_icon: this.config.opacity_icon || 70,
			opacity_text: this.config.opacity_text || 70,
			opacity_value: this.config.opacity_value || 100,
			opacity_percent: this.config.opacity_percent || 100,
			opacity_remaining: this.config.opacity_remaining || 70,
			opacity_line: this.config.opacity_line || 70,
			element_distance: this.config.element_distance || 15,
			element_animation: this.config.element_animation,
			element_animation_time: this.config.element_animation_time || 5000,
			line_visible: this.config.line_visible,
			automatic_animation: automatic_animation,
			disable_icons: this.config.disable_icons,
			debounce_percent: this.config.debounce_percent,
			background_color: this.config.background_color || "transparent"
		}

		// Element - Style
		parameterObj.elements.style = {
			size: this.config.element_size || 2,
			circle_radius: this.config.circle_radius || 50,
			shadow: this.config.element_shadow,
			shadow_color: this.config.element_shadow_color,
			rect_height: this.config.rect_height,
			rect_width: this.config.rect_width,
			rect_corner: this.config.rect_corner
		}

		// Percent Shadow
		parameterObj.percent.style = {
			shadow: this.config.percent_shadow,
			shadow_color: this.config.percent_shadow_color,
		}

		// Values Shadow
		parameterObj.values.style = {
			shadow: this.config.values_shadow,
			shadow_color: this.config.values_shadow_color,
		}

		// Swap Texts
		parameterObj.swap_texts.labels = {
			solar: this.config.label_swap_production,
			solar0: this.config.label_swap_production0,
			solar1: this.config.label_swap_production1,
			grid: this.config.label_swap_grid,
			house: this.config.label_swap_consumption
		}

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

		// Build the Data JSON
		this.buildDataJSON();
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
				valuesObj['custom0'] = kwCalc["custom0"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom1) {
				valuesObj['custom1'] = kwCalc["custom1"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom2) {
				valuesObj['custom2'] = kwCalc["custom2"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom3) {
				valuesObj['custom3'] = kwCalc["custom3"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom4) {
				valuesObj['custom4'] = kwCalc["custom4"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom5) {
				valuesObj['custom5'] = kwCalc["custom5"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom6) {
				valuesObj['custom6'] = kwCalc["custom6"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom7) {
				valuesObj['custom7'] = kwCalc["custom7"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom8) {
				valuesObj['custom8'] = kwCalc["custom8"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom9) {
				valuesObj['custom9'] = kwCalc["custom9"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom10) {
				valuesObj['custom10'] = kwCalc["custom10"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == production) {
				valuesObj['production'] = kwCalc["production"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == production0) {
				valuesObj['production0'] = kwCalc["production0"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == production1) {
				valuesObj['production1'] = kwCalc["production1"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == consumption) {
				let consumption = kwCalc["consumption"] === true ? this.kwValue(state.val) : state.val;
				if (consumption_reverse) {
					consumption = consumption * (-1);
				}
				valuesObj['consumption'] = consumption;
			}
			if (id == grid_feed) {
				valuesObj['grid_feed'] = kwCalc["grid_feed"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == grid_consuming) {
				valuesObj['grid_consuming'] = kwCalc["grid_consuming"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == battery_percent) {
				valuesObj['battery_percent'] = (Math.round(state.val * 100) / 100).toFixed(fraction_battery);
			}
			if (id == battery_charge) {
				valuesObj['battery_charge'] = kwCalc["battery_charge"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == battery_discharge) {
				valuesObj['battery_discharge'] = kwCalc["battery_discharge"] === true ? this.kwValue(state.val) : state.val;
			}
			if (id == custom10_percent) {
				valuesObj['custom10_percent'] = state.val;
			}
			if (id == car_custom10_plugged) {
				valuesObj['car_custom10_plugged'] = state.val;
			}
			if (id == custom0_percent) {
				valuesObj['custom0_percent'] = state.val;
			}
			if (id == car_custom_plugged) {
				valuesObj['car_custom_plugged'] = state.val;
			}
			if (id == swap_consumption) {
				valuesObj['swap_consumption'] = state.val;
			}
			if (id == swap_production) {
				valuesObj['swap_production'] = state.val;
			}
			if (id == swap_production0) {
				valuesObj['swap_production0'] = state.val;
			}
			if (id == swap_production1) {
				valuesObj['swap_production1'] = state.val;
			}
			if (id == swap_grid) {
				valuesObj['swap_grid'] = state.val;
			}
			if (calculate_consumption) {
				let prodValue = Number(valuesObj['production']) > 0 ? Number(valuesObj['production']) : 0;
				if (valuesObj['production0'] != undefined) {
					prodValue += Number(valuesObj['production0']) > 0 ? Number(valuesObj['production0']) : 0;
				}
				if (valuesObj['production1'] != undefined) {
					prodValue += Number(valuesObj['production1']) > 0 ? Number(valuesObj['production1']) : 0;
				}


				let consumptionValue = 0;
				if (grid_all_positive) {
					consumptionValue = Number(valuesObj['grid_consuming']) + (prodValue - Number(valuesObj['grid_feed']));
				} else {
					if (grid_reverse) {
						consumptionValue = Number(valuesObj['grid_feed']) + prodValue;
					} else {
						consumptionValue = (Number(valuesObj['grid_feed']) * -1) + prodValue;
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
	kwValue(value) {
		return (value * 1000);
	}
	/**
	 * @param {number} value
	 */
	floorNumber(value) {
		return (Math.round(value * 100) / 100).toFixed(fraction);
	}

	/**
	 *  @param {number}	minutes
	 */
	getMinHours(minutes) {
		let mins = minutes;
		let m = mins % 60;
		let h = (mins - m) / 60;
		let HHMM = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString();
		return HHMM;
	}

	async migrateConfig() {
		const native = {};

		if (this.config?.car_charge) {
			native.custom10 = this.config.car_charge;
			native.car_charge = '';
			native.custom_icon10 = 'M18.92 2C18.72 1.42 18.16 1 17.5 1H6.5C5.84 1 5.29 1.42 5.08 2L3 8V16C3 16.55 3.45 17 4 17H5C5.55 17 6 16.55 6 16V15H18V16C18 16.55 18.45 17 19 17H20C20.55 17 21 16.55 21 16V8L18.92 2M6.85 3H17.14L18.22 6.11H5.77L6.85 3M19 13H5V8H19V13M7.5 9C8.33 9 9 9.67 9 10.5S8.33 12 7.5 12 6 11.33 6 10.5 6.67 9 7.5 9M16.5 9C17.33 9 18 9.67 18 10.5S17.33 12 16.5 12C15.67 12 15 11.33 15 10.5S15.67 9 16.5 9M7 20H11V18L17 21H13V23L7 20Z';
		}

		if (this.config?.car_percent) {
			native.car_custom10_percent = this.config.car_percent;
			native.car_percent = '';
		}

		if (this.config?.car_plugged) {
			native.car_custom10_plugged = this.config.car_plugged;
			native.car_plugged = '';
		}

		if (this.config?.color_car) {
			native.color_custom10 = this.config.color_car;
			native.color_car = '';
		}

		if (this.config?.color_car_text) {
			native.color_custom10_text = this.config.color_car_text;
			native.color_car_text = '';
		}

		if (this.config?.color_car_plugged) {
			native.color_car_custom10_plugged = this.config.color_car_plugged;
			native.color_car_plugged = '';
		}

		if (this.config?.fill_color_car) {
			native.fill_color_custom10 = this.config.fill_color_car;
			native.fill_color_car = '';
		}

		if (this.config?.color_house_to_car) {
			native.color_house_to_custom10 = this.config.color_house_to_car;
			native.color_house_to_car = '';
		}

		if (this.config?.color_car_percent) {
			native.color_car_custom10_percent = this.config.color_car_percent;
			native.color_car_percent = '';
		}

		if (this.config?.label_car) {
			native.label_custom10 = this.config.label_car;
			native.label_car = '';
		}

		if (this.config?.animation_color_house_to_car) {
			native.animation_color_house_to_custom10 = this.config.animation_color_house_to_car;
			native.animation_color_house_to_car = '';
		}

		if (Object.keys(native).length) {
			this.log.info('Migrate ' + Object.keys(native).length + ' value(s) from old Energiefluss Adapter version ...');
			await this.extendForeignObjectAsync('system.adapter.' + this.namespace, { native: native });

			return true;
		}

		return false;
	}

	/**
	 *  @param {number}	percent
	 *  @param {string}	direction
	 *  @param {number}	energy
	 */
	calculateBatteryRemaining(percent, direction, energy) {
		let rest = 0;
		let mins = 0;
		let result = "";
		let watts = recalculate ? energy * 1000 : energy;
		let string = this.config.label_battery_remaining;
		if (percent > 0 && energy > 0) {
			if (direction == "charge") {
				// Get the Rest to Full Charge
				rest = battery_capacity - ((battery_capacity * percent) / 100);
			}

			if (direction == "discharge") {
				// Get the Rest to Full Discharge
				rest = (battery_capacity * (percent - battery_dod)) / 100;
			}

			mins = Math.round((rest / watts) * 60);
			if (mins > 0) {
				result = this.getMinHours(mins);
			} else {
				result = "--:--";
			}
			string += ": " + result + "h";
		} else {
			string += ": --:--h";
		}
		return string;
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
				let tmpVal;
				if (typeof (stateValue.val) === 'number') {
					if (!key.includes("percent")) {
						tmpVal = kwCalc[key] === true ? this.kwValue(stateValue.val) : Number(stateValue.val);
						tmpObj[key] = recalculate ? this.recalculateValue(tmpVal) : this.floorNumber(tmpVal);
					} else {
						tmpObj[key] = Number(stateValue.val);
					}
				}
				if (typeof (stateValue.val) === 'string') {
					if (!key.includes("percent")) {
						tmpVal = kwCalc[key] === true ? this.kwValue(Number(stateValue.val)) : Number(stateValue.val);
						tmpObj[key] = recalculate ? this.recalculateValue(tmpVal) : this.floorNumber(tmpVal);
					} else {
						tmpObj[key] = Number(stateValue.val);
					}
				}
			} else {
				this.log.warn("The adapter could not find the state " + value + "! Please review your configuration of the adapter!");
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
			solar: false,
			solar0: false,
			solar1: false,
			grid: false,
			battery: false,
			custom0: false,
			custom1: false,
			custom2: false,
			custom3: false,
			custom4: false,
			custom5: false,
			custom6: false,
			custom7: false,
			custom8: false,
			custom9: false,
			custom10: false
		};

		// Texts
		let textObj = {
			consumption_text: false,
			production_text: false,
			production0_text: false,
			production1_text: false,
			grid_text: false,
			battery_text: false,
			battery_remaining_text: false,
			custom0_text: false,
			custom1_text: false,
			custom2_text: false,
			custom3_text: false,
			custom4_text: false,
			custom5_text: false,
			custom6_text: false,
			custom7_text: false,
			custom8_text: false,
			custom9_text: false,
			custom10_text: false
		};

		// Values
		let valueObj = {
			consumption_value: false,
			production_value: false,
			production0_value: false,
			production1_value: false,
			grid_value: false,
			custom0_percent: false,
			custom10_percent: false,
			battery_value: false,
			battery_percent: false,
			custom0_value: false,
			custom1_value: false,
			custom2_value: false,
			custom3_value: false,
			custom4_value: false,
			custom5_value: false,
			custom6_value: false,
			custom7_value: false,
			custom8_value: false,
			custom9_value: false,
			custom10_value: false,
		};

		// Icons
		let iconObj = {
			house: false,
			production: false,
			production0: false,
			production1: false,
			grid: false,
			battery: false,
			custom0: false,
			custom1: false,
			custom2: false,
			custom3: false,
			custom4: false,
			custom5: false,
			custom6: false,
			custom7: false,
			custom8: false,
			custom9: false,
			custom10: false
		};

		// Lines
		let linesObj = {
			battery_to_house: false,
			grid_to_house: false,
			grid_to_battery: false,
			house_to_custom0: false,
			house_to_custom1: false,
			house_to_custom2: false,
			house_to_custom3: false,
			house_to_custom4: false,
			house_to_custom5: false,
			house_to_custom6: false,
			house_to_custom7: false,
			house_to_custom8: false,
			house_to_custom9: false,
			house_to_custom10: false,
			solar_to_battery: false,
			solar_to_grid: false,
			solar_to_house: false,
			solar0_to_solar: false,
			solar1_to_solar: false,
			custom4_to_house: false,
			custom9_to_house: false,
			solar0_to_solar1: false
		};

		// Change parameter if no battery is present
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
			elementsObj.solar = true;
			textObj.production_text = true;
			valueObj.production_value = true;
			iconObj.production = true;
		}

		// Production - Additional
		if (valuesObj['production0'] != undefined) {
			elementsObj.solar0 = true;
			textObj.production0_text = true;
			valueObj.production0_value = true;
			iconObj.production0 = true;
		}

		// Production - Additional
		if (valuesObj['production1'] != undefined) {
			elementsObj.solar1 = true;
			textObj.production1_text = true;
			valueObj.production1_value = true;
			iconObj.production1 = true;
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
			if (battery_info === true && battery_capacity > 0) {
				textObj.battery_remaining_text = true;
			}
		}

		// Custom Circle - 10
		if (valuesObj['custom10'] != undefined) {
			elementsObj.custom10 = true;
			textObj.custom10_text = true;
			valueObj.custom10_value = true;
			iconObj.custom10 = true;
			if (custom10_type == 'car') {
				if (valuesObj['custom10_percent'] != undefined) {
					valueObj.custom10_percent = true;
				}
			}
		}

		// Custom Circle - 0
		if (valuesObj['custom0'] != undefined) {
			elementsObj.custom0 = true;
			textObj.custom0_text = true;
			valueObj.custom0_value = true;
			iconObj.custom0 = true;
			if (custom_type == 'car') {
				if (valuesObj['custom0_percent'] != undefined) {
					valueObj.custom0_percent = true;
				}
			}
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

		// Custom Circle - 4
		if (valuesObj['custom4'] != undefined) {
			elementsObj.custom4 = true;
			textObj.custom4_text = true;
			valueObj.custom4_value = true;
			iconObj.custom4 = true;
		}

		// Custom Circle - 5
		if (valuesObj['custom5'] != undefined) {
			elementsObj.custom5 = true;
			textObj.custom5_text = true;
			valueObj.custom5_value = true;
			iconObj.custom5 = true;
		}

		// Custom Circle - 6
		if (valuesObj['custom6'] != undefined) {
			elementsObj.custom6 = true;
			textObj.custom6_text = true;
			valueObj.custom6_value = true;
			iconObj.custom6 = true;
		}

		// Custom Circle - 7
		if (valuesObj['custom7'] != undefined) {
			elementsObj.custom7 = true;
			textObj.custom7_text = true;
			valueObj.custom7_value = true;
			iconObj.custom7 = true;
		}

		// Custom Circle - 8
		if (valuesObj['custom8'] != undefined) {
			elementsObj.custom8 = true;
			textObj.custom8_text = true;
			valueObj.custom8_value = true;
			iconObj.custom8 = true;
		}

		// Custom Circle - 9
		if (valuesObj['custom9'] != undefined) {
			elementsObj.custom9 = true;
			textObj.custom9_text = true;
			valueObj.custom9_value = true;
			iconObj.custom9 = true;
		}

		/* Build all lines */
		if (valuesObj['production'] != undefined && valuesObj['consumption'] != undefined) {
			linesObj.solar_to_house = true;
		}
		if (valuesObj['consumption'] != undefined && (valuesObj['grid_feed'] != undefined || valuesObj['grid_consuming'] != undefined)) {
			linesObj.grid_to_house = true;
		}
		if (valuesObj['production'] != undefined && (valuesObj['grid_feed'] != undefined || valuesObj['grid_consuming'] != undefined) && no_feed_in == false) {
			linesObj.solar_to_grid = true;
		}
		if (valuesObj['production'] != undefined && valuesObj['production0'] != undefined) {
			linesObj.solar0_to_solar = true;
		}
		if (valuesObj['production'] != undefined && valuesObj['production1'] != undefined) {
			linesObj.solar1_to_solar = true;
		}
		/* If we have all solar-lines active, we need to change the order */
		if (valuesObj['production'] != undefined && valuesObj['production0'] != undefined && valuesObj['production1'] != undefined) {
			linesObj.solar1_to_solar = true;
			linesObj.solar0_to_solar1 = true;
			linesObj.solar0_to_solar = false;
		}

		if (valuesObj['production1'] != undefined) {
			parameterObj.general.slim_design = false;
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
		if ((valuesObj['consumption'] != undefined && valuesObj['custom4'] != undefined)) {
			if (custom4_type == 'balcony') {
				linesObj.custom4_to_house = true;
			} else {
				linesObj.house_to_custom4 = true;
			}
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom5'] != undefined)) {
			linesObj.house_to_custom5 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom6'] != undefined)) {
			linesObj.house_to_custom6 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom7'] != undefined)) {
			linesObj.house_to_custom7 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom8'] != undefined)) {
			linesObj.house_to_custom8 = true;
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom9'] != undefined)) {
			if (custom9_type == 'balcony') {
				linesObj.custom9_to_house = true;
			} else {
				linesObj.house_to_custom9 = true;
			}
		}
		if ((valuesObj['consumption'] != undefined && valuesObj['custom10'] != undefined)) {
			linesObj.house_to_custom10 = true;
		}

		// Build the Parameters to be read inside Javascript on Webpage - called once
		parameterObj.elements.elements = elementsObj;
		parameterObj.icons.icons = iconObj;
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

		// Swap Values for Elements
		let swap_values = {};
		if (valuesObj['swap_consumption'] != undefined) {
			swap_values.consumption_value = recalculate ? this.recalculateValue(valuesObj['swap_consumption']) : this.floorNumber(valuesObj['swap_consumption']);
		}
		if (valuesObj['swap_production'] != undefined) {
			swap_values.production_value = recalculate ? this.recalculateValue(valuesObj['swap_production']) : this.floorNumber(valuesObj['swap_production']);
		}
		if (valuesObj['swap_production0'] != undefined) {
			swap_values.production0_value = recalculate ? this.recalculateValue(valuesObj['swap_production0']) : this.floorNumber(valuesObj['swap_production0']);
		}
		if (valuesObj['swap_production1'] != undefined) {
			swap_values.production1_value = recalculate ? this.recalculateValue(valuesObj['swap_production1']) : this.floorNumber(valuesObj['swap_production1']);
		}
		if (valuesObj['swap_grid'] != undefined) {
			swap_values.grid_value = recalculate ? this.recalculateValue(valuesObj['swap_grid']) : this.floorNumber(valuesObj['swap_grid']);
		}

		// Production correction
		let p = (valuesObj['production'] === undefined) ? 0 : valuesObj['production'];
		let p0 = (valuesObj['production0'] === undefined) ? 0 : valuesObj['production0'];
		let p1 = (valuesObj['production1'] === undefined) ? 0 : valuesObj['production1'];
		let p_all = Number(p + p0 + p1);

		let values = {
			car_custom10_plugged: false,
			car_custom_plugged: false
		};

		// Colors of the values
		let color = {
			consumption_value: this.config.color_house_text,
			grid_value: this.config.color_grid_text,
			production_value: this.config.color_production_text,
			production0_value: this.config.color_production0_text,
			production1_value: this.config.color_production1_text,
			battery_value: this.config.color_battery_text,
			battery_remaining: this.config.color_battery_text,
			battery_percent: this.config.color_battery_percent,
			custom0_value: this.config.color_custom0_text,
			custom1_value: this.config.color_custom1_text,
			custom2_value: this.config.color_custom2_text,
			custom3_value: this.config.color_custom3_text,
			custom4_value: this.config.color_custom4_text,
			custom5_value: this.config.color_custom5_text,
			custom6_value: this.config.color_custom6_text,
			custom7_value: this.config.color_custom7_text,
			custom8_value: this.config.color_custom8_text,
			custom9_value: this.config.color_custom9_text,
			custom10_value: this.config.color_custom10_text,
			custom0_percent: this.config.color_car_custom_percent,
			car_custom_plugged: this.config.color_car_custom_plugged,
			custom10_percent: this.config.color_car_custom10_percent,
			car_custom10_plugged: this.config.color_car_custom10_plugged,
			swap_consumption_value: this.config.swap_color_house_text,
			swap_grid_value: this.config.swap_color_grid_text,
			swap_production_value: this.config.swap_color_production_text,
			swap_production0_value: this.config.swap_color_production0_text,
			swap_production1_value: this.config.swap_color_production1_text
		}

		// Line-Animation
		let line_animation = {
			solar_to_house: false,
			grid_to_house: false,
			solar_to_grid: false,
			grid_to_battery: false,
			solar_to_battery: false,
			solar0_to_solar: false,
			solar1_to_solar: false,
			solar0_to_solar1: false,
			battery_to_house: false,
			house_to_custom0: false,
			house_to_custom1: false,
			house_to_custom2: false,
			house_to_custom3: false,
			house_to_custom4: false,
			house_to_custom5: false,
			house_to_custom6: false,
			house_to_custom7: false,
			house_to_custom8: false,
			house_to_custom9: false,
			house_to_custom10: false,
			custom4_to_house: false,
			custom9_to_house: false
		};

		// Automatic Animation
		let auto_animation = [];
		let auto_animation_output = [];

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
			if (valuesObj['consumption'] > threshold && (valuesObj['production'] > threshold || valuesObj['production0'] > threshold || valuesObj['production1'] > threshold)) {
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

		// Production - Additional
		if (valuesObj['production0'] != undefined) {
			if (valuesObj['production0'] > threshold) {
				line_animation.solar0_to_solar = true;
			}

			if (valuesObj['production0'] > threshold) {
				color.production0_value = this.config.color_production0_text;
				values.production0_value = recalculate ? this.recalculateValue(valuesObj['production0']) : this.floorNumber(valuesObj['production0']);
			} else {
				color.production0_value = this.config.color_production0_text_no_prod ? this.config.color_production0_text_no_prod : this.config.color_production0_text;
				values.production0_value = this.floorNumber(0);
			}
		}

		// Production - Additional 1
		if (valuesObj['production1'] != undefined) {
			if (valuesObj['production1'] > threshold) {
				line_animation.solar1_to_solar = true;
			}

			if (valuesObj['production1'] > threshold) {
				color.production1_value = this.config.color_production1_text;
				values.production1_value = recalculate ? this.recalculateValue(valuesObj['production1']) : this.floorNumber(valuesObj['production1']);
			} else {
				color.production1_value = this.config.color_production1_text_no_prod ? this.config.color_production1_text_no_prod : this.config.color_production1_text;
				values.production1_value = this.floorNumber(0);
			}
		}

		/* If we have all solar-lines active, we need to change the animation order */
		if (valuesObj['production'] != undefined && valuesObj['production0'] != undefined && valuesObj['production1'] != undefined) {
			line_animation.solar1_to_solar = valuesObj['production1'] > threshold ? true : false;
			line_animation.solar0_to_solar1 = valuesObj['production0'] > threshold ? true : false;
			line_animation.solar0_to_solar = false;
		}

		// Grid
		if (valuesObj['grid_feed'] != undefined && grid_different === false) {
			let gridValue = valuesObj['grid_feed'];
			if (grid_reverse) {
				if (gridValue > threshold) {
					line_animation.grid_to_house = true;
				}
				if (gridValue < (threshold * -1)) {
					// Check, if we have production
					if ((valuesObj['production'] > 0 || valuesObj['production0'] > 0 || valuesObj['production1'] > 0) && no_feed_in == false) {
						// Display as positive
						gridValue = gridValue * -1;
						line_animation.solar_to_grid = true;
					} else {
						gridValue = 0;
					}
				}
			} else {
				if (gridValue > threshold) {
					// Check, if we have production
					if ((valuesObj['production'] > 0 || valuesObj['production0'] > 0 || valuesObj['production1'] > 0) && no_feed_in == false) {
						line_animation.solar_to_grid = true;
					} else {
						gridValue = 0;
					}
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

			if (gridConsumeValue > threshold && gridFeedValue == 0) {
				line_animation.grid_to_house = true;
				gridValue = gridConsumeValue;
			}

			if (gridFeedValue > threshold && gridConsumeValue == 0) {
				// Check, if we have production
				if ((valuesObj['production'] > 0 || valuesObj['production0'] > 0 || valuesObj['production1'] > 0) && no_feed_in == false) {
					line_animation.solar_to_grid = true;
					gridValue = gridFeedValue;
				} else {
					gridValue = 0;
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

		// Correction for negative sign for feed-in
		if (line_animation.solar_to_grid === true) {
			// If displaying as negative
			if (neg_feed_in === true) {
				values.grid_value = values.grid_value * -1;
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
					dataObj.battery_animation.direction = 'charge';
					if (batteryValue > p_all) {
						line_animation.grid_to_battery = true;
					} else {
						line_animation.solar_to_battery = true;
					}
				}
			} else {
				if (batteryValue > threshold) {
					dataObj.battery_animation.direction = 'charge';
					if (batteryValue > p_all) {
						line_animation.grid_to_battery = true;
					} else {
						line_animation.solar_to_battery = true;
					}
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

		// User has defined to use different States for charging and discharging the battery
		if (battery_different === true) {
			let batteryChargeValue = valuesObj['battery_charge'];
			let batteryDischargeValue = valuesObj['battery_discharge'];
			let batteryValue = 0;

			if (batteryChargeValue > threshold && batteryDischargeValue == 0) {
				batteryValue = batteryChargeValue;
				dataObj.battery_animation.direction = 'charge';
				if (batteryValue > p_all) {
					line_animation.grid_to_battery = true;
				} else {
					line_animation.solar_to_battery = true;
				}
			}

			if (batteryDischargeValue > threshold && batteryChargeValue == 0) {
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
			if (battery_info === true) {
				values.battery_remaining_text = this.calculateBatteryRemaining(values.battery_percent, dataObj.battery_animation.direction, parseFloat(values.battery_value));
				// Set Battery Remaining into own object
				await this.setStateAsync("battery_remaining", values.battery_remaining_text, true);
			}
		}

		// Custom Circle - 10
		if (valuesObj['custom10'] != undefined) {
			if (valuesObj['custom10'] > threshold) {
				line_animation.house_to_custom10 = true;
				color.custom10_value = this.config.color_custom10_text;
				values.custom10_value = recalculate ? this.recalculateValue(valuesObj['custom10']) : this.floorNumber(valuesObj['custom10']);
				auto_animation.push({ name: "house_to_custom10", value: values.custom10_value });
			} else {
				if (custom10_type == 'car') {
					color.custom10_value = this.config.color_custom10_text;
				} else {
					color.custom10_value = this.config.color_custom10_text_no_prod ? this.config.color_custom10_text_no_prod : this.config.color_custom10_text;
				}
				values.custom10_value = this.floorNumber(0);
			}

			if (custom10_type == 'car') {
				if (valuesObj['custom10_percent'] != undefined) {
					values.custom10_percent = valuesObj['custom10_percent'];
				}
				if (valuesObj['custom10'] > threshold || valuesObj['car_custom10_plugged']) {
					values.car_custom10_plugged = true;
				}
			}
		}

		// Custom Circle - 0
		if (valuesObj['custom0'] != undefined) {
			if (valuesObj['custom0'] > threshold) {
				line_animation.house_to_custom0 = true;
				color.custom0_value = this.config.color_custom0_text;
				values.custom0_value = recalculate ? this.recalculateValue(valuesObj['custom0']) : this.floorNumber(valuesObj['custom0']);
				auto_animation.push({ name: "house_to_custom0", value: values.custom0_value });
			} else {
				if (custom_type == 'car') {
					color.custom0_value = this.config.color_custom0_text;
				} else {
					color.custom0_value = this.config.color_custom0_text_no_prod ? this.config.color_custom0_text_no_prod : this.config.color_custom0_text;
				}
				values.custom0_value = this.floorNumber(0);
			}

			if (custom_type == 'car') {
				if (valuesObj['custom0_percent'] != undefined) {
					values.custom0_percent = valuesObj['custom0_percent'];
				}
				if (valuesObj['custom0'] > threshold || valuesObj['car_custom_plugged']) {
					values.car_custom_plugged = true;
				}
			}
		}

		// Custom Circle - 1
		if (valuesObj['custom1'] != undefined) {
			if (valuesObj['custom1'] > threshold) {
				line_animation.house_to_custom1 = true;
				color.custom1_value = this.config.color_custom1_text;
				values.custom1_value = recalculate ? this.recalculateValue(valuesObj['custom1']) : this.floorNumber(valuesObj['custom1']);
				auto_animation.push({ name: "house_to_custom1", value: values.custom1_value });
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
				auto_animation.push({ name: "house_to_custom2", value: values.custom2_value });
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
				auto_animation.push({ name: "house_to_custom3", value: values.custom3_value });
			} else {
				color.custom3_value = this.config.color_custom3_text_no_prod ? this.config.color_custom3_text_no_prod : this.config.color_custom3_text;
				values.custom3_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 4
		if (valuesObj['custom4'] != undefined) {
			if (valuesObj['custom4'] > threshold) {
				if (custom4_type == 'balcony') {
					line_animation.custom4_to_house = true;
				} else {
					line_animation.house_to_custom4 = true;
				}
				color.custom4_value = this.config.color_custom4_text;
				values.custom4_value = recalculate ? this.recalculateValue(valuesObj['custom4']) : this.floorNumber(valuesObj['custom4']);
				if (custom4_type == 'consumer') {
					auto_animation.push({ name: "house_to_custom4", value: values.custom4_value });
				}
			} else {
				color.custom4_value = this.config.color_custom4_text_no_prod ? this.config.color_custom4_text_no_prod : this.config.color_custom4_text;
				values.custom4_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 5
		if (valuesObj['custom5'] != undefined) {
			if (valuesObj['custom5'] > threshold) {
				line_animation.house_to_custom5 = true;
				color.custom5_value = this.config.color_custom5_text;
				values.custom5_value = recalculate ? this.recalculateValue(valuesObj['custom5']) : this.floorNumber(valuesObj['custom5']);
				auto_animation.push({ name: "house_to_custom5", value: values.custom5_value });
			} else {
				color.custom5_value = this.config.color_custom5_text_no_prod ? this.config.color_custom5_text_no_prod : this.config.color_custom5_text;
				values.custom5_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 6
		if (valuesObj['custom6'] != undefined) {
			if (valuesObj['custom6'] > threshold) {
				line_animation.house_to_custom6 = true;
				color.custom6_value = this.config.color_custom6_text;
				values.custom6_value = recalculate ? this.recalculateValue(valuesObj['custom6']) : this.floorNumber(valuesObj['custom6']);
				auto_animation.push({ name: "house_to_custom6", value: values.custom6_value });
			} else {
				color.custom6_value = this.config.color_custom6_text_no_prod ? this.config.color_custom6_text_no_prod : this.config.color_custom6_text;
				values.custom6_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 7
		if (valuesObj['custom7'] != undefined) {
			if (valuesObj['custom7'] > threshold) {
				line_animation.house_to_custom7 = true;
				color.custom7_value = this.config.color_custom7_text;
				values.custom7_value = recalculate ? this.recalculateValue(valuesObj['custom7']) : this.floorNumber(valuesObj['custom7']);
				auto_animation.push({ name: "house_to_custom7", value: values.custom7_value });
			} else {
				color.custom7_value = this.config.color_custom7_text_no_prod ? this.config.color_custom7_text_no_prod : this.config.color_custom7_text;
				values.custom7_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 8
		if (valuesObj['custom8'] != undefined) {
			if (valuesObj['custom8'] > threshold) {
				line_animation.house_to_custom8 = true;
				color.custom8_value = this.config.color_custom8_text;
				values.custom8_value = recalculate ? this.recalculateValue(valuesObj['custom8']) : this.floorNumber(valuesObj['custom8']);
				auto_animation.push({ name: "house_to_custom8", value: values.custom8_value });
			} else {
				color.custom8_value = this.config.color_custom8_text_no_prod ? this.config.color_custom8_text_no_prod : this.config.color_custom8_text;
				values.custom8_value = this.floorNumber(0);
			}
		}

		// Custom Circle - 9
		if (valuesObj['custom9'] != undefined) {
			if (valuesObj['custom9'] > threshold) {
				if (custom9_type == 'balcony') {
					line_animation.custom9_to_house = true;
				} else {
					line_animation.house_to_custom9 = true;
				}
				color.custom9_value = this.config.color_custom9_text;
				values.custom9_value = recalculate ? this.recalculateValue(valuesObj['custom9']) : this.floorNumber(valuesObj['custom9']);
				if (custom9_type == 'consumer') {
					auto_animation.push({ name: "house_to_custom9", value: values.custom9_value });
				}
			} else {
				color.custom9_value = this.config.color_custom9_text_no_prod ? this.config.color_custom9_text_no_prod : this.config.color_custom9_text;
				values.custom9_value = this.floorNumber(0);
			}
		}

		// Sort Animation
		if (automatic_animation) {
			// First, get the Consumption
			let tmpConsumption = parseFloat(values.consumption_value);

			// LineSpeed
			let tmpSpeed = parameterObj.lines.style.animation_duration;

			auto_animation.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

			//let step = tmpSpeed / tmpConsumption;
			for (let animation of auto_animation) {
				auto_animation_output.push({
					name: animation.name,
					/*
					Old Calculation - for reference
					duration: Math.round(tmpSpeed + (tmpSpeed - (step * animation.value)))
					*/
					duration: Math.round((tmpConsumption / animation.value) * tmpSpeed)
				});
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

		// House netto - Reduce consumption about the configured custom elements and the car
		if (Object.keys(house_netto).length > 0) {
			let tmpValue = parseFloat(values.consumption_value);
			let tmpResult = tmpValue;

			for (var key of Object.keys(house_netto)) {
				const value = house_netto[key];
				if (value === true) {
					tmpResult -= parseFloat(values[key + "_value"]) || 0;
				}
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
		dataObj.swap_values = swap_values;
		dataObj.color = color;
		dataObj.automatic_animation = auto_animation_output;

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