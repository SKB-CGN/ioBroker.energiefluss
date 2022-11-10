// config
var loaded = false;
var states = [];
let config;
let data;

// Default Icon for Custom if no icon defined in settings
let default_icon = "M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z";

let elements = {
    cx: {
        "house": 472,
        "grid": 262,
        "production": 262,
        "car": 472,
        "battery": 52,
        "custom0": 472,
        "custom1": 682,
        "custom2": 682,
        "custom3": 682,
        "custom4": 367,
        "custom5": 577,
        "custom6": 682,
        "custom7": 682,
        "custom8": 577,
        "custom9": 367
    },
    cy: {
        "house": 262,
        "grid": 472,
        "production": 52,
        "car": 472,
        "battery": 262,
        "custom0": 52,
        "custom1": 52,
        "custom2": 262,
        "custom3": 472,
        "custom4": 52,
        "custom5": 52,
        "custom6": 157,
        "custom7": 367,
        "custom8": 472,
        "custom9": 472
    },
    value: {
        "house": "consumption_value",
        "production": "production_value",
        "grid": "grid_value",
        "car": "car_value",
        "battery": "battery_value",
        "custom0": "custom0_value",
        "custom1": "custom1_value",
        "custom2": "custom2_value",
        "custom3": "custom3_value",
        "custom4": "custom4_value",
        "custom5": "custom5_value",
        "custom6": "custom6_value",
        "custom7": "custom7_value",
        "custom8": "custom8_value",
        "custom9": "custom9_value"
    },
    text: {
        "house": "consumption_text",
        "production": "production_text",
        "grid": "grid_text",
        "car": "car_text",
        "battery": "battery_text",
        "custom0": "custom0_text",
        "custom1": "custom1_text",
        "custom2": "custom2_text",
        "custom3": "custom3_text",
        "custom4": "custom4_text",
        "custom5": "custom5_text",
        "custom6": "custom6_text",
        "custom7": "custom7_text",
        "custom8": "custom8_text",
        "custom9": "custom9_text"
    },
    icon_id: {
        "house": "icon_house",
        "production": "icon_production",
        "grid": "icon_grid",
        "car": "icon_car",
        "battery": "icon_battery",
        "custom0": "icon_custom0",
        "custom1": "icon_custom1",
        "custom2": "icon_custom2",
        "custom3": "icon_custom3",
        "custom4": "icon_custom4",
        "custom5": "icon_custom5",
        "custom6": "icon_custom6",
        "custom7": "icon_custom7",
        "custom8": "icon_custom8",
        "custom9": "icon_custom9"
    },
    icon_d: {
        "house": "M0,21V10L7.5,5L15,10V21H10V14H5V21H0M24,2V21H17V8.93L16,8.27V6H14V6.93L10,4.27V2H24M21,14H19V16H21V14M21,10H19V12H21V10M21,6H19V8H21V6Z",
        "production": "M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z",
        "grid": "M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z",
        "car": "M18.92 2C18.72 1.42 18.16 1 17.5 1H6.5C5.84 1 5.29 1.42 5.08 2L3 8V16C3 16.55 3.45 17 4 17H5C5.55 17 6 16.55 6 16V15H18V16C18 16.55 18.45 17 19 17H20C20.55 17 21 16.55 21 16V8L18.92 2M6.85 3H17.14L18.22 6.11H5.77L6.85 3M19 13H5V8H19V13M7.5 9C8.33 9 9 9.67 9 10.5S8.33 12 7.5 12 6 11.33 6 10.5 6.67 9 7.5 9M16.5 9C17.33 9 18 9.67 18 10.5S17.33 12 16.5 12C15.67 12 15 11.33 15 10.5S15.67 9 16.5 9M7 20H11V18L17 21H13V23L7 20Z",
        "battery": "none",
        "custom0": default_icon,
        "custom1": default_icon,
        "custom2": default_icon,
        "custom3": default_icon,
        "custom4": default_icon,
        "custom5": default_icon,
        "custom6": default_icon,
        "custom7": default_icon,
        "custom8": default_icon,
        "custom9": default_icon
    }
}

function downloadFont(name, url) {
    if (url != "") {
        var add_font = new FontFace(name, 'url(' + url + ')');
        add_font.load().then(function (loaded_font) {
            document.fonts.add(loaded_font);
            document.body.style.fontFamily = name;
        }).catch(function (error) {
            console.log('Error while downloading the font! ' + error);
        });
    }
}

function batteryDisplay(value) {
    // Decide, which Class to add
    let elm;
    if (value < 25) {
        elm = "empty";
    }
    if (value >= 25) {
        elm = "low";
    }
    if (value >= 50) {
        elm = "medium";
    }
    if (value >= 75) {
        elm = "high";
    }
    // Display correct battery & remove all other classes
    $("#icon_battery").removeClass().addClass("icon_color battery_" + elm);
}

function batteryAnimation(direction) {
    // Decide, which class to add
    let elm;
    if (direction != 'none') {
        if (direction == 'charge') {
            elm = 'battery_empty battery_charge';
        }
        if (direction == 'discharge') {
            elm = 'battery_high battery_discharge';
        }
    }

    $("#icon_battery").removeClass().addClass("icon_color " + elm);
}

function initConfig() {
    try {
        // First remove all things
        $(".placeholders").empty();

        // General
        Object.entries(config.general).forEach(entry => {
            const [key, value] = entry;
            switch (key) {
                case 'no_battery':
                    if (value === true) {
                        $('#svg_image').addClass("no_battery");
                    }
                    break;
            }
        });

        // Load CSS into style Elements
        $("#style_element").empty().append('.shadow { -webkit-filter: drop-shadow(0px 3px 3px ' + config.elements.style.shadow_color + '); filter: drop-shadow(0px 3px 3px ' + config.elements.style.shadow_color + ');}')
            .append('.icon_color, .line, .text { opacity: ' + config.general.opacity + '%;}');;

        // Animation
        $("#style_animation").empty()
            .append('.animation { animation-duration:' + config.lines.style.animation_duration + 'ms; stroke-dasharray: ' + config.lines.style.animation + '; stroke-linecap: ' + config.lines.style.animation_linecap + '; stroke-width:' + config.lines.style.animation_width + 'px; }')
            .append('.line { stroke-width:' + config.lines.style.line_size + 'px; }');

        // Fonts
        downloadFont(config.fonts.font, config.fonts.font_src);
        $("#style_fonts").empty()
            .append('body { font-family:' + config.fonts.font + '}')
            .append('.value {font-size:' + config.fonts.font_size_value + 'px;}')
            .append('.text {font-size:' + config.fonts.font_size_label + 'px; fill:' + config.texts.color.default + ';}')
            .append('.percent {font-size:' + config.fonts.font_size_percent + 'px;}')
            .append('.unit {font-size:' + config.fonts.font_size_unit + 'px;}')
            .append('.unit_percent {font-size:' + config.fonts.font_size_unit_percent + 'px;}')
            .append('#battery_remaining_text {font-size:' + config.fonts.font_size_remaining + 'px; fill: ' + config.texts.color.battery_remaining + '}');


        // Elements
        Object.entries(config.elements.elements).forEach(entry => {
            const [key, value] = entry;
            if (value === true) {
                let c;
                // Circle
                if (config.general.type == "circle") {
                    c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    c.setAttribute('cx', elements.cx[key]);
                    c.setAttribute('cy', elements.cy[key]);
                    c.setAttribute('r', config.elements.style.circle_radius);
                }

                // Rectangle
                if (config.general.type == "rect") {
                    c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    c.setAttribute('x', (elements.cx[key] - (config.elements.style.rect_width / 2)).toString());
                    c.setAttribute('y', (elements.cy[key] - (config.elements.style.rect_height / 2)).toString());
                    c.setAttribute('width', config.elements.style.rect_width);
                    c.setAttribute('height', config.elements.style.rect_height);
                    c.setAttribute('rx', config.elements.style.rect_corner);
                }
                // Shadow Style Class
                c.setAttribute('id', key);
                let style_class = 'all_elm';
                if (config.elements.style.shadow === true) {
                    style_class += " shadow";
                }

                c.setAttribute('class', style_class);
                // Apply config Variables
                let stroke = config.elements.color[key];
                let fill = config.elements.fill[key] ? config.elements.fill[key] : 'white';
                c.setAttribute('style', ' fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + config.elements.style.size + 'px;');
                $(c).appendTo("#placeholder_elements");

                // Create the Value Text Elements
                // Value Elements
                let v = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                v.setAttribute('class', 'value');
                v.setAttribute('x', elements.cx[key]);
                v.setAttribute('y', (elements.cy[key] - 8) + config.general.offset_value);
                v.setAttribute('dominant-baseline', 'central');
                v.innerHTML = '<tspan class="value" id=' + elements.value[key] + '></tspan><tspan class="unit">' + config.general.unit + '</tspan>';
                $(v).appendTo("#placeholder_values");

                // Icons
                if (elements.icon_d[key] != null) {
                    let i = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    let icon_source;
                    i.setAttribute('id', elements.icon_id[key]);
                    if (config.custom_symbol.hasOwnProperty("icon_" + key)) {
                        if (config.custom_symbol["icon_" + key].length != 0) {
                            icon_source = config.custom_symbol["icon_" + key];
                        } else {
                            icon_source = elements.icon_d[key];
                        }
                    } else {
                        icon_source = elements.icon_d[key];
                    }
                    i.setAttribute('d', icon_source);
                    i.setAttribute('class', 'icon_color');
                    i.setAttribute('style', ' fill: ' + config.icons.color.default + ';');
                    i.setAttribute('transform', 'translate(' + (elements.cx[key] - 12) + ',' + ((elements.cy[key] - 44) + config.general.offset_icon) + ')');
                    $(i).appendTo("#placeholder_icons");
                }

                // Check, if we are displaying the battery circle
                if (key == "battery") {
                    // Additional Text for Battery remaining
                    let rem_text = elements.cy[key] + (config.general.type == 'rect' ? (config.elements.style.rect_height - 20) : (config.elements.style.circle_radius + 20)) + config.general.offset_remaining;
                    let bt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    bt.setAttribute('id', 'battery_remaining_text');
                    bt.setAttribute('class', 'text');
                    bt.setAttribute('x', elements.cx[key]);
                    bt.setAttribute('y', rem_text);
                    $(bt).appendTo("#placeholder_texts");
                }

                // Texts
                // Text Elements
                let t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                t.setAttribute('id', elements.text[key]);
                t.setAttribute('class', 'text');
                t.setAttribute('x', elements.cx[key]);
                t.setAttribute('y', (elements.cy[key] + 28) + config.general.offset_text);
                t.innerHTML = config.texts.labels[key];
                t.setAttribute('dominant-baseline', 'central');
                $(t).appendTo("#placeholder_texts");

                // Percent
                // Check, if we have a corresponding percent for each element
                if (config.values.values[key + "_percent"] === true) {
                    let p = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    p.setAttribute('class', 'percent');
                    p.setAttribute('x', elements.cx[key]);
                    p.setAttribute('y', (elements.cy[key] + 12) + config.general.offset_percent);
                    p.setAttribute('dominant-baseline', 'central');
                    p.innerHTML = '<tspan class="value" id="' + key + '_percent"></tspan><tspan class="unit_percent">%</tspan>';
                    $(p).appendTo("#placeholder_percents");
                }
            }
        });

        // Lines and Animations
        Object.entries(config.lines.lines).forEach(entry => {
            const [key, value] = entry;
            if (value === true) {
                // Line
                let l = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                l.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
                l.setAttribute('class', 'line');
                l.setAttribute('id', 'line_' + key);
                let stroke_line = config.lines.color[key] ? config.lines.color[key] : config.lines.color.default;
                l.setAttribute('style', 'stroke: ' + stroke_line + ';');
                $(l).appendTo('#placeholder_lines');

                // Animation
                let a = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                a.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + key);
                a.setAttribute('class', 'animation anim_element');
                a.setAttribute('id', 'anim_' + key);
                let stroke_anim = config.lines.animation_colors[key] ? config.lines.animation_colors[key] : config.lines.animation_colors.default;
                a.setAttribute('style', 'stroke: ' + stroke_anim + ';');
                $(a).appendTo('#placeholder_animations');
            }
        });

        let date = new Date().toLocaleString();
        console.log('Config successfully applied at ' + date + '!');

    } catch (error) {
        console.log('Error while updating the Config! ' + error);
    }
}

function updateValues() {
    /* Update the Values */
    try {
        Object.entries(data.values).forEach(entry => {
            const [key, value] = entry;
            if (key == "car_plugged") {
                $('#icon_car').css("fill", value ? data.color.car_plugged : config.icons.color.default);
            }
            if (key == "car_custom_plugged") {
                $('#icon_custom0').css("fill", value ? data.color.car_custom_plugged : config.icons.color.default);
            }
            // Show Battery Icon if user has no state for percents
            if (key == 'battery_value' && data.values.battery_percent == null) {
                if (config.general.battery_animation == false) {
                    batteryDisplay(100);
                } else {
                    batteryAnimation(data.battery_animation.direction);
                }
            }

            if (key.includes("percent")) {
                $('#' + key).text(value);
                $('.unit_percent').text('%');
                /* Handler for Battery Icon */
                if (key == 'battery_percent') {
                    $('#' + key).text(value);
                    if (config.general.battery_animation == false) {
                        batteryDisplay(value);
                    } else {
                        if (data.battery_animation.direction != 'none') {
                            batteryAnimation(data.battery_animation.direction);
                        } else {
                            batteryDisplay(value);
                        }
                    }
                }
            } else {
                $('#' + key).text(value);
                $('.unit').text(' ' + config.general.unit);
            }
        });
    } catch (error) {
        console.log('Error while updating the values!' + error);
    }

    /* Update the animations */
    try {
        Object.entries(data.animations).forEach(entry => {
            const [key, value] = entry;
            if (value === true) {
                $('#anim_' + key).css("visibility", "visible");
            } else {
                $('#anim_' + key).css("visibility", "hidden");
            }
        });
    } catch (error) {
        console.log('Error while updating the Animations!');
    }

    try {
        // Colors - Values
        Object.entries(data.color).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).parent().css("fill", value);
        });
    } catch (error) {
        console.log('Error while updating the Colors!');
    }
}