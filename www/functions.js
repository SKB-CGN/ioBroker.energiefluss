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
                        console.log('Received ' + count + ' states.');
                        console.log('Polling active!');
                        try {
                            config = JSON.parse(states[objID[0]].val);
                            data = JSON.parse(states[objID[1]].val);
                            initConfig(once = true);
                            updateValues();
                            $('#svg_image').fadeIn("middle")
                            $('#loading').fadeOut("middle").addClass('hidden');
                        } catch (error) {
                            console.log('Error while parsing JSON-Object!');
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

function initConfig(once = false) {
    try {
        // Colors - Circles
        Object.entries(config.circles.color).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("stroke", value);
        });

        // Colors - Values
        Object.entries(config.values.color).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).parent().css("fill", value);
        });

        // Colors - Circle Fill
        Object.entries(config.circles.fill).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("fill", value ? value : "");
        });

        // Colors - Lines
        Object.entries(config.lines.color).forEach(entry => {
            const [key, value] = entry;
            $('#line_' + key).css("stroke", value ? value : config.lines.color.default);
        });
        $('.path').css("stroke-width", config.lines.style.line_size);

        // Animation Dots
        switch (config.lines.style.animation_dots) {
            case '1':
                $('.animation').css("stroke-dasharray", "4 132");
                break;
            case '2':
                $('.animation').css("stroke-dasharray", "4 12 4 116");
                break;
            case '3':
                $('.animation').css("stroke-dasharray", "4 12 4 12 4 100");
                break;
        }

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
            }
        });

        // General
        Object.entries(config.general).forEach(entry => {
            const [key, value] = entry;
            if (key == 'no_battery' && value === true) {
                $('#svg_image').addClass("no_battery");
            }
            if (key == 'battery_animation') {
                battery_animation = value;
                if (!value) {
                    battery_direction = '';
                    clearInterval(battery_timer);
                }
            }
        });
        // Circle
        Object.entries(config.circles.style).forEach(entry => {
            const [key, value] = entry;
            switch (key) {
                case 'size':
                    $('circle').css("stroke-width", value + "px");
                    break;
                case 'shadow':
                    if (value === true) {
                        $('circle').addClass('shadow');
                    } else {
                        $('circle').removeClass('shadow');
                    }
                    break;
                case 'shadow_color':
                    $(".shadow").css("-webkit-filter", "drop-shadow(0px 3px 3px " + value);
                    $(".shadow").css("filter", "drop-shadow(0px 3px 3px " + value);
                    break;
                case 'radius':
                    // If Radius is bigger than Basis of 50px, we need to redraw all elements on the SVG
                    let new_pos = 0;
                    if (value > 50) {
                        new_pos = value - 50;
                    } else {
                        new_pos = 50 - value;
                    }
                    $('circle, text, .line, .animation').css("translate", "0px " + new_pos + "px");
                    $('circle').attr("r", value);
                    break;
            }
        });
        // Labels inside circle
        Object.entries(config.texts.labels).forEach(entry => {
            const [key, value] = entry;
            $("#" + key + "_text").text(value);
        });
        // Color of the Labels inside the circle
        $(".text").css("fill", config.texts.color);

        /* Process Elements to be shown */
        /* Visibility */
        //Circles
        Object.entries(config.circles.circles).forEach(entry => {
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
        Object.entries(config.icons).forEach(entry => {
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

        // Ran once
        if (once) {
            console.log('Applied config successfully!');
        }
    } catch (error) {
        console.log('Error while updating the Config! ' + error);
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
                $('#icon_car').css("fill", value ? config.values.color.car_plugged : "");
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
}