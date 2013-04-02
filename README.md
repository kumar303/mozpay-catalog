# mozpay-catalog

This is an *experimental* prototype of a product catalog server for
[navigator.mozPay()](https://developer.mozilla.org/en-US/docs/Apps/Publishing/In-app_payments).

If successful, this could let developers do in-app payments without
hosting their own server. I.E. Mozilla would provide a server such as this one.

The exact developer API needs more work and should ultimately be an
extension of navigator.mozPay(). See the
[discussion](https://groups.google.com/d/msg/mozilla.dev.webapps/0vUFHASyWB4/Xl7GbJVAeooJ)
for gory details.

## Run the server

You need to host the server on a public IP such as a
[Stackato PAAS](http://www.activestate.com/stackato)
or locally with a [tunnel](http://progrium.com/localtunnel/).

Let's get started!

    npm install
    cp settings-dist.js settings.js

Get an Application Key and Application Secret from the
[Firefox Marketplace Dev Hub](https://marketplace.firefox.com/developers/).
You probably want to start by
[getting a key for simulations](https://marketplace.firefox.com/developers/in-app-keys/).
Edit settings.js and fill in the keys.

Run a local server:

    npm start

Or upload to Stackato:

    stackato push

Update the Stackato app with:

    stackato update

Open up the app in a
[Firefox OS](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS)
browser and purchase one of the items such as the Magic Cheese.
You can see a test version of the app running here:
[http://mozpay-catalog.paas.allizom.org/](http://mozpay-catalog.paas.allizom.org/).

Take a look at `www/js/index.js` to see the developer API.
