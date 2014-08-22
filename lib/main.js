const data = require("sdk/self").data;
const pageMod = require("sdk/page-mod");
const prefSet = require("sdk/simple-prefs");

pageMod.PageMod({
    include: "*",
    contentScriptFile: data.url("ShowPasswordField.js"),
    onAttach: function(worker) {
        // Persistent values
        var debug = prefSet.prefs.debug;
        var showDelay = prefSet.prefs.showDelay;
        var hideDelay = prefSet.prefs.hideDelay;
        var customColors = prefSet.prefs.customColors;
        var foreground = prefSet.prefs.foreground;
        var background = prefSet.prefs.background;

        // Send initial values
        worker.port.emit('pref-init', [debug, showDelay, hideDelay, customColors, foreground, background]);

        // Notify changes
        function onPrefChange(prefName) {
            let payload = [prefName, prefSet.prefs[prefName]];
            worker.port.emit('pref-changed', payload);
        }
        prefSet.on("debug", onPrefChange);
        prefSet.on("showDelay", onPrefChange);
        prefSet.on("hideDelay", onPrefChange);
        prefSet.on("customColors", onPrefChange);
        prefSet.on("foreground", onPrefChange);
        prefSet.on("background", onPrefChange);
    }
});
