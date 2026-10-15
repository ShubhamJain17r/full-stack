// Write JS programs to handle user input using prompt(), alert() and document.write(), and implement conditional logic (if-else, ternary operator) to build an age eligibility checker.

var age = Number(window.prompt("Enter your age: "));

if (age > 0 && Number.isFinite(age) && Number.isInteger(age)) {
    let result = age >= 18 ? "You are eligible to Vote" : "You are not eligible to Vote";
    window.alert(result);
    document.write("<h3>Age " + age + "</h3>");
    document.write("<h3>" + result + "</h3>");
}
else {
    window.alert("please enter a valid age");

    document.write("<h3>Invalid age entered!</h3>");
}

// if (age < 0 || age > 120) 
//     window.alert("invalid age");
// else if (age < 18)
//     console.log("Cannot vote");
// else 
//     console.log("Can vote");