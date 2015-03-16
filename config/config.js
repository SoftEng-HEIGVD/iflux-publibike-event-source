var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	dotenv = require('dotenv'),
	env = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV != 'docker') {
	dotenv.load();
}

var config = {
  development: {
    root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
    app: {
      name: 'PubliBike Events',
			interval: 10000
    }
  },

  test: {
		root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
  	app: {
    	name: 'PubliBike Events',
			intervall: 10000
  	}
	},

  production: {
		root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
		app: {
			name: 'PubliBike Events',
			interval: 600000
		}
  },

	docker: {
		root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
		app: {
			name: 'PubliBike Events',
			interval: 300000
		}
	}
};

module.exports = config[env];
