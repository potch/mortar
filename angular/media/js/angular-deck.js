
(function () {

  angular.module("mortar.deck", ["ui.state"]).config(function($stateProvider) {
    var deck = document.querySelector('x-deck');
    var cards = deck.querySelectorAll('x-card');
    for (var i=0; i<cards.length; i++) {
      var c = cards[i];
      var name = c.getAttribute('card-view');
      var controller = c.getAttribute('ng-controller');
      var route = c.getAttribute('card-route');
      var config = {
        url: route,
        controller: controller,
        views: {}
      };
      config.views[name] = {
        template: c.innerHTML
      };
      $stateProvider.state(name, config);
    }
  });

  $ViewDirective.$inject = ['$state', '$compile', '$controller', '$injector', '$anchorScroll'];
  function $ViewDirective(   $state,   $compile,   $controller,   $injector,   $anchorScroll) {
    var directive = {
      restrict: 'ECA',
      terminal: true,
      link: function(scope, element, attr) {
        var viewScope, viewLocals,
            name = attr[directive.name] || attr.name || '',
            onloadExp = attr.onload || '';

        // Find the details of the parent view directive (if any) and use it
        // to derive our own qualified view name, then hang our own details
        // off the DOM so child directives can find it.
        var parent = element.parent().inheritedData('$cardView');
        if (name.indexOf('@') < 0) name  = name + '@' + (parent ? parent.state.name : '');
        var view = { name: name, state: null };
        element.data('$cardView', view);

        scope.$on('$stateChangeSuccess', updateView);
        updateView();

        function updateView() {
          var locals = $state.$current && $state.$current.locals[name];
          if (locals === viewLocals) return; // nothing to do

          if (locals) {
            viewLocals = locals;
            view.state = locals.$$state;

            var contents;
            element.html(locals.$template);
            contents = element.contents();

            var link = $compile(contents);
            viewScope = scope.$new();
            if (locals.$$controller) {
              locals.$scope = viewScope;
              var controller = $controller(locals.$$controller, locals);
              element.children().data('$ngControllerController', controller);
            }
            link(viewScope);
            viewScope.$emit('$viewContentLoaded');
            viewScope.$eval(onloadExp);

            // TODO: This seems strange, shouldn't $anchorScroll listen for $viewContentLoaded if necessary?
            // $anchorScroll might listen on event...
            $anchorScroll();
          } else {
            viewLocals = null;
            view.state = null;
          }
        }
      }
    };
    return directive;
  }
  angular.module('mortar.deck').directive('cardView', $ViewDirective);

  $RouteDirective.$inject = ['$state', '$controller', '$injector'];
  function $RouteDirective(   $state,   $controller,   $injector) {
    var directive = {
      restrict: 'EA',
      terminal: true,
      link: function(scope, element, attr) {
        console.log($injector.get('$state').state);
        var deck = element.parent();
      }
    };
    return directive;
  }
  angular.module('mortar.deck').directive('cardRoute', $RouteDirective);

  window.addEventListener('DOMComponentsLoaded', function() {
    angular.bootstrap(document, ['mortar.deck']);
  });

})();

function DeckController($scope, $route, $routeParams, $location) {
  var deck = document.querySelector('x-deck');
  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    var card = deck.querySelector('[card-view="' + toState.name + '"]');
    if (card) {
      card.show();
    }
  });
  $scope.$on('$viewContentLoaded', console.log);
}

