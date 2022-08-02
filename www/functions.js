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
        // Process colors
        Object.entries(config.colors).forEach(entry => {
            const [key, value] = entry;
            if (key.includes("value") || key.includes("percent")) {
                $('#' + key).css("fill", value);
            } else {
                $('#' + key).css("stroke", value);
            }
        });

        // Process colors inside circles
        Object.entries(config.fill_colors).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("fill", value ? value : "");
        });

        // Process colors of the lines - if overwritten
        Object.entries(config.line_colors).forEach(entry => {
            const [key, value] = entry;
            $('#line_' + key).css("stroke", value ? value : config.colors.lines);
        });

        // Process fonts
        Object.entries(config.fonts).forEach(entry => {
            const [key, value] = entry;
            switch (key) {
                case 'font_src':
                    downloadFont(config.fonts.font, value);
                    break;
                case 'font':
                    $('.value, .text, .percent').css("font-family", value);
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
            }
        });
        /* Process Elements to be shown */
        //Circles
        Object.entries(config.circles).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("visibility", value ? "visible" : "hidden");
            // If no Circle is displayed, remove the Data as well: Values and Text
            if (value === false) {
                let tmpElm = key.split("_");
                $('#icon_' + tmpElm[0]).css("visibility", "hidden");
                $("#" + tmpElm[0] + "_value").css("visibility", "hidden");
                $("#" + tmpElm[0] + "_percent").css("visibility", "hidden");
                // Remove battery icons
                if (tmpElm[0] == 'battery') {
                    $('.batt_elm').css("visibility", "hidden");
                }
            }
        });
        // Icons
        Object.entries(config.icons).forEach(entry => {
            const [key, value] = entry;
            $('#icon_' + key).css("visibility", value ? "visible" : "hidden");
        });
        // Lines
        Object.entries(config.lines).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("visibility", value ? "visible" : "hidden");
        });
        // Texts
        Object.entries(config.texts).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).css("visibility", value ? "visible" : "hidden");
        });
        // Custom Text
        Object.entries(config.custom_text).forEach(entry => {
            const [key, value] = entry;
            // Check, if Custom Text should be displayed
            $('#' + key).css("visibility", config.texts.custom_text ? "visible" : "hidden");
            $('#' + key).text(value);
        });

        // Custom Symbol
        Object.entries(config.custom_symbol).forEach(entry => {
            const [key, value] = entry;
            $('#' + key).attr("d", value ? value : $('#' + key).attr('data-id'));
        });

        // Values
        Object.entries(config.values).forEach(entry => {
            const [key, value] = entry;
            if (value) {
                $('#' + key).css("visibility", "visible");
            }
        });
        // General
        Object.entries(config.general).forEach(entry => {
            const [key, value] = entry;
            if (key == 'no_battery' && value === true) {
                $('#svg_image').addClass("no_battery");
            }
            if (key == 'line_size') {
                $('.path').css("stroke-width", value + "px");
            }
            if (key == 'circle_size') {
                $('circle').css("stroke-width", value + "px");
            }
            if (key == 'circle_shadow') {
                if (value === true) {
                    $('circle').addClass('shadow');
                } else {
                    $('circle').removeClass('shadow');
                }
            }
        });
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

function updateValues() {
    /* Update the Values */
    try {
        Object.entries(data.values).forEach(entry => {
            const [key, value] = entry;
            if (key == "car_plugged") {
                $('#icon_car').css("fill", value ? config.colors.car_plugged : "");
            }
            // Show Battery Icon if user has no state for percents
            if (key == 'battery_value' && data.values.battery_percent == null) {
                $('#' + batteryDisplay(100)).css("visibility", "visible");
            }
            if (key.includes("percent")) {
                $('#' + key).text(value + '%');
                /* Handler for Battery Icon */
                if (key == 'battery_percent') {
                    $('.batt_elm').css("visibility", "hidden");
                    $('#' + batteryDisplay(value)).css("visibility", "visible");
                }
            } else {
                $('#' + key).text(fractionLimit(value) + ' ' + config.general.unit);
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
                if (config.animation_colors.hasOwnProperty(key)) {
                    if (config.animation_colors[key] != "" || null) {
                        //console.log('Value found in Colors: ' + key);
                        $('#anim_' + key).css("stroke", config.animation_colors[key]);
                    } else {
                        $('#anim_' + key).css("stroke", config.colors.animation);
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

function fractionLimit(value) {
    return Intl.NumberFormat('de-DE', {
        minimumFractionDigits: config.general.fraction,
        maximumFractionDigits: config.general.fraction
    }).format(value);
}