// config
// find out, which instance we are using
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const instance = urlParams.get('instance') ? urlParams.get('instance') : 0;

// Start connections to ioBroker Service
servConn.namespace = 'energiefluss.' + instance;
console.log('Using Instance: ' + servConn.namespace);
let objID = [servConn.namespace + '.configuration', servConn.namespace + '.data'];
var loaded = false;

let config;
let data;
let battery_animation = false;
let battery_timer = null;
let battery_direction;
let battery_animation_running = false;

let elements = {
    cx: {
        "house": 448,
        "grid": 250,
        "production": 250,
        "car": 448,
        "battery": 52,
        "custom0": 448,
        "custom1": 646,
        "custom2": 646,
        "custom3": 646

    },
    cy: {
        "house": 250,
        "grid": 448,
        "production": 52,
        "car": 448,
        "battery": 250,
        "custom0": 52,
        "custom1": 52,
        "custom2": 250,
        "custom3": 448
    }
}

var states = [];
servConn.init({
    connLink: window.location.href.substr(0, window.location.href.indexOf('/', 8))
}, {
    onConnChange: function (isConnected) {
        if (isConnected) {
            console.log('connected');
            servConn.getStates(objID, (error, states) => {
                if (states[servConn.namespace + '.configuration'] != null) {
                    var count = 0;
                    for (var id in states) {
                        count++;
                    }
                    if (count > 0) {
                        let configOk = false;
                        let dataOk = false;
                        console.log('Received ' + count + ' states.');
                        console.log('Polling active!');
                        try {
                            config = JSON.parse(states[objID[0]].val);
                            configOk = true;
                        } catch (error) {
                            console.log('Error while parsing configuration JSON-Object! ' + error);
                        }
                        try {
                            data = JSON.parse(states[objID[1]].val);
                            dataOk = true;
                        } catch (error) {
                            console.log('Error while parsing data JSON-Object! ' + error);
                        }

                        if (configOk && dataOk) {
                            initConfig();
                            updateValues();
                            $('#svg_image').fadeIn("middle")
                            $('#loading').fadeOut("middle").addClass('hidden');
                        }
                    }
                } else {
                    console.log("No states received!");
                    $("#span_error").text("Could not receive any states for " + servConn
                        .namespace);
                }
            });
        } else {
            console.log('disconnected');
        }
    },
    onRefresh: function () {
        window.location.reload();
    },
    onUpdate: function (id, state) {
        setTimeout(function () {
            states[id] = state;
            // This is for changing the Values
            if (id == objID[1]) {
                try {
                    data = JSON.parse(states[id].val);
                    updateValues();
                } catch (error) {
                    console.log('Error while parsing Values in JSON-Object!');
                }
            }

            // Listen, if Adapter was reconfigured and adopt the new Config
            if (id == objID[0]) {
                try {
                    config = JSON.parse(states[id].val);
                    initConfig()
                } catch (error) {
                    console.log('Error while parsing Config in JSON-Object!');
                }
            }

        }, 0);
    },
    onError: function (err) {
        window.alert(_('Cannot execute %s for %s, because of insufficient permissions', err.command,
            err.arg), _('Insufficient permissions'), 'alert', 600);
    }
});

function initConfig() {
    try {
        // Colors - Lines
        Object.entries(config.lines.color).forEach(entry => {
            const [key, value] = entry;
            $('#line_' + key).css("stroke", value ? value : config.lines.color.default);
        });

        // Styles
        Object.entries(config.lines.style).forEach(entry => {
            const [key, value] = entry;
            switch (key) {
                case 'animation':
                    $('.animation').css("stroke-dasharray", value);
                    break;
                case 'animation_width':
                    $(".animation").css("stroke-width", value);
                    break;
                case 'animation_linecap':
                    $(".animation").css("stroke-linecap", value);
                    break;
                case 'animation_duration':
                    $(".animation").css("animation-duration", value + "ms");
                    break;
                case 'line_size':
                    $('.line').css("stroke-width", value);
                    break;
            }
        });

        // Process fonts
        Object.entries(config.fonts).forEach(entry => {
            const [key, value] = entry;
            switch (key) {
                case 'font_src':
                    downloadFont(config.fonts.font, value);
                    break;
                case 'font':
                    $('body').css("font-family", value);
                    break;
                case 'font_size_value':
                    $('.value').css("font-size", value + "px");
                    break;
                case 'font_size_label':
                    $('.text').css("font-size", value + "px");
                    break;
                case 'font_size_percent':
                    $('.percent').css("font-size", value + "px");
                    break;
                case 'font_size_unit':
                    $('.unit').css("font-size", value + "px");
                    break;
                case 'font_size_unit_percent':
                    $('.unit_percent').css("font-size", value + "px");
                    break;
                case 'font_size_remaining':
                    $('#battery_remaining_text').css("font-size", value + "px");
                    break;
            }
        });

        // General
        Object.entries(config.general).forEach(entry => {
            const [key, value] = entry;
            switch (key) {
                case 'no_battery':
                    if (value === true) {
                        $('#svg_image').addClass("no_battery");
                    }
                    break;
                case 'battery_animation':
                    battery_animation = value;
                    if (!value) {
                        battery_direction = '';
                        clearInterval(battery_timer);
                    }
                    break;
                case 'type':
                    $("circle, rect").remove();
                    if (value == "circle") {
                        Object.entries(config.elements.elements).forEach(entry => {
                            const [key, value] = entry;
                            if (value === true) {
                                let c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                                c.setAttribute('id', key);
                                c.setAttribute('cx', elements.cx[key]);
                                c.setAttribute('cy', elements.cy[key]);
                                c.setAttribute('r', config.elements.style.circle_radius);
                                c.setAttribute('class', 'all_elm');
                                $(c).insertAfter("#placeholder");
                            }
                        });
                    }
                    if (value == "rect") {
                        Object.entries(config.elements.elements).forEach(entry => {
                            const [key, value] = entry;
                            if (value === true) {
                                let c = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                                c.setAttribute('id', key);
                                c.setAttribute('x', (elements.cx[key] - (config.elements.style.rect_width / 2)).toString());
                                c.setAttribute('y', (elements.cy[key] - (config.elements.style.rect_height / 2)).toString());
                                c.setAttribute('width', config.elements.style.rect_width);
                                c.setAttribute('height', config.elements.style.rect_height);
                                c.setAttribute('class', 'all_elm');
                                c.setAttribute('rx', config.elements.style.rect_corner);
                                $(c).insertAfter("#placeholder");
                            }
                        });
                    }
                    break;
            }
        });

        // Colors - Elements
        Object.entries(config.elements.color).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("stroke", value);
        });

        // Colors - Elements Fill
        Object.entries(config.elements.fill).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("fill", value ? value : "");
        });

        // Element
        Object.entries(config.elements.style).forEach(entry => {
            const [key, value] = entry;
            let new_pos = 0;
            switch (key) {
                case 'size':
                    $('circle, rect').css("stroke-width", value + "px");
                    break;
                case 'shadow':
                    if (value === true) {
                        $('circle, rect').addClass('shadow');
                    } else {
                        $('circle, rect').removeClass('shadow');
                    }
                    break;
                case 'shadow_color':
                    $(".shadow").css("-webkit-filter", "drop-shadow(0px 3px 3px " + value);
                    $(".shadow").css("filter", "drop-shadow(0px 3px 3px " + value);
                    break;
                case 'circle_radius':
                    // If Radius is bigger than Basis of 50px, we need to redraw all elements on the SVG
                    if (config.general.type == 'circle') {
                        new_pos = 0;
                        if (value > 50) {
                            new_pos = value - 50;
                        } else {
                            new_pos = 50 - value;
                        }
                        $('circle, text, .line, .animation').css("translate", "0px " + new_pos + "px");
                        $(".icon_color").each(function () {
                            moveIcon(this.id, 0, new_pos);
                        });
                    }
                    break;
                case 'rect_height':
                    if (config.general.type == 'rect') {
                        new_pos = 0;
                        if (value > 100) {
                            new_pos = value - 100;
                        } else {
                            new_pos = 100 - value;
                        }
                        $('rect, text, .line, .animation').css("translate", "0px " + new_pos + "px");
                        $(".icon_color").each(function () {
                            moveIcon(this.id, 0, new_pos);
                        });
                    }
                    break;
            }
        });
        // Labels inside circle
        Object.entries(config.texts.labels).forEach(entry => {
            const [key, value] = entry;
            $("#" + key + "_text").text(value);
        });
        // Color of the Labels inside the Elements
        $(".text").css("fill", config.texts.color.default);

        // Color of the Icons inside the Elements
        $('.icon_color').css("fill", config.icons.color.default ? config.icons.color.default : "");

        // Color of the Label of the remaining Battery time
        $("#battery_remaining_text").css("fill", config.texts.color.battery_remaining);

        /* Process Elements to be shown */
        /* Visibility */
        // Elements
        Object.entries(config.elements.elements).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("visibility", value ? "visible" : "hidden");
            // If no Circle is displayed, remove the Data as well: Values and Text
            if (value === false) {
                let tmpElm = key.split("_");
                $('#icon_' + tmpElm[0]).css("visibility", "hidden");
                $("#" + tmpElm[0] + "_value").parent().css("visibility", "hidden");
                $("#" + tmpElm[0] + "_percent").parent().css("visibility", "hidden");
                // Remove battery icons
                if (tmpElm[0] == 'battery') {
                    $('.batt_elm').css("visibility", "hidden");
                    if (battery_timer) {
                        clearInterval(battery_timer);
                        battery_direction = 'none';
                    }
                }
            }
        });
        // Icons
        Object.entries(config.icons.icons).forEach(entry => {
            const [key, value] = entry;
            $('#icon_' + key).css("visibility", value ? "visible" : "hidden");
        });
        // Lines
        Object.entries(config.lines.lines).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("visibility", value ? "visible" : "hidden");
        });
        // Texts
        Object.entries(config.texts.texts).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("visibility", value ? "visible" : "hidden");
        });

        // Custom Symbol
        Object.entries(config.custom_symbol).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).attr("d", value ? value : $('#' + key).attr('data-id'));
        });

        // Values
        Object.entries(config.values.values).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).parent().css("visibility", value ? "visible" : "hidden");
        });

        let date = new Date().toLocaleString();
        console.log('Config successfully applied at ' + date + '!');

    } catch (error) {
        console.log('Error while updating the Config! ' + error);
    }
}

function moveIcon(id, x, y) {
    let coords = {};
    let matrix = $("#" + id).attr("data-default");
    let values = matrix.match(/-?[\d\.]+/g);
    coords.x = parseInt(values[0]);
    coords.y = parseInt(values[1]);
    $("#" + id).attr("transform", "translate(" + (coords.x + x) + "," + (coords.y + y) + ")");
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
    $('.batt_elm').css("visibility", "hidden");
    var elm = "icon_battery_empty";
    if (value >= 25) {
        elm = "icon_battery_low";
    }
    if (value >= 50) {
        elm = "icon_battery_medium";
    }
    if (value >= 75) {
        elm = "icon_battery_high";
    }
    return elm;

}

function animateBattery(what) {
    // Check, if we already animate the battery
    if (what == 'charge' || what == 'discharge') {
        if (battery_direction != what) {
            battery_direction = what;
            let batt = $(".batt_elm");
            let length = batt.length;
            let current_pos = what == 'charge' ? length - 1 : 0;
            // Get Battery Elements
            // Clear the Interval if its already running to prevent multiple intervals
            if (battery_timer) {
                clearInterval(battery_timer);
            }
            // Show corresponding battery before animations starts to display "something"
            $('.batt_elm').css("visibility", "hidden");
            let elm = what == 'charge' ? 'empty' : 'high';
            $("#icon_battery_" + elm).css("visibility", "visible");

            battery_timer = setInterval(function () {
                if (what == 'discharge') {
                    current_pos = current_pos == length ? 0 : current_pos;
                }

                if (what == 'charge') {
                    current_pos = current_pos < 0 ? length - 1 : current_pos;
                }

                if (current_pos < length && what == 'discharge' ||
                    current_pos >= 0 && what == 'charge') {
                    $('.batt_elm').css("visibility", "hidden");
                    batt.eq(current_pos).css("visibility", "visible");
                    what == 'charge' ? current_pos-- : current_pos++;
                }
            }, 1000);
        }
    } else {
        // Set "what" to none, if animation is not needed
        battery_direction = 'none';
        // Stop the Interval
        if (battery_timer) {
            clearInterval(battery_timer);
        }
        // Show correct Battery, if charging completed
        $('#' + batteryDisplay(data.values.battery_percent ? data.values.battery_percent : 100)).css("visibility", "visible");
    }
}

function updateValues() {
    /* Update the Values */
    try {
        Object.entries(data.values).forEach(entry => {
            const [key, value] = entry;
            if (key == "car_plugged") {
                $('#icon_car').css("fill", value ? data.color.car_plugged : "");
            }
            // Show Battery Icon if user has no state for percents
            if (key == 'battery_value' && data.values.battery_percent == null) {
                if (battery_animation == false) {
                    $('#' + batteryDisplay(100)).css("visibility", "visible");
                } else {
                    animateBattery(data.battery_animation.direction);
                }
            }

            if (key.includes("percent")) {
                $('#' + key).text(value);
                $('.unit_percent').text('%');
                /* Handler for Battery Icon */
                if (key == 'battery_percent') {
                    $('#' + key).text(value);
                    if (battery_animation == false) {
                        $('#' + batteryDisplay(value)).css("visibility", "visible");
                    } else {
                        if (data.battery_animation.hasOwnProperty('direction')) {
                            animateBattery(data.battery_animation.direction);
                        } else {
                            // Here we need to stop the Animation
                            if (battery_timer) {
                                clearInterval(battery_timer);
                                battery_direction = 'none';
                            }
                            // Re-Display the Icon, if Animation stopped
                            $('#' + batteryDisplay(value)).css("visibility", "visible");
                        }
                    }
                }
            } else {
                $('#' + key).text(value);
                $('.unit').text(' ' + config.general.unit);
            }
        });
    } catch (error) {
        console.log('Error while updating the values!');
    }

    /* Update the animations */
    try {
        Object.entries(data.animations).forEach(entry => {
            const [key, value] = entry;
            if (value === true) {
                // Check, if there is a new color defined for this animation
                if (config.lines.animation_colors.hasOwnProperty(key)) {
                    if (config.lines.animation_colors[key] != "" || null) {
                        $('#anim_' + key).css("stroke", config.lines.animation_colors[key]);
                    } else {
                        $('#anim_' + key).css("stroke", config.lines.animation_colors.default);
                    }
                }
            } else {
                // Delete Animation because not needed till new Animation requested
                $('#anim_' + key).css("stroke", "");
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