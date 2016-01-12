var express = require('express'),
	exphbs  = require('express-handlebars'),
	config  = require('./config.json'),
	routes  = require('./routes'),
	bter    = require('./bter.js'),
	request = require('request'),
	bodyParser = require('body-parser');

var price_usd = null,
	price_btc = null,
	market = null;

function getBtcUsd() {
	bter.getPrice(function (err, result) {
		if (!err) {
			price_usd = result.toFixed(4);;
		} else {
			console.error(err);

			if (!price_usd) {
				price_usd = "?";
			}
		}

		setTimeout(getBtcUsd, 1000 * 60 * 5);
	});
}

function getBtc() {
	bter.getXCRBTC(function (err, result) {
		if (!err) {
			price_btc = result;
		} else {
			console.log(err);

			if (!price_btc) {
				price_btc = "?";
			}
		}

		setTimeout(getBtc, 1000 * 60 * 5);
	})
}

getBtcUsd();
getBtc();

var app = express();
var hbs = exphbs.create({
	defaultLayout : 'main',
	helpers : {
		market : function () {
			return market;
		},
		price_usd : function () { return price_usd; },
		price_btc : function () { return price_btc; },
		year : function () { return new Date().getFullYear(); },
		macos_lite: function () {
			return "";
		},
		windows_lite: function () {
			return "";
		},
		chinese_windows: function () {
			return "";
		},
		chinese_macos: function () {
			return "";
		},
		macos : function () {
			return "";
		},
		windows : function () {
			return "";
		},
		linux : function () {
			return "";
		},
		docker : function () {
			return "";
		},
		armv6 : function () {
			return "";
		},
		armv7 : function () {
			return "";
		},
		version : function () {
			return "v0.1.0";
		},
		blog : function () {
			return "http://blog.lisk.io";
		},
		liskcli : function () {
			return "https://www.npmjs.com/package/lisk-cli";
		},
		dapptoolkit : function () {
			return "";
		},
		sourcecode : function () {
			return "";
		},
		liskchat_windows: function () {
			return "http://downloads.lisk.io/lisk_chat.exe";
		},
		liskchat_macos: function () {
			return "http://downloads.lisk.io/lisk_chat.dmg";
		},
		liskchat_linux: function () {
			return "http://downloads.lisk.io/lisk_chat.deb";
		},
		documentation: function () {
			return "";
		},
		dappstore: function () {
			return "https://store.lisk.io/";
		},
		login: function () {
			return "https://login.lisk.io/";
		}
	}
});

app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

for (var page in routes) {
	routes[page](app);
}

app.use(function(req, res, next) {
	res.status(404).send('Sorry cant find that!');
});

request({
	type: "GET",
	url: "http://coinmarketcap-nexuist.rhcloud.com/api/xcr",
	json: true
}, function (err, resp, body) {
	if (err) {
		return console.error("Can't get market cap from coinmarketcap.com: " + err.toString());
	}

	market = body.market_cap.usd.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commata for better readability

	app.listen(config.port, function (err) {
		if (err) {
			console.error(err);
		} else {
			console.log("Server started at: " + config.port);

			// Olivier, why does this needs to be running? Else I get an error at the documentation page?!
			require('slackin')({
				token: 'xoxp-2492587921-2547273463-9445538033-1ff136',
				interval: 300000,
				org: 'crypti',
				channels: 'public,',
				silent: false
			}).listen(3000);
		}
	})
});
