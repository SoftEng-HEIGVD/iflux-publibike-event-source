var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	dotenv = require('dotenv'),
	env = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV != 'docker') {
	dotenv.load();
}

var config = {
  development: {
		apiUrl: process.env.COMMON_IFLUX_API_URL,
		interval: process.env.PUBLIBIKE_POLL_INTERVAL || 10000,
	  source: process.env.PUBLIBIKE_SOURCE,
	  eventType: process.env.PUBLIBIKE_EVENT_TYPE
  },

  test: {
		apiUrl: process.env.COMMON_IFLUX_API_URL,
		intervall: process.env.PUBLIBIKE_POLL_INTERVAL || 10000,
	  source: process.env.PUBLIBIKE_SOURCE,
	  eventType: process.env.PUBLIBIKE_EVENT_TYPE
	},

  production: {
		apiUrl: process.env.COMMON_IFLUX_API_URL,
		interval: process.env.PUBLIBIKE_POLL_INTERVAL || 600000,
	  source: process.env.PUBLIBIKE_SOURCE,
	  eventType: process.env.PUBLIBIKE_EVENT_TYPE
  },

	docker: {
		apiUrl: process.env.COMMON_IFLUX_API_URL,
		interval: process.env.PUBLIBIKE_POLL_INTERVAL || 60000,
		source: process.env.PUBLIBIKE_SOURCE,
		eventType: process.env.PUBLIBIKE_EVENT_TYPE
	}
};

module.exports = config[env];
