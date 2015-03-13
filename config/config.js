var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'),
	dotenv = require('dotenv'),
	env = process.env.NODE_ENV || 'development';

dotenv.load();

var config = {
  development: {
    root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
    app: {
      name: 'PubliBike Events'
    }
  },

  test: {
		root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
  	app: {
    	name: 'PubliBike Events'
  	}
	},

  production: {
		root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
		app: {
			name: 'PubliBike Events'
		}
  },

	docker: {
		root: rootPath,
		iflux: {
			url: process.env.IFLUX_SERVER_URL || 'https://iflux.herokuapp.com'
		},
		app: {
			name: 'PubliBike Events'
		}
	}
};

module.exports = config[env];
