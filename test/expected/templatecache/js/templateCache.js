// You must have requirejs + text plugin loaded for this to work.
define(["text!partials/test.html",
"text!partials/test2.html"],function(test_html,
test2_html){
angular.module("ng").run(["$templateCache",function($templateCache) {
$templateCache.put("test.html", test_html);
$templateCache.put("test2.html", test2_html);
}]);
});