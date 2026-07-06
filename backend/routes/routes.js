const router = require("express").Router();
const auth = require("../controllers/authController");
const { protect,authorize } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

// Import Controllers
const {
  addCategory,
  addItem,
  addType,
  getProductFormAttributes
} = require("../controllers/AttributesController");

const {
  addProduct,
  getProducts,
  getAllProductsAdmin,
  updateProduct,
  changeStatus,
  deleteProduct,
} = require("../controllers/productController");

// --- 1. AUTH ROUTES ---
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/verify-login-otp", auth.verifyLoginOtp);

// --- 2. PUBLIC / CLIENT-SIDE ROUTES ---
router.get("/products", getProducts); 
router.get("/attributes/form-options", getProductFormAttributes); // Public so frontend can load dropdown options freely

// --- 3. PROTECTED ADMIN ROUTES ---
// Admin Product Actions
router.get("/products/admin/all", protect, authorize("admin"), getAllProductsAdmin);  
router.post("/products/add", protect, authorize("admin"), upload.array("images", 10), addProduct);
router.put("/products/update/:id", protect, authorize("admin"), upload.array("images", 10), updateProduct);
router.put("/products/status/:id", protect, authorize("admin"), changeStatus);
router.delete("/products/delete/:id", protect, authorize("admin"), deleteProduct); 

// Admin Attribute Additions (Categories, Items, Types)
router.post("/attributes/category", protect, authorize("admin"), addCategory);
router.post("/attributes/item", protect, authorize("admin"), addItem);
router.post("/attributes/type", protect, authorize("admin"), addType);





 
 



 
  



  
  



  
 



// // Admin only
// router.get(
//   "/admin/dashboard",
//   protect,
//   authorize("admin"),
//   (req, res) => {
//     res.json({ message: "Admin Panel" });
//   }
// );

// // Wholesale only
// router.get(
//   "/wholesale/dashboard",
//   protect,
//   authorize("wholesale"),
//   (req, res) => {
//     res.json({ message: "Wholesale Panel" });
//   }
// );

// // Retail only
// router.get(
//   "/retail/dashboard",
//   protect,
//   authorize("retail"),
//   (req, res) => {
//     res.json({ message: "Retail Panel" });
//   }
// );





module.exports = router;