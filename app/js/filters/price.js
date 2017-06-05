app.filter('price', ['$filter',
    function($filter) {
        return function (o2o_price, scope) {

          var price = parseFloat(o2o_price).toFixed(2);
          var currency_char = '$';

          if (scope.$root.lang.current() !== 'en' && scope.$root.$store.yuan_conversion_rate && scope.$root.$store.yuan_conversion_rate > 0) {
            price = parseFloat(Math.round( (o2o_price * scope.$root.$store.yuan_conversion_rate) * 100) / 100 ).toFixed(2);
            currency_char = '¥';
          }

          var ret = $filter('currency')(price, currency_char);

          scope.$on( 'langKey', function (langKey) {
            if (langKey !== 'en') {
              price = parseFloat(Math.round( (o2o_price * scope.$root.$store.yuan_conversion_rate) * 100) / 100 ).toFixed(2);
              currency_char = '¥';
            }

            ret =  $filter('currency')(price, currency_char);
          });

          return ret;
        };
    }
]);
