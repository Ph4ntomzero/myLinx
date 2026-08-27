import express from "express";
import {
	createCodOrder,
	getAdminOrders,
	getMyOrders,
	getOrderById,
	updateOrderPaymentStatus,
	updateOrderStatus,
} from "../controllers/order.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/cod", protectRoute, createCodOrder);
router.get("/my-orders", protectRoute, getMyOrders);
router.get("/admin", protectRoute, adminRoute, getAdminOrders);
router.patch("/:id/status", protectRoute, adminRoute, updateOrderStatus);
router.patch("/:id/payment", protectRoute, adminRoute, updateOrderPaymentStatus);
router.get("/:id", protectRoute, getOrderById);

export default router;
