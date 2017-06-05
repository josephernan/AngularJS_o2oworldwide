app.factory( 'SMHomepage_Entity', [
  'storeService',
  '$http',

    function($store, $http) {

      return function(config) {
        var service = {
          // Public Varables
          data: {
            id: null,
            b2_id: null,
            type: null,
            key: null,
            value: null,
            value1: null,
            value2: null,
            value3: null,
            active: null,
            created_by: 0,
            modified_by: 0,
            deleted_by: 0,
            modified: '0000-00-00 00:00:00',
            created: '0000-00-00 00:00:00'
          }
        };

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

        service.copy = function() {
          return angular.copy(service);
        };

        service.save = function() {
          console.log('save');
          return $http.jsonp($store.jsonp_url('sm_homepage/save', service.data))
            .then(function(res) {
              console.log('res');
              console.log(res);
              return res;
            });
        }


        // setup all of the default _data_access methods
        _.map(service.data, function(val, key) {
          if (!_.isEmpty(key)) {
            return _.set(service, key, service._data_accessor(key));
          }
        });

        if (!_.isEmpty(config)) {
          _.map(config, function(value, key) {
            if (!_.isEmpty(key)) {
              return _.set(service.data, key, value);
            }
          })
        };

        return service;
      }
    }
  ]
);

app.factory( 'SMHomepage_Banner', [
  'storeService',
  'SMHomepage_Entity',

    function($store, SMHomepage_Entity) {

      return function (config) {

        if (!_.isEmpty(config)) {
          if (!_.get(config, 'key')) {
            config.key = "New Banner"
          }
          if (!!_.get(config, 'value1')) {
            config.value1 = _.toInteger(config.value1);
          }
          if (!_.get(config, 'value2')) {
            config.value3 = $store.base_url()
          }
          if (!_.get(config, 'value3')) {
            config.value3 = "#EEEEEE"
          }
        } else {
          config = {
            value1: 100,
            value2: 'http://' + $store.replicated_url(),
            value3: '#EEEEEE'
          };
        }

        var service = angular.extend(new SMHomepage_Entity(config), {});

        service.name = service._data_accessor('key');
        service.src = service._data_accessor('value');
        service.link = service._data_accessor('value2');
        service.background_color =  service._data_accessor('value3');

        service.sort = function(val) {
          val = _.toInteger(val);
          return service._data_access('value1', val);
        }

        return service;
      };
    }
  ]
);
