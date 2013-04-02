exports.apply = function(config) {
  // Get these keys from the Firefox Marketplace.
  config.mozPayKey = null;
  config.mozPaySecret = null;
  // When not null, simulate this result instead of making a real purchase.
  config.simulate = {result: 'postback'};

  // Basic support for Stackato PAAS.
  var isStackato = !!process.env.VCAP_APPLICATION;
  var app = isStackato
      ? JSON.parse(process.env.VCAP_APPLICATION)
      : {uris: [config.host]};

  config.host = '0.0.0.0';
  config.port = process.env.VCAP_APP_PORT || 3000;
  config.extHost = app.uris[0];
  config.extPort = process.env.VCAP_APP_PORT ? null: config.port;
}
