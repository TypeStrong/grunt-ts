interface person {
    name: string;
}

var p : person = { name: "Test" };
p["age"] = 101;
console.log(p["age"]);
