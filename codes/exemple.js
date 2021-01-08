var a = "foo";
var c = Symbol("bar");
let x, y = null;

function bar() {
    var b = true;
    a = 10;
    console.log(a);
    console.log(c);
}
