const NodeGeocoder = require('node-geocoder');

const options = {
  name: 'mapquest',
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: 'QFOX4sxyImtwcWrYhCiDwhE5zHD4vBE5',
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
