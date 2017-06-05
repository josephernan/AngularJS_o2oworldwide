app.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name) {
        if(name === attr.focusOn) {
          console.log(elem[0]);
          window.setTimeout(function() {
            elem[0].focus();
            window.focus_elm = elem[0];
          }, 0);
        }
      });
   };
});
