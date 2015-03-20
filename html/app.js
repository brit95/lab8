angular.module('weatherNews', ['ui.router'])
.controller('MainCtrl', [
  '$scope',
  'postFactory',
  function($scope, postFactory) {
  	$scope.posts = postFactory.posts;
  }
]);
.factory('postFactory',[function() {
	var o = {
		posts: []
	};
	return o;
}]);
.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home', 
				templateUrl: '/home.html',
				controller: 'MainCtrl'
			});
		$urlRouterProvider.otherwise('home');
	}
]);