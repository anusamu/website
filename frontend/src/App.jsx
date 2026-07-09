import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login/Login";
import Register from "./components/Login/Register";
import Home from "./Retail/RetailPage/Home/Home";
import Dashboard from "./Admin/AdminPage/AdminDash";
import AddProduct from "./Admin/AdminUI/AddProduct/AddProduct";
import ProductList from "./Admin/AdminUI/ProductList/ProductList";
import AdminLayout from "./Admin/AdminPage/AdminLayout";
import InactiveProduct from "./Admin/AdminPage/InactiveProduct/InactiveProduct";
import AddProductItems from "./Admin/AdminPage/AddProductandItems/AddProductItems";
import CategoryProducts from "./Retail/RetailPage/CategoryProducts/CategoryProducts";
import ShopPage from "./Retail/RetailPage/ShopPages/ShopPage";
// import StorefrontUI from "./Retail/RetailPage/test/StorefrontUI";
// import WholesaleDashboard from "./WholeSale/Wholsale";
import AddAdmin from "./Admin/AdminPage/AddAdmin/AddAdmin";

function App() {
  return (
  
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />



        {/* Retail Customer */}
        <Route path="/" element={<Home />} />
        <Route path="/category-products" element={<CategoryProducts/>} />
      <Route path="/shop" element={<ShopPage/>} />




        {/* Admin */}
        <Route element={<AdminLayout/>}>
          <Route path="/admindashboard" element={<Dashboard/>} />
          <Route path="/addproduct" element={<AddProductItems/>} />
          <Route path="/productlist" element={<ProductList />} />
           <Route path="/inactiveproducts" element={<InactiveProduct/>} />
           <Route path="/addAdmin" element={<AddAdmin/>} />
         
        </Route>
      </Routes>
   
  );
}

export default App;






























  {/* Wholesale Customer */}
        {/* <Route
          path="/wholesalehome"
          element={<WholesaleDashboard />}
        /> */}