// app.factory( 'O2OResource', [
//   'storeService',
//   '$resource',
//     function($store, $resource) {
//
//       return function(uri) {
//
//         var _func_res = function(type) {
//           return $resource(
//               $store.jsonp_url('api/' + uri + '/:id') + '/format/jsonp?callback=JSON_CALLBACK',
//               {},
//               {
//                 'find':      {method:'JSONP'},
//                 'find_all':  {method:'JSONP', isArray:true},
//                 'put':       {method:'JSONP'},
//                 'delete':    {method:'JSONP'}
//               }
//             );
//         };
//
//         $http.jsonp(store.jsonp_url('api/' + uri))
//
//         return {
//           get: _func_res('get'),
//           put: _func_res('put'),
//           post: _func_res('post'),
//           delete: _func_res('delete')
//         };
//       };
//
//     }
//   ]
// );
