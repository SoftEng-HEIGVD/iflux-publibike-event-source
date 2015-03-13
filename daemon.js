var iFluxClient = require('iflux-node-client').Client;
var Event = require('iflux-node-client').Event;
var RestClient = require('node-rest-client').Client;
var restClient = new RestClient();
var Keen = require('keen.io');

var keenClient = Keen.configure({
  projectId: "54c647ae59949a27dfbc01c4",
  writeKey: "4baa1100fbc3a6bfc7523961689ed43b92957bdc699bbfab8f81e5c9ea26cae0dcf41a7fba5ca52436c947969dc40f36fcee944db1557b65c13b8531f6ff942359a11d071a4e3d79b5a701d4d98a2b4b38767a7aee21fc347bf29d12478e9f2f0199043fde5e5c4d2412c4a6fb7a956d"
});

var iFluxClient = new iFluxClient("https://iflux.herokuapp.com");
var delay = 1000 * 60 * 5;

var publibikeApiEndpoint = "https://www.publibike.ch/myinterfaces/terminals.fr.json?filterid=0&stationArrow=show%20all%20stations";

var lastSnapshot = [];

var poll = function (callback) {
  console.log("Polling PubliBike data...");
  restClient.get(publibikeApiEndpoint, function (data, response) {

    // PubliBike does not send application/json in the Content-type header, so rest client does not parse automatically
    if (typeof data === "string") {
      data = JSON.parse(data);
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

    //console.log("Last snapshot: ");
    //console.log(lastSnapshot);

    lastSnapshot = summary;
    console.log(delta);
    callback(delta);
  });
};

var monitorBikes = function () {
  poll(function (movements) {
    for (var i = 0; i < movements.length; i++) {
      var event = new Event("io.iflux.events.citybike-event", movements[i]);
      console.log(event);
      iFluxClient.notifyEvent(event);

      // send single event to Keen IO
      keenClient.addEvent("terminalEvents", movements[i], function (err, res) {
        if (err) {
          console.log("Oh no, an error!");
        } else {
          console.log("Hooray, it worked!");
        }
      });
    }
  });
};


monitorBikes();
setInterval(monitorBikes, 10000);