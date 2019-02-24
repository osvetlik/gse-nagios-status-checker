'use strict';

const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Lib = Me.imports.convenience;

function init() {
}

const NagiosCheckerSettingsWidget = new GObject.Class({
    Name: 'NagiosChecker.Prefs.Widget',
    GTypeName: 'NagiosCheckerSettingsWidget',
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);

        this.orientation = Gtk.Orientation.VERTICAL;
        this.spacign = 0;

        // creates the settings
        this.settings = Lib.getSettings();

        // creates the ui builder and add the main resource file
        let uiFilePath = Me.path + "/ui/prefs.glade";
        let builder = new Gtk.Builder();

        if (builder.add_from_file(uiFilePath) == 0) {
            global.log("JS LOG: could not load the ui file: %s".format(uiFilePath));

            let label = new Gtk.Label({
                label: _("Could not load the preferences UI file"),
                vexpand: true
            });

            this.pack_start(label, true, true, 0);
        } else {
            global.log('JS LOG:_UI file receive and load: '+uiFilePath);

            let mainContainer = builder.get_object("PREFS_BOX");

            this.pack_start(mainContainer, true, true, 0);

            let activeEntry = builder.get_object("PREFS_ACTIVE");
            let usernameEntry = builder.get_object("PREFS_USER_NAME");
            let passwordEntry = builder.get_object("PREFS_PASSWORD");
            let urlcgiEntry = builder.get_object("PREFS_URL");

            this.settings.bind("username", usernameEntry , "text", Gio.SettingsBindFlags.DEFAULT);
            this.settings.bind("password", passwordEntry , "text", Gio.SettingsBindFlags.DEFAULT);
            this.settings.bind("url", urlcgiEntry , "text", Gio.SettingsBindFlags.DEFAULT);
            this.settings.bind("active", activeEntry, "active", Gio.SettingsBindFlags.DEFAULT)

            let versionLabel = builder.get_object("PREFS_VERSION_LABEL");
            versionLabel.label = "Version: <i>" + Me.metadata["version"] + "</i>";
        }
    }
});

function buildPrefsWidget() {
    let widget = new NagiosCheckerSettingsWidget();
    widget.show_all();

    return widget;
}

