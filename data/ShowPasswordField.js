var debug = false;
var showDelay = 2;
var hideDelay = 2;
var customColors = true;
var foreground = "#FF0000";
var background = "#FFFFFF";

function myLog(message) {
    if (debug)
        console.log(message);
}

self.port.on("pref-init", function(prefs) {
    debug = prefs[0]
    showDelay = prefs[1];
    hideDelay = prefs[2];
    customColors = prefs[3];
    foreground = prefs[4];
    background = prefs[5];
    myLog("Initialized preferences - show:" + showDelay + " s - hide:" + hideDelay + " s - foreground:" + (customColors ? foreground : "none") + " - background:" + (customColors ? background : "none"));
});

self.port.on("pref-changed", function(prefs) {
    switch (prefs[0]) {
        case "debug":
            debug = prefs[1];
            break;
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
    myLog("Updated preference " + prefs[0]);
});

function ShowPasswordField(obj) {
    var self = this;
    self.obj = obj;
    self.showed = false;
    self.hiddenWithoutExit = false;
    self.showTimer = null;
    self.hideTimer = null;

    self.foreground = self.obj.style.color;
    self.background = self.obj.style.background;

    self.log = function(message) {
        myLog("[" + self.obj.name + "] " + message);
    };

    self.onEnter = function() {
        if (self.hiddenWithoutExit) return; // Avoid re-show after an hide for blur
        self.log("Entered");
        // Cancel hide action
        if (self.hideTimer != null) {
            self.log("Entered - Cancelled hide");
            window.clearTimeout(self.hideTimer);
            self.hideTimer = null;
        }
        // Set show action
        if (!self.showed && self.showTimer == null) {
            self.log("Entered - Show in " + showDelay + " s");
            self.showTimer = window.setTimeout(
                function() {
                    self.showTimer = null;
                    self.show();
                },
                showDelay * 1000
            );
        }
    };
    self.onExit = function() {
        self.log("Exited");
        // Cancel show action
        if (self.showTimer != null) {
            self.log("Exited - Cancelled show");
            window.clearTimeout(self.showTimer);
            self.showTimer = null;
        }
        // Set hide action
        if (self.showed && self.hideTimer == null) {
            self.log("Exited - Hide in " + hideDelay + " s");
            self.hideTimer = window.setTimeout(
                function() {
                    self.hideTimer = null;
                    self.hide();
                    self.hiddenWithoutExit = false;
                },
                hideDelay * 1000
            );
        }
    };

    self.change = function(type, fg, bg) {
        // Save selection
        var selectionStart = self.obj.selectionStart;
        var selectionEnd = self.obj.selectionEnd;

        // Apply custom colors
        if (customColors) {
            self.obj.style.color = fg;
            self.obj.style.background = bg;
        }

        // Change field type
        self.obj.type = type;

        // Restore selection
        self.obj.selectionStart = selectionStart;
        self.obj.selectionEnd = selectionEnd;
    };
    self.show = function() {
        if (!self.showed) {
            self.log("Show");
            self.change("text", foreground, background);
            self.showed = true;
        }
    };
    self.hide = function() {
        if (self.showed) {
            self.log("Hide");
            self.change("password", self.foreground, self.background);
            self.showed = false;
            self.hiddenWithoutExit = true;
        }
    };

    self.obj.addEventListener("mouseover", self.onEnter, false);
    self.obj.addEventListener("mouseout", self.onExit, false);
    self.obj.addEventListener("blur", self.hide, false);
}

self.port.on("start", function() {
    var inputFields = document.getElementsByTagName("input");
    var num_inputFields = inputFields.length;
    var num_passwordFields = 0;
    for (var i = 0; i < num_inputFields; ++i) {
        var field = inputFields[i];
        if (field.type.toLowerCase() != "password")
            continue;
        myLog("Found - " + field.name);
        new ShowPasswordField(field);
        ++num_passwordFields;
    }
    myLog("Setup done for " + num_passwordFields + " password fields");
});
