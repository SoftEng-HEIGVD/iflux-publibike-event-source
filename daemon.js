var
	_ = require('underscore'),
	iFluxClient = require('iflux-node-client').Client,
	Event = require('iflux-node-client').Event,
	restClient = new (require('node-rest-client').Client)(),
	config = require('./config/config');

var iFluxClient = new iFluxClient(config.iflux.url, 'publibike/eventSource');
var delay = 1000 * 60 * 5;

var publibikeApiEndpoint = "https://www.publibike.ch/myinterfaces/terminals.fr.json?filterid=0&stationArrow=show%20all%20stations";

var lastSnapshot = [];

var poll = function (callback) {
  console.log("Polling PubliBike data...");
  restClient.get(publibikeApiEndpoint, function (data, response) {

    // PubliBike does not send application/json in the Content-type header, so rest client does not parse automatically
    if (typeof data === "string") {
      try {
				data = JSON.parse(data);
			}
			catch (err) {
				console.log(err);
				return lastSnapshot;
			}
    }

    terminals = data.terminals;

    var summary = terminals.map(function (terminal) {
      var bikeholdersfree = 0;
      var bikeholders = 0;
      for (var j = 0; j < terminal.bikeholders.length; j++) {
        bikeholders += terminal.bikeholders[j].holders;
        bikeholdersfree += terminal.bikeholders[j].holdersfree;
      }
      var bikes = 0;
      for (var j = 0; j < terminal.bikes.length; j++) {
        bikes += terminal.bikes[j].available;
      }

      return {
        terminalid: terminal.terminalid,
        terminal: terminal.name,
        name: terminal.name,
        infotext: terminal.infotext,
        street: terminal.street,
        zip: terminal.zip,
        city: terminal.city,
        country: terminal.country,
        lat: terminal.lat,
        lng: terminal.lng,
        image: terminal.image,

        freeholders: bikeholdersfree,
        bikes: bikes
      };

    });

    if (lastSnapshot.length === 0) {
      lastSnapshot = summary;
      return lastSnapshot;
    };

    var delta = summary.reduce(function (results, terminal, index) {
      if (lastSnapshot[index].freeholders !== terminal.freeholders || lastSnapshot[index].bikes !== terminal.bikes) {
        var terminalInfo = JSON.parse(JSON.stringify(terminal));
        delete terminalInfo.freeholders;
        delete terminalInfo.bikes;
        delete terminalInfo.terminal;

        results.push({
          terminal: terminalInfo,
          old: {
            freeholders: lastSnapshot[index].freeholders,
            bikes: lastSnapshot[index].bikes
          },
          new: {
            freeholders: terminal.freeholders,
            bikes: terminal.bikes
          }
        });
      }
      return results;
    }, []);

    lastSnapshot = summary;
    callback(delta);
  });
};

var monitorBikes = function () {
  poll(function (movements) {
		var events = [];

		_.each(movements, function(movement) {
			events.push(new Event('movementEvent', movement));
		});

		if (events.length > 0) {
			console.log(events);
			iFluxClient.notifyEvents(events);
		}
		else {
			console.log("No events");
		}
  });
};


monitorBikes();
setInterval(monitorBikes, config.app.interval);