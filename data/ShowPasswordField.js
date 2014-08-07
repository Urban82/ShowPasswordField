var showDelay = 2;
var hideDelay = 2;
var customColors = true;
var foreground = "#FF0000";
var background = "#FFFFFF";

self.port.on("pref-init", function(prefs) {
    var showDelay = prefs[0];
    var hideDelay = prefs[1];
    var customColors = prefs[2];
    var foreground = prefs[3];
    var background = prefs[4];
});

self.port.on("pref-changed", function(prefs) {
    switch (prefs[0]) {
        case "showDelay":
            showDelay = prefs[1];
            break;
        case "hideDelay":
            hideDelay = prefs[1];
            break;
        case "customColors":
            customColors = prefs[1];
            break;
        case "foreground":
            foreground = prefs[1];
            break;
        case "background":
            background = prefs[1];
            break;
    }
});
