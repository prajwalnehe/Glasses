import express from "express";
import { adminAuth } from "../middleware/adminMiddleware.js";
import { listAllProducts, updateProduct, deleteProduct, listOrders, updateOrderStatus } from "../controllers/adminController.js";
import { createProduct } from "../controllers/productController.js";

const router = express.Router();

// Product management (admin only)
router.get("/products", adminAuth, listAllProducts);
router.post("/products", adminAuth, createProduct);
router.put("/products/:id", adminAuth, updateProduct);
router.delete("/products/:id", adminAuth, deleteProduct);

// Order management (admin only)
router.get("/orders", adminAuth, listOrders);
router.put("/orders/:id/status", adminAuth, updateOrderStatus);

export default router;

