angular.module( 'ngCart', [ 'ngCart.directives', 'LocalStorageModule' ] )

.config( [ function () {

} ] )

.provider( '$ngCart', function () {
  this.$get = function () {};
} )

.run( [ '$rootScope', 'ngCart', 'ngCartItem', 'localStorageService', function ( $rootScope, ngCart, ngCartItem, localStorageService ) {

  /* EDIT : Tyler Wall - added $cart to $rootScope - 2.23.16 */
  if ( !( '$cart' in $rootScope ) ) {
    $rootScope.$cart = ngCart;
  }
  /* end EDIT */

  $rootScope.$on( 'ngCart:change', function () {
    ngCart.$save();
  } );

  var recovered_cart = angular.fromJson(localStorageService.get( 'cart' ));

  if ( angular.isObject( recovered_cart ) ) {
    ngCart.$restore( recovered_cart );
  } else {
    ngCart.init();
  }

} ] )

.service( 'ngCart', [ '$rootScope', 'ngCartItem', 'localStorageService', function ( $rootScope, ngCartItem, localStorageService ) {

  this.init = function () {
    this.$cart = {
      shipping: null,
      taxRate: null,
      tax: null,
      items: []
    };
  };

  this.addItem = function ( quantity, data ) {

    var inCart = this.getItemBySku( data.sku );

    if ( typeof inCart === 'object' ) {
      //Update quantity of an item if it's already in the cart
      inCart.setQuantity( quantity, false );
    } else {
      var newItem = new ngCartItem( quantity, data );
      this.$cart.items.push( newItem );
      $rootScope.$broadcast( 'ngCart:itemAdded', newItem );
    }

    $rootScope.$broadcast( 'ngCart:change', {} );
  };

  this.getItemBySku = function ( itemSku ) {
    var items = this.getCart().items;
    var build = false;

    angular.forEach( items, function ( item ) {
      if ( item.getSku() === itemSku ) {
        build = item;
      }
    } );
    return build;
  };

  this.setShipping = function ( shipping ) {
    this.$cart.shipping = shipping;
    return this.getShipping();
  };

  this.getShipping = function () {
    if ( this.getCart().items.length === 0 ) return 0;
    return this.getCart().shipping || 0.00;
  };

  this.setTaxRate = function ( taxRate ) {
    this.$cart.taxRate = +parseFloat( taxRate ).toFixed( 2 );
    return this.getTaxRate();
  };

  this.getTaxRate = function () {
    return this.$cart.taxRate || 0.00;
  };

  this.getTax = function () {
    return +parseFloat( ( ( this.getSubTotal() / 100 ) * this.getCart().taxRate ) ).toFixed( 2 ) || 0.00;
  };

  this.setCart = function ( cart ) {
    this.$cart = cart;
    return this.getCart();
  };

  this.getCart = function () {
    return this.$cart;
  };

  this.getItems = function () {
    return this.getCart().items;
  };

  this.getTotalItems = function () {
    var count = 0;
    var items = this.getItems();
    angular.forEach( items, function ( item ) {
      count += item.getQuantity();
    } );
    return count;
  };

  this.getTotalItemsForSummary = function () {
    var count = this.getTotalItems();
    return ( count >= 100 ) ? '99+' : count;
  }

  this.getTotalUniqueItems = function () {
    return this.getCart().items.length;
  };

  this.getSubTotal = function () {
    var total = 0;
    angular.forEach( this.getCart().items, function ( item ) {
      total += item.getTotal();
    } );
    return +parseFloat( total ).toFixed( 2 );
  };

  this.totalCost = function () {
    return +parseFloat( this.getSubTotal() + this.getShipping() + this.getTax() ).toFixed( 2 ) || 0.00;
  };

  this.removeItem = function ( index ) {
    this.$cart.items.splice( index, 1 );
    $rootScope.$broadcast( 'ngCart:itemRemoved', {} );
    $rootScope.$broadcast( 'ngCart:change', {} );

  };

  this.removeItemBySku = function ( sku ) {
    var cart = this.getCart();
    angular.forEach( cart.items, function ( item, index ) {
      if ( item.getSku() === sku ) {
        cart.items.splice( index, 1 );
      }
    } );
    this.setCart( cart );
    $rootScope.$broadcast( 'ngCart:itemRemoved', {} );
    $rootScope.$broadcast( 'ngCart:change', {} );
  };

  this.empty = function () {
    $rootScope.$broadcast( 'ngCart:change', {} );
    this.$cart.items = [];
    localStorage.removeItem( 'cart' );
  };

  /* ADDED Tyler Wall - 6/6/16 */
  this.reset = function() {
    return this.init();
  };
  /* end added */

  this.toObject = function () {

    if ( this.getItems().length === 0 ) return false;

    var items = [];
    angular.forEach( this.getItems(), function ( item ) {
      items.push( item.toObject() );
    } );

    return {
      shipping: this.getShipping(),
      tax: this.getTax(),
      taxRate: this.getTaxRate(),
      subTotal: this.getSubTotal(),
      totalCost: this.totalCost(),
      items: items
    };
  };

  this.$restore = function ( storedCart ) {
    var _self = this;
    _self.init();
    _self.$cart.shipping = storedCart.shipping;
    _self.$cart.tax = storedCart.tax;

    angular.forEach( storedCart.items, function ( item ) {
      _self.$cart.items.push( new ngCartItem( item._quantity, item._data ) );
    } );

    this.$save();
  };

  this.$save = function () {
    return localStorageService.set( 'cart', JSON.stringify( this.getCart() ) );
  };

} ] )

.factory( 'ngCartItem', [ '$rootScope', '$log', function ( $rootScope, $log ) {

  var item = function ( quantity, data ) {

    // console.log('typeof data');
    // console.log(typeof data);
    // console.log(_.isObject(data));
    // console.log(data);

    if ( !_.isObject(data)) {
      var _data = angular.fromJson( data );
      if (!!_data) {
        data = _data;
      }
    }

    if (!!_.get(data, 'sku')) {
      this.setSku(_.get(data, 'sku'));
      this.setName(_.get(data, 'name'));
      this.setPrice(_.get(data, 'price'));
      this.setQuantity(
        (quantity > 0)
          ? quantity
          : (_.get(data, 'quantity') > 0)
            ? data.quantity
            : 1
      );

      this.setData( data );
      return true;
    }
    return false;
  };

  item.prototype.setSku = function ( sku ) {
    if ( sku ) this._sku = sku;
    else {
      $log.error( 'An SKU must be provided' );
    }
  };

  item.prototype.getSku = function () {
    return this._sku;
  };

  item.prototype.setName = function ( name ) {
    if ( name ) this._name = name;
    else {
      $log.error( 'A name must be provided' );
    }
  };
  item.prototype.getName = function () {
    return this._name;
  };

  item.prototype.setPrice = function ( price ) {
    var priceFloat = parseFloat( price );
    if ( priceFloat ) {
      if ( priceFloat <= 0 ) {
        $log.error( 'A price must be over 0' );
      } else {
        this._price = ( priceFloat );
      }
    } else {
      $log.error( 'A price must be provided' );
    }
  };
  item.prototype.getPrice = function () {
    return this._price;
  };

  item.prototype.setQuantity = function ( quantity, relative ) {

    var quantityInt = parseInt( quantity );
    if ( quantityInt % 1 === 0 ) {
      if ( relative === true ) {
        this._quantity += quantityInt;
      } else {
        this._quantity = quantityInt;
      }
      if ( this._quantity < 1 ) this._quantity = 1;

    } else {
      this._quantity = 1;
      $log.info( 'Quantity must be an integer and was defaulted to 1' );
    }
    $rootScope.$broadcast( 'ngCart:change', {} );

  };

  item.prototype.getQuantity = function () {
    return this._quantity;
  };

  item.prototype.setData = function ( data ) {
    if ( data ) this._data = data;
  };

  item.prototype.getData = function () {
    if ( this._data ) return this._data;
    else $log.info( 'This item has no data' );
  };

  item.prototype.getTotal = function () {
    return +parseFloat( this.getQuantity() * this.getPrice() ).toFixed( 2 );
  };

  item.prototype.toObject = function () {
    return {
      data: this.getData(),
      quantity: this.getQuantity(),
      total: this.getTotal()
    };
  };

  return item;

} ] )

.controller( 'CartController', [ '$scope', 'ngCart', function ( $scope, ngCart ) {
  $scope.ngCart = ngCart;

} ] )

angular.module( 'ngCart.directives', [ 'ngCart.fulfilment' ] )

.controller( 'CartController', [ '$scope', 'ngCart', function ( $scope, ngCart ) {
  $scope.ngCart = ngCart;
} ] )

.directive( 'ngcartAddtocart', [ 'ngCart', '$state', function ( ngCart, $state ) {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {
      data: '=product'
    },
    transclude: true,
    templateUrl: 'views/partials/ngCart/addtocart.html',
    link: function ( scope, element, attrs ) {

      scope.inCart = function () {
        return ngCart.getItemBySku( scope.data.sku );
      };

      scope.add_to_cart_clicked = function (q, data) {
        ngCart.addItem(q, data);

        if ('clickState' in attrs && attrs.clickState) {
          var params = ('clickStateParams' in attrs && attrs.clickStateParams) ? attrs.clickStateParams : {};
          $state.go(attrs.clickState, params);
        }

        // if ('click-state')
        // $state.go('root.checkout')
      }

      if ( scope.inCart() ) {
        scope.q = ngCart.getItemBySku( scope.data.sku ).getQuantity();
      } else if ( scope.hasOwnProperty( 'quantity' ) ) {
        scope.q = parseInt( scope.quantity );
      } else {
        scope.q = 1;
      }
    }

  };
} ] )

.directive( 'ngcartCart', [ function () {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {},
    templateUrl: 'views/partials/ngCart/cart.html',
    link: function ( scope, element, attrs ) {

    }
  };
} ] )

.directive( 'ngcartSummary', [ function () {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {
      summaryType: '@'
    },
    transclude: true,
    // templateUrl: 'views/partials/ngCart/summary.html'
    templateUrl: function(scope, element, attrs) {
      if ('summaryType' in element && element.summaryType !== undefined) {
        if (element.summaryType.toLowerCase().trim() === 'badge') {
          return 'views/partials/ngCart/summary_badge.html';
        }
      }
      return 'views/partials/ngCart/summary.html';
    }
  };
} ] )

.directive( 'ngcartCheckout', [ function () {
  return {
    restrict: 'AE',
    controller: ( 'CartController', [ '$scope', 'ngCart', 'fulfilmentProvider', function ( $scope, ngCart, fulfilmentProvider ) {
      $scope.ngCart = ngCart;

      $scope.checkout = function () {
        fulfilmentProvider.setService( $scope.service );
        fulfilmentProvider.setSettings( $scope.settings );
        var promise = fulfilmentProvider.checkout();
        console.log( promise );
      };
    } ] ),
    scope: {
      service: '@',
      settings: '='
    },
    transclude: true,
    templateUrl: 'views/partials/ngCart/checkout.html'
  };
} ] );
angular.module( 'ngCart.fulfilment', [] )
.service( 'fulfilmentProvider', [ '$injector', function ( $injector ) {

  this._obj = {
    service: undefined,
    settings: undefined
  };

  this.setService = function ( service ) {
    this._obj.service = service;
  };

  this.setSettings = function ( settings ) {
    this._obj.settings = settings;
  };

  this.checkout = function () {
    var provider = $injector.get( 'ngCart.fulfilment.' + this._obj.service );
    return provider.checkout( this._obj.settings );

  };

} ] )

.service( 'ngCart.fulfilment.log', [ '$q', '$log', 'ngCart', function ( $q, $log, ngCart ) {

  this.checkout = function () {

    var deferred = $q.defer();

    $log.info( ngCart.toObject() );
    deferred.resolve( {
      cart: ngCart.toObject()
    } );

    return deferred.promise;

  };

} ] )

.service( 'ngCart.fulfilment.http', [ '$http', 'ngCart', function ( $http, ngCart ) {

  this.checkout = function ( settings ) {
    return $http.post( settings.url, {
      data: ngCart.toObject()
    } );
  };
} ] )

.service( 'ngCart.fulfilment.paypal', [ '$http', 'ngCart', function ( $http, ngCart ) {

} ] )

.value( 'version', '0.0.3-rc.1' );
