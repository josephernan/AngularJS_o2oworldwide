describe('store_factory.js', function() {
  beforeEach(module('o2o_store'));

  var store = null;
  beforeEach(inject(function(storeService) {
    store = storeService;
  }));

  describe('- init', function() {
    it('exists', function() {
      expect(store).not.toBeUndefined();
      expect(store.status).toBe(false);
    });

    it('base_store', function() {
      // base_store
      expect(Object.keys(store.countries).length).toBe(0);
      expect(Object.keys(store.zones).length).toBe(0);
      expect(store.products.length).toBe(0);
      expect(Object.keys(store.categories).length).toBe(0);
      expect(Object.keys(store.brands).length).toBe(0);
      expect(Object.keys(store.commissions_table).length).toBe(0);
      expect(store.yuan_conversion_rate).toBe(1);
    });
    it('base_store__user', function() {
      expect(store.featured_products.length).toBe(0);
      expect(store.marketer_products).toBe(false);
      expect(store.user).toBe(false);
      expect(store.marketer.user).toBe(false);
      expect(store.marketer.about).toBe(false);
      expect(store.marketer.products).toBe(false);
      expect(Object.keys(store.orders).length).toBe(0);
      expect(Object.keys(store.customer_orders).length).toBe(0);
      expect(store.commissions.total_sales).toBe(0.00);
      expect(store.commissions.commission_percentage).toBe(0.00);
      expect(store.business_center).toBe(false);
    });
  });

  describe('url generation', function() {
    it('- base_url(slug)', function() {
      expect(store.base_url()).toBe('http://phoenix.o2o.local/');
      expect(store.base_url('123')).toBe('http://phoenix.o2o.local/123');
      expect(store.base_url(123)).toBe('http://phoenix.o2o.local/123');
      expect(store.base_url(false)).toBe('http://phoenix.o2o.local/');
      expect(store.base_url(null)).toBe('http://phoenix.o2o.local/');
    });

    it('- site_url(slug)', function() {
      expect(store.site_url()).toBe('http://phoenix.o2o.local/');
      expect(store.site_url('123')).toBe('http://phoenix.o2o.local/123');
      expect(store.site_url(123)).toBe('http://phoenix.o2o.local/123');
      expect(store.site_url(false)).toBe('http://phoenix.o2o.local/');
      expect(store.site_url(null)).toBe('http://phoenix.o2o.local/');
    });

    // // TODO: make this $location injection work :)
    // describe('[localhost:9022]', function() {
    //   beforeEach(inject(function($location) {
    //     spyOn($location, 'host').andReturn('localhost:9022');
    //   }));
    //
    //   it('- base_url(slug)', function() {
    //     expect(store.base_url()).toBe('http://phoenix.o2o.local/');
    //     expect(store.base_url('123')).toBe('http://phoenix.o2o.local/123');
    //     expect(store.base_url(123)).toBe('http://phoenix.o2o.local/123');
    //     expect(store.base_url(false)).toBe('http://phoenix.o2o.local/');
    //     expect(store.base_url(null)).toBe('http://phoenix.o2o.local/');
    //   });
    //
    //   it('- site_url(slug)', function() {
    //     expect(store.site_url()).toBe('http://phoenix.o2o.local/');
    //     expect(store.site_url('123')).toBe('http://phoenix.o2o.local/123');
    //     expect(store.site_url(123)).toBe('http://phoenix.o2o.local/123');
    //     expect(store.site_url(false)).toBe('http://phoenix.o2o.local/');
    //     expect(store.site_url(null)).toBe('http://phoenix.o2o.local/');
    //   });
    // });

    
  });

});
