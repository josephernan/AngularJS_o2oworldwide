// Ment to test and make sure karma-jasmine enviroments are working correctly

describe('Karma-Jasmine Testing', function(){
  describe('Array', function() {
    describe('#indexOf()', function() {
      it('should return -1 when the value is not present', function() {
        expect([1,2,3].indexOf(5)).toBe(-1);
        expect([1,2,3].indexOf(0)).toBe(-1);
      });
    });
  });
});
