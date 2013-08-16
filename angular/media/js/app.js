

function MainController($scope, $route, $routeParams, $location) {
  $scope.name = "MainController";
}

function DetailController($scope, $routeParams) {
  $scope.name = "DetailController";
  console.log($scope.name, arguments);
  $scope.params = $routeParams;
}
