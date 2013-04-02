var express = require('express');
var qs = require('qs');
var pay = require('mozpay');
var uuid = require('node-uuid');
try {
  var settings = require('./settings');
} catch (er) {
  if (er.code == 'MODULE_NOT_FOUND') {
    console.log('You must create a local settings file:');
    console.log('cp settings-dist.js settings.js');
    console.log('Error:', er);
    return;
  } else {
    throw er;
  }
}

var app = express();
var db = {};  // in-memory database!
var media = __dirname + '/www';


var config = {
  host: '0.0.0.0',
  port: 3000,
  mozPayKey: null,
  mozPaySecret: null,
  mozPayAudience: 'marketplace.firefox.com',
  mozPayType: 'mozilla/payments/pay/v1',
  mozPayRoutePrefix: '/mozpay',
  // When not null, simulate this result instead of making a real purchase.
  simulate: null,
  products: null
};

config.extHost = config.host;
config.extPort = config.port;

settings.apply(config);

if (!config.products) {
  config.products = {
    '1': {
      name: 'Virtual Kiwi',
      description: 'The forbidden fruit',
      icons: {
        '32': absURL('/img/kiwi_32.png'),
        '48': absURL('/img/kiwi_48.png'),
        '64': absURL('/img/kiwi_64.png'),
        '128': absURL('/img/kiwi_128.png'),
      },
      pricePoint: 2
    },
    '2': {
      name: 'Magic Cheese',
      description: 'A majestic wedge of swiss cheese',
      icons: {
        '32': absURL('/img/cheese_32.png'),
        '48': absURL('/img/cheese_48.png'),
        '64': absURL('/img/cheese_64.png'),
        '128': absURL('/img/cheese_128.png'),
      },
      pricePoint: 4
    }
  }
}

function addPort() {
  if (config.extPort) {
    return ':' + config.extPort;
  } else {
    return ''
  }
}

function absURL(path) {
  return 'http://' + config.extHost + addPort() + path;
}

function postbackURL(path) {
   return absURL(config.mozPayRoutePrefix + '/' + path);
}

app.configure(function() {
  app.use(express.logger({format: 'dev'}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

pay.routes(app, config);

app.get('/catalog', function (req, res) {
  res.send({products: config.products});
});

app.get('/transaction/:trans', function (req, res) {
  var transID = req.params.trans;
  if (!db[transID]) {
    res.send(404);
    return;
  }
  res.send({state: db[transID]});
});

app.post('/purchase/:id', function (req, res) {
  var productID = req.params.id;
  var transID = uuid.v4();
  var product = {};
  if (!config.products[productID]) {
    res.send(404);
    return;
  }
  for (var attr in config.products[productID]) {
    product[attr] = config.products[productID][attr];
  }

  db[transID] = 'pending';
  product.id = productID;
  product.productData = qs.stringify({localTransID: transID}),
  product.postbackURL = postbackURL('postback');
  product.chargebackURL = postbackURL('chargeback');
  if (config.simulate) {
    product.simulate = config.simulate;
  }

  res.send({transID: transID, jwt: pay.request(product)});
});

pay.on('postback', function(data) {
  console.log('postback received for ' + data.response.transactionID);
  var transID = qs.parse(data.request.productData).localTransID;
  if (!db[transID]) {
    throw new Error('There is no record of transaction ' + transID);
  }
  console.log('transaction completed:', transID);
  db[transID] = 'completed';
});

pay.on('chargeback', function(data) {
  console.log('chargeback received for ' + data.response.transactionID);
});

app.configure(function() {
  app.use(express.static(media));
});


app.listen(config.port, config.host);
console.log('Listening at ' + config.host + ':' + config.port);
