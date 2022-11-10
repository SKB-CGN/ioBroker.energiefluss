// find out, which instance we are using
const urlParams = new URLSearchParams(window.location.search);
const instance = urlParams.get('instance') ? urlParams.get('instance') : 0;

// Start connections to ioBroker Service
servConn.namespace = 'energiefluss.' + instance;
console.log('Using Instance: ' + servConn.namespace);
let objID = [servConn.namespace + '.configuration', servConn.namespace + '.data'];

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