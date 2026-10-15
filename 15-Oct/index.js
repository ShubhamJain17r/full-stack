// Write JS programs to handle user input using prompt(), alert() and document.write(), and implement conditional logic (if-else, ternary operator) to build an age eligibility checker.

// var age = Number(window.prompt("Enter your age: "));

// if (age > 0 && Number.isFinite(age) && Number.isInteger(age)) {
//     let result = age >= 18 ? "You are eligible to Vote" : "You are not eligible to Vote";
//     window.alert(result);
//     document.write("<h3>Age " + age + "</h3>");
//     document.write("<h3>" + result + "</h3>");
// }
// else {
//     window.alert("please enter a valid age");

//     document.write("<h3>Invalid age entered!</h3>");
// }

var date = Number(window.prompt("Enter today's date: "));

if (date > 0 && Number.isFinite(date) && Number.isInteger(date) && date < 32) {
    let result = date >= 11 && date <= 19 ? "You are eligible to Enter" : "You are not eligible to Enter";
    window.alert(result);
    document.write("<h3>date " + date + " October</h3>");
    document.write("<h3>" + result + "</h3>");
}
else {
    window.alert("please enter a valid date");

    document.write("<h3>Invalid date entered!</h3>");
}
