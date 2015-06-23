var
	_ = require('underscore'),
	domain = require('domain'),
	d = domain.create(),
	iFluxClient = require('iflux-node-client').Client,
	Event = require('iflux-node-client').Event,
	restClient = new (require('node-rest-client').Client)(),
	config = require('./config/config');

d.on('error', function(err) {
	console.log("Unable to poll publibike data.");
	console.log(err);
});

var iFluxClient = new iFluxClient(config.apiUrl);
var delay = 1000 * 60 * 5;

var publibikeApiEndpoint = "https://www.publibike.ch/myinterfaces/terminals.fr.json?filterid=0&stationArrow=show%20all%20stations";

var lastSnapshot = [];

var poll = function (callback) {
  console.log("Polling PubliBike data...");
  restClient.get(publibikeApiEndpoint, function (data, response) {
	  if (response.statusCode != 200) {
		  console.log('Unable to retrieve the data from publibike. Server has returned: %s', response.statusCode);
		  return lastSnapshot;
	  }

    // PubliBike does not send application/json in the Content-type header, so rest client does not parse automatically
    try {
			data = JSON.parse(data.toString());
		}
		catch (err) {
			console.log(err);
			return lastSnapshot;
		}

    terminals = data.terminals;

	  if (!terminals) {
		  console.log('Unable to get the terminals data');
		  return lastSnapshot;
	  }

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
  d.run(function() {
		poll(function (movements) {
			var events = [];

			_.each(movements, function (movement) {
				events.push(new Event(config.eventType, movement));
			});

			if (events.length > 0) {
				console.log("Events to send: %s", events.length);
				iFluxClient.notifyEvents(events);
			}
			else {
				console.log("No events");
			}
		});
	});
};

monitorBikes();
setInterval(monitorBikes, config.interval);