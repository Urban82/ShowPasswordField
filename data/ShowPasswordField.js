var debug = false;
var showDelay = 2;
var hideDelay = 2;
var customColors = true;
var foreground = "#FF0000";
var background = "#FFFFFF";

self.port.on("pref-init", function(prefs) {
    debug = prefs[0]
    showDelay = prefs[1];
    hideDelay = prefs[2];
    customColors = prefs[3];
    foreground = prefs[4];
    background = prefs[5];
    console.log("Initialized preferences - show:" + showDelay + "s hide:" + hideDelay + "s foreground:" + (customColors ? foreground : "none") + " background:" + (customColors ? background : "none"));
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
    console.log("Updated preference " + prefs[0]);
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

    self.onEnter = function() {
        if (self.hiddenWithoutExit) return; // Avoid re-show after an hide for blur
        // Cancel hide action
        if (self.hideTimer != null) {
            window.clearTimeout(self.hideTimer);
            self.hideTimer = null;
        }
        // Set show action
        if (self.showTimer == null) {
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
        // Cancel show action
        if (self.showTimer != null) {
            window.clearTimeout(self.showTimer);
            self.showTimer = null;
        }
        // Set hide action
        if (self.hideTimer == null) {
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
            self.change("text", foreground, background);
            self.showed = true;
        }
    };
    self.hide = function() {
        if (self.showed) {
            self.change("password", self.foreground, self.background);
            self.showed = false;
            self.hiddenWithoutExit = true;
        }
    };

    self.obj.addEventListener("mouseover", self.onEnter, false);
    self.obj.addEventListener("mouseout", self.onExit, false);
    self.obj.addEventListener("blur", self.hide, false);
}

var inputFields = document.getElementsByTagName("input");
var num_inputFields = inputFields.length;
var num_passwordFields = 0;
for (var i = 0; i < num_inputFields; ++i) {
    var field = inputFields[i];
    if (field.type.toLowerCase() != "password")
        continue;
    console.log("Found - " + field.name);
    new ShowPasswordField(field);
    ++num_passwordFields;
}
console.log("Setup done for " + num_passwordFields + " password fields");
