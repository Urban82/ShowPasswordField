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

var passwordFields = document.evaluate('.//input[@type="password"]', document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
var num_passwordFields = passwordFields.snapshotLength;
for (var i = 0; i < num_passwordFields; ++i) {
    console.log("Found - " + passwordFields.snapshotItem(i).name);
    new ShowPasswordField(passwordFields.snapshotItem(i));
}
console.log("Setup done for " + num_passwordFields + " password fields");
