// function Header() {
//   return (
//     <section>
//       <h1>Header component</h1>
//     </section>
//   );
// }

// function Footer() {
//   return (
//     <section>
//       <h1>Footer component</h1>
//     </section>
//   );
// }

// function Product() {
//   var name = "Shubham";
//   var age = 21;
//   var place = "Home";
//   return (
//     <>
//       <h1>Product component</h1>
//       <h2>Name: {name}</h2>
//       <h2>Age: {age}</h2>
//       <h2>City: {place}</h2>
//     </>
//   );
// }

// function App() {
//   return (
//     <div>
//       <h1>hello world!</h1>
//       <Header />
//       <Product />
//       <Footer />
//     </div>
//   );
// }


import Products from "./Products";

function App() {
  return (
    <div>
      <Products name="Shubham" age={21} city="Kosi Kalan" />
    </div>
  );
}

export default App;
