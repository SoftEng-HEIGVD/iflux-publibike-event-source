var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	dotenv = require('dotenv'),
	env = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV != 'docker') {
	dotenv.load();
}

var config = {
  development: {
		apiUrl: process.env.IFLUX_API_URL,
		interval: process.env.PUBLIBIKE_POLL_INTERVAL || 10000
  },

  test: {
		apiUrl: process.env.IFLUX_API_URL,
		intervall: process.env.PUBLIBIKE_POLL_INTERVAL || 10000
	},

  production: {
		apiUrl: process.env.IFLUX_API_URL,
		interval: process.env.PUBLIBIKE_POLL_INTERVAL || 600000
  },

	docker: {
		apiUrl: process.env.IFLUX_API_URL,
		interval: process.env.PUBLIBIKE_POLL_INTERVAL || 60000
	}
};

module.exports = config[env];
