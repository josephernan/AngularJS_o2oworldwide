app.service('sharedProperties', function () {
      var properties = {};

      return {
          getProperty: function (key) {
              return properties[key];
          },
          setProperty: function(key, value) {
              properties[key] = value;
          }
      };
  });
