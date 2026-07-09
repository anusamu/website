const router = require("express").Router();

// Middleware
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Controllers
const auth = require("../controllers/authController");

const {
  addCategory,
  addItem,
  addType,
  addCollect,
  getProductFormAttributes,
} = require("../controllers/AttributesController");

const {
  addProduct,
  getProducts,
  getAllProductsAdmin,
  updateProduct,
  changeStatus,
  deleteProduct,
} = require("../controllers/productController");

const {
  createAdmin,
  listAdmins,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminAuth");


// =====================================================
// AUTH ROUTES
// =====================================================
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/verify-login-otp", auth.verifyLoginOtp);


// =====================================================
// PUBLIC ROUTES
// =====================================================
router.get("/products", getProducts);
router.get("/attributes/form-options", getProductFormAttributes);


// =====================================================
// PRODUCT MANAGEMENT (ADMIN ONLY)
// =====================================================
router.get(
  "/products/admin/all",
  protect,
  authorize("admin"),
  getAllProductsAdmin
);

router.post(
  "/products/add",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  addProduct
);

router.put(
  "/products/update/:id",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  updateProduct
);

router.put(
  "/products/status/:id",
  protect,
  authorize("admin"),
  changeStatus
);

router.delete(
  "/products/delete/:id",
  protect,
  authorize("admin"),
  deleteProduct
);


// =====================================================
// ATTRIBUTE MANAGEMENT (ADMIN ONLY)
// =====================================================
router.post(
  "/attributes/category",
  protect,
  authorize("admin"),
  addCategory
);

router.post(
  "/attributes/item",
  protect,
  authorize("admin"),
  addItem
);

router.post(
  "/attributes/type",
  protect,
  authorize("admin"),
  addType
);

router.post(
  "/attributes/collect",
  protect,
  authorize("admin"),
  addCollect
);


// =====================================================
// ADMIN MANAGEMENT
// =====================================================
router.post(
  "/admin/addadmin",
  protect,
  authorize("SuperAdmin", "admin"),
  createAdmin
);

router.get(
  "/admin/",
  protect,
  authorize("SuperAdmin", "admin"),
  listAdmins
);

router.put(
  "/admin/editadmin/:id",
  protect,
  authorize("SuperAdmin", "admin"),
  updateAdmin
);

router.delete(
  "/admin/editadmin/:id",
  protect,
  authorize("SuperAdmin", "admin"),
  deleteAdmin
);

module.exports = router;