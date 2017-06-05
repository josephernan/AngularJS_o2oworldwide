app.factory( 'RMAService', [
  'storeService',
  'localStorageService',
  '$http',
  '$q',

    function(store, localStorageService, $http, $q) {

      var
        default_data_item = {
          returning: false,
          quantity: 0,
          quantity_range: [0, 1],
          reason: null,
          return_category: false,
          comments: null
        },
        _generate_range = function(qty) {
          return _.range(1, (_.toInteger(qty)+1));
        }
        rma_config = {};

      var service = {
        // Public Varables
        data: {
          id: null,
          order: null,
          items: null,

          general_comment: "",

          active: null,
          created_by: 0,
          modified_by: 0,
          deleted_by: 0,
          modified: '0000-00-00 00:00:00',
          created: '0000-00-00 00:00:00',
        },

        has_returning_items: false,

        return_categories: [
          "ship",
          "fulfilment",
          "product",
          "customer",
          "other"
        ],

        return_reasons: {
          "bought_by_mistake": "customer",
          "better_price_available": "other",
          "product_damaged_shipping_box_ok": "other",
          "item_arrived_too_late": "customer",
          "missing_parts_or_accessories": "fulfilment",
          "product_and_box_damaged": "ship",
          "wrong_item": "fulfilment",
          "item_defective_or_doesnt_work": "product",
          "recived_extra_item_didnt_purchase": "fulfilment",
          "no_longer_needed": "customer",
          "didnt_approve_purchase": "customer",
          "inaccurate_website_description": "other",
          "inaccurate_sm_description": "other",
          "other": "other"
        }
      };

      var _load_order = function(in_order) {
        return $q(function(resolve, reject) {
            if (_.isString(in_order)) {
              return resolve (store.get_orders(in_order));
            } else if ( // catching bad orders
                _.get(in_order, 'products') &&
                _.size(in_order.products) == 0 &&
                _.get(in_order, 'id')
              ) {
              return resolve (store.get_orders(in_order.id));
            } else if (!_.get(in_order, 'id')) {
              return reject('general.errors.no_order_found_for_id');
            }

            _.delay(function() {
              // don't hold up the flow
              store.add_orders(in_order);
            }, 2000);

            return resolve(in_order);
          })
          .then(function(_order) {
            var order = angular.copy(_order);
            var order_products = order.products;
            delete order.products;

            service.data.order = order;

            if (_.get(service.data.order, 'order_status_id') && service.data.order.order_status_id >= 100) {
              return $q.all(
                  _.map(order_products, function(order_i, prod_id) {
                    return store.get_product({id: order_i.product_id})
                      .then(function(prod) {


                        if (service.data.items === null) {
                          service.data.items = {};
                        }
                        if (!_.get(service.data.order, 'products')) {
                          service.data.order.products = {};
                        }

                        service.data.order.products[prod_id] = order_i;
                        service.data.order.products[prod_id].product = prod;

                        var item = angular.copy(default_data_item);

                        if (!!_.get(service.data.items, prod_id)) {
                          item = _.merge(item, service.data.items[prod_id]);
                        }

                        if (!!_.get(rma_config, 'review')) {
                          if (!_.get(service.data.items, prod_id + '.returning')) {
                            _.unset(service.data.items, prod_id);
                            _.unset(service.data.order.products, prod_id);
                            return false;
                          }
                        } else {
                          item.quantity_range = _generate_range(service.data.order.products[prod_id].quantity);
                          item.quantity = _.last(item.quantity_range);

                          if (_.get(service.data.items, prod_id + '.returning')) {
                            if (service.data.items[prod_id] && !service.has_returning_items) {
                              service.has_returning_items = true;
                            }
                          }
                          service.data.items[prod_id] = item;
                        }

                        return true;
                      });
                  })
                )
                .then(function() {
                  return $q.resolve(true);
                });
            } else {
              return $q.resolve(false);
            }
          });
        };

      var _load_rma_items = function(rma_items) {
        if (_.size(rma_items) > 0) {
          service.has_returning_items = true;

          return _.map(rma_items, function(rma_item) {
            if (!_.get(service.data.items, rma_item.product_id)) {
              if (!_.get(service.data, 'items')) {
                service.data.items = {};
              }

              _.set(service.data.items, rma_item.product_id, angular.copy(default_data_item));
            }

            // NOTE: item is linked via JS object linking and it is realy a
            //       refrence to the service.data.item
            var item = service.data.items[rma_item.product_id];

            _.map(rma_item, function(v, k) {
              if (item[k] !== v) {
                item[k] = v;
              }
            });

            item.returning = true;
            item.quantity = _.toInteger(rma_item.returning_quantity);
            delete item.returning_quantity;

            item.quantity_range = _generate_range(rma_item.returning_quantity);

            return service.data.items[rma_item.product_id];
          });
        }

        return false;
      };

      var _clean_shrink_input = function(str) {
        return (_.isEmpty(str) || !_.isString(str) || _.size(str) < 1) ? '' : str.replace(/<.*?>/g, '  ').replace(/\s\s+/g, ' ').trim();
      }

      service._data_access = function(data_key, val) {
        if (!_.isEmpty(val)) {
          return _.set(service.data, data_key, val);
        }
        return _.get(service.data, data_key);
      };

      service._data_accessor = function(data_key) {
        return function(val) {
          return service._data_access(data_key, val);
        }
      };


      // Overriding default this.[Object.keys(service.data)](val = null)

      // Custom Functions

      service.returning_onChange = function(val) {
        if (!val) {
          service.has_returning_items = !!(service.has_returning_items && _.size(_.remove(service.data.items, _.get('returning'))));
        } else {
          service.has_returning_items = true;
        }
        return service._data_access('returning', val);
      }

      service.save = function() {
        return $q(function(resolve, reject) {
          // there must be an order.id to save
          if (_.get(service.data, 'order.id') && _.size(service.data.items) > 0) {
            service.data.general_comment = _clean_shrink_input(service.data.general_comment);

            // going through each of the items and making sure their return_reasons is/are set
            _.map(service.data.items, function(v, k) {
              v.comments = _clean_shrink_input(v.comments);

              if (v.quantity > 0) {
                if (_.get(service.return_reasons, v.reason)) {
                  service.data.items[k].return_category = service.return_reasons[v.reason];
                }
              } else {
                // just false, but we're not hard coding it :)
                service.data.items[k].returning = default_data_item.returning;
              }
            });

            var order = service.data.order;
            service.data.order = order.id;

            localStorageService.set('rma.' + order.id, service.data);

            service.data.order = order;

            return resolve(true);
          }
          return reject('general.errors.no_order_found_for_id');
        });
      };

      service.load_from_backend = function(data) {
        // sometimes $http returns a few levels ... lame sauce
        while(!!_.get(data, 'data')) {
          data = data.data;
        }

        return $q(function(resolve, reject) {
          if (
            !!_.get(data, 'order') &&
            !!_.get(data, 'rma_items')
          ) {
            _load_rma_items(data.rma_items);
            
            return _load_order(data.order)
              .then(function() {
                service.data = _.mergeWith(service.data, data.rma);

                return service.save()
                  .then(function() {
                    return resolve(true);
                  });
              });
          }
          reject(false);
        });
      };

      service.load = function(order_id) {
        if (order_id) {
          var data = localStorageService.get('rma.' + order_id);
          if (!!data && !_.isEmpty(data)) {
            service.data = data;
            return true;
          }
        }
        return false;
      };

      service.send = function() {
        return $q(function(resolve, reject) {
          var send_data = angular.copy(service.data);
          send_data.order_id = send_data.order.id;
          delete send_data.order;

          send_data.general_comment = _clean_shrink_input(send_data.general_comment);

          _.map(send_data.items, function(v, k) {
            v.comment = _clean_shrink_input(v.comment);
          });

          $http.jsonp(store.jsonp_url('rma/submit', send_data))
            .then(
              function(_data) {
                var data = _.get(_data, 'data.data'),
                    code = _.get(_data, 'data.code'),
                    msg = _.get(_data, 'data.message');
                if (
                  _.get(data, 'rma') &&
                  (
                    code == 201 ||
                    code == 409
                  )
                ) {
                  return service.load_from_backend(data)
                    .then(function() {
                      resolve(msg);
                    });
                } else {
                  return reject('login.UnableToConnectServer');
                }
              },
              function(_data) {
                var data = _.get(_data, 'data.data');
                var code = _.get(_data, 'data.code');

                if (code === '401') {
                  reject('general.errors.login_required');
                } else if (code === '409') {
                  resolve('rma.existing_rma_found');
                }

                return reject('login.FailedToConnectServer')
              }
            )
        });
      };

      // Returns a promise with the instance
      service.create = function(order_id, config) {
        // setup all of the default _data_access methods
        _.map(service.data, function(val, key) {
          if (!_.isEmpty(key) && !_.isFunction(_.get(service, key))) {
            return _.set(service, key, service._data_accessor(key));
          }
        });

        if (!_.isEmpty(config)) {
          rma_config = config;
        };

        if (_.isEmpty(order_id)) {
          return $q.reject('rma.order_status_ineligible');
        }

        return $q(function(resolve, reject) {
          return $http.jsonp(store.jsonp_url('rma/find', {order_id: order_id}))
            .then(
              function(data) {
                // if the backend
                if (!!_.get(data, 'data.status') && !!_.get(data, 'data.data.rma')) {
                  return service.load_from_backend(data)
                    .then(function() {
                      return resolve(service);
                    });
                }
                return _load_order(order_id)
                  .then(function() {
                    return resolve(service);
                  });
              },
              function(data) {
                return _load_order(order_id)
                  .then(function() {
                    return resolve(service);
                  });
              }
            );
        });
      };

      return service;
    }
  ]
);
