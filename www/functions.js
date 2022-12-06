// config
var loaded = false;
var states = [];
let config;
let data;
let svg_width = 550;

// Default Icon for Custom if no icon defined in settings
let default_icon = "M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z";

let elements = {
    cx: {
        "house": 492,
        "grid": 282,
        "solar": 282,
        "car": 492,
        "battery": 72,
        "custom0": 492,
        "custom1": 702,
        "custom2": 807,
        "custom3": 702,
        "custom4": 387,
        "custom5": 597,
        "custom6": 807,
        "custom7": 807,
        "custom8": 597,
        "custom9": 387
    },
    cy: {
        "house": 262,
        "grid": 472,
        "solar": 52,
        "car": 472,
        "battery": 262,
        "custom0": 52,
        "custom1": (52 + 35),
        "custom2": 262,
        "custom3": (472 - 35),
        "custom4": 52,
        "custom5": 52,
        "custom6": (157 - 35),
        "custom7": (367 + 35),
        "custom8": 472,
        "custom9": 472
    },
    value: {
        "house": "consumption_value",
        "solar": "production_value",
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
        "solar": "production_text",
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
        "solar": "icon_production",
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
        "solar": "M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z",
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
    $("#icon_battery").removeClass().addClass("icon battery_" + elm);
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

    $("#icon_battery").removeClass().addClass("icon " + elm);
}

function getCoords(element) {
    element = "#" + element;
    let x, y, r, width, height, stroke;
    r = $(element).attr("r") != null ? parseFloat($(element).attr("r")) : 0;
    x = $(element).attr("x") != null ? parseFloat($(element).attr("x")) : parseFloat($(element).attr("cx")) - r;
    y = $(element).attr("y") != null ? parseFloat($(element).attr("y")) : parseFloat($(element).attr("cy")) - r;
    width = $(element).attr("width") != null ? parseFloat($(element).attr("width")) : 2 * r;
    height = $(element).attr("height") != null ? parseFloat($(element).attr("height")) : 2 * r;

    stroke = parseFloat($(element).css("stroke-width"));
    return { x: x, y: y, width: width, height: height, r: r, stroke: stroke };
}

function invertColor(hex, bw) {
    if (hex.indexOf('rgb') === 0) {
        let tmp = hex.split("(")[1].split(")")[0];
        let rgb = tmp.split(",");
        hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    }
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }

    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6 && hex.indexOf('rgb') != 0) {
        return;
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function componentToHex(c) {
    var hex = parseInt(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//helper functions, it turned out chrome doesn't support Math.sgn() 
function signum(x) {
    return (x < 0) ? -1 : 1;
}
function absolute(x) {
    return (x < 0) ? -x : x;
}

function drawPath(path, startX, startY, endX, endY, reverse, id, round) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)

    let deltaX = (endX - startX) * 0.3;
    let deltaY = (endY - startY) * 0.3;
    // for further calculations which ever is the shortest distance
    let delta = deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);

    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    let arc1 = 0, arc2 = 1;
    if (startX > endX) {
        arc1 = 1;
        arc2 = 0;
    }
    // draw tha pipe-like path
    // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end
    if (reverse) {
        $('#' + path).attr("d",
            "M" + endX + " " + endY +
            " V" + (endY - delta) +
            " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (endX - delta * signum(deltaX)) + " " + (endY - 2 * delta) +
            " H" + (startX + delta * signum(deltaX)) +
            " A" + delta + " " + delta + " 0 0 " + arc2 + " " + startX + " " + (endY - 3 * delta) +
            " V" + startY
        );

    } else {
        $('#' + path).attr("d",
            "M" + startX + " " + startY +
            " V" + (startY + delta) +
            " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + delta * signum(deltaX)) + " " + (startY + 2 * delta) +
            " H" + (endX - delta * signum(deltaX)) +
            " A" + delta + " " + delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3 * delta) +
            " V" + endY
        );
    }

    if (round) {
        $('#' + path).addClass("round");
    }

    addAnimation(id);
}

function drawLine(id) {
    // Line
    let l = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    l.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
    l.setAttribute('class', 'line');
    l.setAttribute('id', 'line_' + id);
    let stroke_line = config.lines.color[id] ? config.lines.color[id] : config.lines.color.default;
    l.setAttribute('style', 'stroke: ' + stroke_line + ';');
    $(l).appendTo('#placeholder_lines');
}

function addAnimation(id) {
    // Animation
    let a = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    a.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
    a.setAttribute('class', 'animation anim_element');
    a.setAttribute('id', 'anim_' + id);
    let stroke_anim = config.lines.animation_colors[id] ? config.lines.animation_colors[id] : config.lines.animation_colors.default;
    a.setAttribute('style', 'stroke: ' + stroke_anim + ';');
    $(a).appendTo('#placeholder_animations');
}

function addGradient(id, color) {
    // Gradient
    if (color == "") {
        color = "transparent";
    }
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    g.setAttribute('id', 'gradient_' + id);
    g.setAttribute('gradientTransform', 'rotate(90)');

    let stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('id', 'gradient_transparent_' + id);
    stop.setAttribute('offset', '0%');
    stop.setAttribute('stop-color', 'transparent');
    g.appendChild(stop);

    stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('id', 'gradient_color_' + id);
    stop.setAttribute('offset', '1%');
    stop.setAttribute('stop-color', color);
    g.appendChild(stop);

    $(g).appendTo("#placeholder_defs");
}

function connectElements(path, startElem, endElem, id) {
    // if first element is lower than the second, swap!
    let reverse = false;
    let round = false;

    if (getCoords(startElem)["y"] > getCoords(endElem)["y"]) {
        let temp = startElem;
        startElem = endElem;
        endElem = temp;
        reverse = true;
    }

    // get (top, left) coordinates for the two elements
    let startCoord = getCoords(startElem);
    let endCoord = getCoords(endElem);

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    let startX = startCoord.x + (0.5 * startCoord.width);    // x = left offset + 0.5*width - svg's left offset
    let startY = startCoord.y + startCoord.height + (startCoord.stroke / 2);        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    let endX = endCoord.x + (0.5 * endCoord.width);
    let endY = endCoord.y - (endCoord.stroke / 2);

    // Elements on the same height
    if (startCoord.y == endCoord.y) {
        // New Start
        startX = startCoord.x + startCoord.width + (startCoord.stroke / 2);
        startY = startCoord.y + (0.5 * startCoord.height);

        // New End
        endX = endCoord.x - (endCoord.stroke / 2);
        endY = endCoord.y + (0.5 * endCoord.height);
    }

    // Check, if we are coming from Grid or Production and move them to middle
    if (id == "solar_to_house") {
        startX += 20;
        startY += 1;
        endX -= 20;


        // If circle is configured
        if (config.general.type == "circle") {
            endY += 2;
            startY -= 2;
            round = true;
        }
    }

    if (id == "solar_to_battery") {
        startX -= 20;
        startY += 1;
        endY -= 1;

        // If circle is configured
        if (config.general.type == "circle") {
            startY -= 2;
            round = true;
        }
    }

    if (id == "grid_to_house") {
        startX -= 20;
        startY -= 1;
        endX += 20;
        endY += 1;

        // If circle is configured
        if (config.general.type == "circle") {
            startY -= 2;
            round = true;
        }
    }

    if (id == "grid_to_battery") {
        startY += 1;
        endX -= 20;
        endY += 2;

        // If circle is configured
        if (config.general.type == "circle") {
            round = true;
        }
    }

    // call function for drawing the path
    drawPath(path, startX, startY, endX, endY, reverse, id, round);
}

function initConfig() {
    // If slim-design is enabled, move all elements more to the left except battery
    let elm_offset = config.general.slim_design === true ? 105 : 0;

    try {
        // First remove all things
        $(".placeholders").empty();

        // Load CSS into style Elements
        $("#style_element").empty().append('.shadow { -webkit-filter: drop-shadow(0px 3px 3px ' + config.elements.style.shadow_color + '); filter: drop-shadow(0px 3px 3px ' + config.elements.style.shadow_color + ');}')
            .append('.icon { opacity: ' + config.general.opacity_icon + '%;}')
            .append('.text { opacity: ' + config.general.opacity_text + '%;}')
            .append('.value { opacity: ' + config.general.opacity_value + '%;}')
            .append('.percent { opacity: ' + config.general.opacity_percent + '%;}')
            .append('.remaining { opacity: ' + config.general.opacity_remaining + '%;}')
            .append('.line { opacity: ' + config.general.opacity_line + '%;}');

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
            .append('#battery_remaining_text {font-size:' + config.fonts.font_size_remaining + 'px; fill: ' + config.texts.color.battery_remaining + '; transform-box: fill-box; transform-origin: center; transform:rotate(270deg);}');


        // Elements
        Object.entries(config.elements.elements).forEach(entry => {
            const [key, value] = entry;
            if (value === true) {
                // Check, if we are not displaying the battery
                if (config.general.no_battery === true) {
                    elm_offset = 225;
                } else {
                    // Check, if we are displaying the slim-design
                    if (config.general.slim_design === true) {
                        if (key == "battery") {
                            elm_offset = 0;
                        } else {
                            elm_offset = 105;
                        }
                    }
                }

                let c;
                // Circle
                if (config.general.type == "circle") {
                    c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    c.setAttribute('cx', elements.cx[key] - elm_offset);
                    c.setAttribute('cy', elements.cy[key]);
                    c.setAttribute('r', config.elements.style.circle_radius);
                }

                // Rectangle
                if (config.general.type == "rect") {
                    c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    c.setAttribute('x', (elements.cx[key] - (config.elements.style.rect_width / 2) - elm_offset));
                    c.setAttribute('y', (elements.cy[key] - (config.elements.style.rect_height / 2)));
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
                let fill = config.elements.fill[key] ? config.elements.fill[key] : 'none';
                c.setAttribute('style', ' fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + config.elements.style.size + 'px;');
                $(c).appendTo("#placeholder_elements");

                // Create the Value Text Elements
                // Value Elements
                let v = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                v.setAttribute('class', 'value');
                v.setAttribute('x', elements.cx[key] - elm_offset);
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
                    i.setAttribute('class', 'icon');
                    i.setAttribute('style', ' fill: ' + config.icons.color.default + ';');
                    i.setAttribute('transform', 'translate(' + ((elements.cx[key] - 12) - elm_offset) + ',' + ((elements.cy[key] - 44) + config.general.offset_icon) + ')');
                    $(i).appendTo("#placeholder_icons");
                }

                // Check, if we are displaying the battery circle
                if (key == "battery") {
                    // Additional Text for Battery remaining
                    let bt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    bt.setAttribute('id', 'battery_remaining_text');
                    bt.setAttribute('class', 'text remaining');
                    bt.setAttribute('x', 8);
                    bt.setAttribute('y', elements.cy[key] + config.general.offset_remaining);
                    bt.setAttribute('dominant-baseline', 'middle');
                    $(bt).appendTo("#placeholder_texts");
                }

                // Texts
                // Text Elements
                let t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                let l = config.texts.labels[key];
                let l2br_count = 0;
                let move_to = 0;
                t.setAttribute('id', elements.text[key]);
                t.setAttribute('class', 'text');

                t.setAttribute('dominant-baseline', 'middle');
                if (l.includes("<br>")) {
                    let l2br = l.split("<br>");
                    l2br_count = l2br.length;
                    let tmp_text = '';
                    l2br.forEach(function (text) {
                        if (text != "" || text != undefined) {
                            tmp_text += '<tspan x=' + (elements.cx[key] - elm_offset) + ' dy="1em">' + text + '</tspan>';
                        }
                    })
                    t.innerHTML = tmp_text;
                    move_to = ((l2br_count - 1) * 16);

                } else {
                    t.innerHTML = l;
                }
                t.setAttribute('x', elements.cx[key] - elm_offset);
                t.setAttribute('y', (elements.cy[key] + 28) + config.general.offset_text - move_to);
                $(t).appendTo("#placeholder_texts");

                // Percent
                // Check, if we have a corresponding percent for each element
                if (config.values.values[key + "_percent"] === true) {
                    let p = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    p.setAttribute('class', 'percent');
                    p.setAttribute('x', elements.cx[key] - elm_offset);
                    p.setAttribute('y', (elements.cy[key] + 12) + config.general.offset_percent);
                    p.setAttribute('dominant-baseline', 'middle');
                    p.innerHTML = '<tspan class="value" id="' + key + '_percent"></tspan><tspan class="unit_percent">%</tspan>';
                    $(p).appendTo("#placeholder_percents");
                    addGradient(key, config.elements.fill[key]);
                }
            }
        });

        // Lines and Animations
        Object.entries(config.lines.lines).forEach(entry => {
            const [key, value] = entry;
            if (value === true) {
                // Defs
                let d = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                d.setAttribute('id', key);
                $(d).appendTo('#placeholder_defs');


                // Draw the Line
                drawLine(key);

                // Connect the Line to the corresponding Element
                let elm = key.split("_");

                connectElements(key, elm[0], elm[2], key);
            }
        });

        // Configure the ViewBox depending on the Elements
        if (config.elements.elements.custom5 == true || config.elements.elements.custom8 == true) {
            svg_width += 105;
        }

        if (config.elements.elements.custom1 == true || config.elements.elements.custom3 == true) {
            svg_width += 105;
        }

        if (config.elements.elements.custom2 == true || config.elements.elements.custom6 == true || config.elements.elements.custom7) {
            svg_width += 105;
        }
        if (config.general.no_battery === true) {
            svg_width -= 210;
        }
        if (config.general.slim_design === true) {
            svg_width -= 105;
        }

        $('#svg_image').attr('viewBox', '0 0 ' + svg_width + ' 540');

        let date = new Date().toLocaleString();
        console.log('Config successfully applied at ' + date + '!');

    } catch (error) {
        console.log('Error while updating the Config! ' + error);
    }
}

function updateValues() {
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

    /* Update the Values */
    try {
        // Colors - Values
        Object.entries(data.color).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).parent().css("fill", value);
        });
    } catch (error) {
        console.log('Error while updating the Colors!');
    }

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

                let elm = key.split("_");

                if (config.general.fill_elements === true) {
                    /* Handler for Fill the circle */
                    $("#gradient_transparent_" + elm[0]).attr("offset", (100 - value) + "%");

                    // Apply fill to corresponding Element
                    $("#" + elm[0]).css("fill", "url(#gradient_" + elm[0] + ")");

                    // Colors for the fonts need to be updated
                    if (value >= 40) {
                        $('#' + key).parent().css("fill", invertColor(config.elements.fill[elm[0]]));
                    }

                    if (value >= 49) {
                        // Here we work with the Element
                        $('#' + elm[0] + "_value").parent().css("fill", invertColor(config.elements.fill[elm[0]]));
                    }
                }

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
}