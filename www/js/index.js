if (!navigator.mozPay) {
  var msg = 'navigator.mozPay() must be defined. Try again in Firefox OS.';
  $('#error').text(msg);
}

var _mozPay_purchase = function(id, done) {
  console.log('start purchase for', id);

  function waitForResult(transID, opt) {
    opt = opt || {tries: 1};
    if (opt.tries > 10) {
      throw new Error('could not find transaction after 10 tries');
    }
    console.log('checking transaction', transID);
    $.get('/transaction/' + transID)
      .done(function(data, textStatus, jqXHR) {
        if (data.state == 'pending') {
          setTimeout(function() { waitForResult(transID, {tries: opt.tries + 1}) },
                     1000);
        } else {
          console.log('got result for transID', transID, data.state);
          if (data.state == 'completed') {
            done();
          } else {
            done('invalid completion state: ' + data.state);
          }
        }
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('error waiting for transaction:', textStatus, errorThrown);
      });
  }

  $.post('/purchase/' + id)
    .done(function(data, textStatus, jqXHR) {
      var jwt = data.jwt;
      var req = navigator.mozPay([jwt]);
      req.onsuccess = function() {
        waitForResult(data.transID);
      };
      req.onerror = function() {
        done(this.error.name);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('error starting purchase:', textStatus, errorThrown);
    });
}

$(function() {

  $('ul').on('click', '.product button', function() {
    var id = $(this).data('productId');
    var prod = $(this).data('product');
    console.log('purchasing', prod.name, id);
    _mozPay_purchase(id, function(error) {
      if (error) {
        console.log('error purchasing', id, ':', error);
      } else {
        $('#your-products ul li.placeholder').remove();
        addProduct($('#your-products ul'), id, prod, {showBuy: false});
      }
    });
  });

  function addProduct(parent, prodID, prod, opt) {
    opt = opt || {showBuy: true};
    var li = $('<li></li>', {class: 'product'});
    li.append($('<img />', {src: prod.icons['64'], height: 64, width: 64}));
    if (opt.showBuy) {
      li.append($('<button>Buy</button>').data({productId: prodID, product: prod}));
    }
    li.append($('<h3>' + prod.name + '</h3>'));
    li.append($('<p>' + prod.description + '</p>'));
    li.append($('<div></div>', {class: 'clear'}));
    parent.append(li);
  }

  $.get('/catalog')
    .done(function(data, textStatus, jqXHR) {
      var ul = $('#products ul');
      for (var prodID in data.products) {
        var prod = data.products[prodID];
        addProduct(ul, prodID, prod);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log('error getting catalog:', textStatus, errorThrown);
    });
});
