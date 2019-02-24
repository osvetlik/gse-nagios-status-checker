
const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Soup = imports.gi.Soup;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Lib = Me.imports.convenience;

const SERVICE_QUERY_PARAMS = {
	"query": "servicelist",
	"servicestatus": "warning critical unknown"
};

const NagiosChecker = new Lang.Class({
	Name: 'NagiosChecker',
	Extends: St.Bin,

	_init: function () {
		this.parent({
			style_class: 'panel-button',
			reactive: true,
			can_focus: true,
			x_fill: true,
			y_fill: false,
			track_hover: true
		});
		this._currentStatus = null;
		this._icon = new St.Icon({ icon_name: 'media-record-symbolic', style_class: 'system-status-icon' });
		this.set_child(this._icon);
		// this.connect('button-press-event', doSomething());
		// this._currentStatus = 'warn';
		// this.connect('button-press-event', Lang.bind(this, this._setStatus));

		this._settings = Lib.getSettings();
		this._http = new Soup.Session({
			"user-agent": "nagios-checker/" + Me.metadata['version']
		});
		this._http.connect('authenticate', Lang.bind(this, this._authenticate));

		this._refresh();
	},

	_authenticate: function(session, msg, auth, retrying) {
		if (!retrying) {
			auth.authenticate(this._settings.get_string('username'), this._settings.get_string('password'));
		}
	},

	_setStatus: function () {
		this._icon.style_class = 'system-status-icon';
		if (this._currentStatus) {
			this._icon.add_style_class_name('nagios-status-' + this._currentStatus);
		}
	},

	_refresh: function() {
		this._icon.set_icon_name('document-open-recent-symbolic');
		let msg = Soup.form_request_new_from_hash('GET', this._settings.get_string('url') + 'statusjson.cgi', SERVICE_QUERY_PARAMS);
		this._http.queue_message(msg, Lang.bind(this, this._processReply));
	},

	_processReply: function(session, message) {
		this._icon.set_icon_name('media-record-symbolic');
		if (message.status_code !== 200) {
			this._currentStatus = "failed";
		}
		else {
			let json = JSON.parse(message.response_body.data);
			this._currentStatus = "ok";
		}

		this._setStatus();
	}
});

let nagiosChecker;

function enable() {
	nagiosChecker = new NagiosChecker();
    Main.panel._rightBox.insert_child_at_index(nagiosChecker, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(nagiosChecker);
    nagiosChecker.destroy();
    nagiosChecker = null;
}


