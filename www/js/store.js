$$(document).on('page:init', '.page[data-name="store"]', function () {
  let storeProductAPIEndpointURL = API + '/store_products';

  $.getJSON(storeProductAPIEndpointURL)
    .done(function(resp) {
      initStore(resp);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });

  function initStore(resp) {
    let products = resp.store_products;
    products.forEach(function(product) {
      product.price /= 100;
      if (product.image_url === "") {
        product.image_url = "img/missing_thumb.png";
      }
    });

    let templateHTML = app.templates.storeTemplate({products: products});
    let storeContainer = $('.store-content');
    storeContainer.html(templateHTML);

    $('.buy-product').on('click', function() {
      buyBtn = $(this);
      productId = buyBtn.attr('data-id');
      buyProduct(productId);
    });
  }

  function buyProduct(id) {
    $.ajax({
      url: API + '/store_orders',
      type: 'POST',
      dataType: 'json',
      data: {
        "item": {
          "id": id,
          "quantity": 1
        }
      },
      success: function(resp) {
        app.dialog.alert(resp.success, 'Varan är köpt');
      },
      error: function(resp) {
        app.dialog.alert(resp.responseJSON.error);
      }
    });
  }
});
