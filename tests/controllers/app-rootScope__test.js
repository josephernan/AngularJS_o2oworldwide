describe('app.js', function() {
  beforeEach(module('o2o_store'));

  describe('run', function() {
    describe('$rootScope', function() {

      var $rootScope;
      beforeEach(inject(function(_$rootScope_) {
        $rootScope = _$rootScope_;
      }));

      it('- to be a scope', function() {
        expect($rootScope).not.toBeUndefined();
        expect(typeof $rootScope.$apply).toBe('function');
      });

      describe('- $scope.lang', function() {

        it('- to exist and to be an object', function() {
          expect($rootScope.lang).not.toBeUndefined();
          expect(typeof $rootScope.lang).toBe('object');
        });

        describe('- available()', function() {
          it('- given no paramaters should return all avaible languages', function() {
            expect($rootScope.lang.available().length >= 2).toBeTruthy();
            expect($rootScope.lang.available().indexOf('en')).not.toBe(-1);
            expect($rootScope.lang.available().indexOf('zh')).not.toBe(-1);
          });

          describe('languages should be avaible', function() {
            it('"en"', function() {
              expect($rootScope.lang.available("en")).toBeTruthy();
              expect($rootScope.lang.available("en_US")).toBeTruthy();
              expect($rootScope.lang.available("en_us")).toBeTruthy();
              expect($rootScope.lang.available("en-US")).toBeTruthy();
              expect($rootScope.lang.available("en-us")).toBeTruthy();
            });
            it('"zh"', function() {
              expect($rootScope.lang.available("zh")).toBeTruthy();
              expect($rootScope.lang.available("zh_hans")).toBeTruthy();
              expect($rootScope.lang.available("zh_Hans")).toBeTruthy();
              expect($rootScope.lang.available("zh-Hans")).toBeTruthy();
              expect($rootScope.lang.available("zh-hans")).toBeTruthy();
              expect($rootScope.lang.available("zh-cn")).toBeTruthy();
              expect($rootScope.lang.available("zh-Cn")).toBeTruthy();
              expect($rootScope.lang.available("zh_cn")).toBeTruthy();
              expect($rootScope.lang.available("zh_Cn")).toBeTruthy();
            });
          });

          describe('un-recognized language', function() {
            it('"us"', function() {
              expect($rootScope.lang.available("us")).not.toBeTruthy();
            });
            it('"英语"', function() {
              expect($rootScope.lang.available("英语")).not.toBeTruthy();
            });
          });

        }); // available()

        it('- current', function() {
          expect(typeof $rootScope.lang.current).toBe('function');
        });

        describe('- changeLanguage', function() {
          beforeEach(function() {
            $rootScope.lang.changeLanguage('en');
          });

          it('exists & isFunction', function() {
            expect(typeof $rootScope.lang.changeLanguage).toBe('function');
          });

          it('correctly initalize to en', function() {
            expect($rootScope.lang.current()).toBe('en');
          });

          it('can change', function() {
            $rootScope.lang.changeLanguage('zh')
              .then(function(){
                expect($rootScope.lang.current()).toBe('zh');
              });
          });

        });

      });

    });
  });

});
