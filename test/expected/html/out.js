var test;
(function (test) {
    var tpl;
    (function (tpl) {
        tpl.html = '<div> Some content </div>    <span> some other content </span> ';
    })(tpl = test.tpl || (test.tpl = {}));
})(test || (test = {}));
var boo = test.tpl.html;
