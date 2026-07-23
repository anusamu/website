const router = require("express").Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const auth = require("../controllers/authController");
const orderController = require('../controllers/orderController');
const { createRazorpayOrder } = require("../controllers/paymentController");
const { addCategory, addItem, addType, addCollect, getProductFormAttributes, getSimilarProducts } = require("../controllers/AttributesController");
const { addProduct, getProducts, getAllProductsAdmin, updateProduct, changeStatus, deleteProduct, getProductById ,getProductsForShop } = require("../controllers/productController");
const { createAdmin, listAdmins, updateAdmin, deleteAdmin } = require("../controllers/adminAuth");
const { getCart, addToCart, removeFromCart } = require("../controllers/CartController");

// ===================== AUTH =====================
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/login/google", auth.googleLogin);
router.post("/verify-login-otp", auth.verifyLoginOtp);
router.get("/users/saved-address", protect, auth.getSavedAddress);

// ===================== PUBLIC =====================
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/products/recommendations/similar", getSimilarProducts);
router.get("/attributes/form-options", getProductFormAttributes);
router.get("/shop-products", getProductsForShop);

// ===================== CART =====================
router.get("/cart", protect, getCart);
router.post("/cart/add", protect, addToCart);
router.post("/cart/remove", protect, removeFromCart);

// ===================== PRODUCTS (ADMIN) =====================
router.get("/products/admin/all", protect, authorize("admin"), getAllProductsAdmin);
router.post("/products/add", protect, authorize("admin"), upload.array("images", 10), addProduct);
router.put("/products/update/:id", protect, authorize("admin"), upload.array("images", 10), updateProduct);
router.put("/products/status/:id", protect, authorize("admin"), changeStatus);
router.delete("/products/delete/:id", protect, authorize("admin"), deleteProduct);

// ===================== ATTRIBUTES (ADMIN) =====================
router.post("/attributes/category", protect, authorize("admin"), addCategory);
router.post("/attributes/item", protect, authorize("admin"), addItem);
router.post("/attributes/type", protect, authorize("admin"), addType);
router.post("/attributes/collect", protect, authorize("admin"), addCollect);

// ===================== ADMIN =====================
router.post("/admin/addadmin", protect, authorize("SuperAdmin", "admin"), createAdmin);
router.get("/admin", protect, authorize("SuperAdmin", "admin"), listAdmins);
router.put("/admin/editadmin/:id", protect, authorize("SuperAdmin", "admin"), updateAdmin);
router.delete("/admin/editadmin/:id", protect, authorize("SuperAdmin", "admin"), deleteAdmin);


router.post("/payments/create-razorpay-order", protect, createRazorpayOrder);



router.post("/orders/create", protect, orderController.createOrder);
router.get("/admin/orders/retail", protect, authorize("SuperAdmin", "admin"), orderController.getRetailOrders);
router.get("/admin/orders/wholesale", protect, authorize("SuperAdmin", "admin"), orderController.getWholesaleOrders);
router.put("/admin/update-status/:orderId", protect, authorize("SuperAdmin", "admin"), orderController.updateOrderStatus);
module.exports = router;