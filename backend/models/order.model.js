import mongoose from "mongoose";

export const DELIVERY_LOCATIONS = ["Unibell 1 Gate", "Unibell 2 Gate", "Unibell 3 Gate"];
export const ORDER_STATUSES = ["confirmed", "out_for_delivery", "delivered", "cancelled"];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paystackReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    codCheckoutId: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.paymentMethod === "cod";
      },
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "cod"],
      required: true,
      default: "paystack",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      required: true,
      default: "paid",
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
      default: "confirmed",
    },
    deliveryLocation: {
      type: String,
      enum: DELIVERY_LOCATIONS,
      required: function () {
        return this.paymentMethod === "cod";
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: function () {
        return this.paymentMethod === "cod";
      },
    },
    orderNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    deliveryFee: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
