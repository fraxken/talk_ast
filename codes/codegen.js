function add(a = 1) {
    return (b) => a + b;
}

const add10 = add(10);
console.log(add10(5));
