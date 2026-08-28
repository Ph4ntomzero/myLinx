import mongoose from "mongoose";

const ensureOrderIndexes = async (connection) => {
  const orders = connection.collection("orders");
  let indexes = [];

  try {
    indexes = await orders.indexes();
  } catch (error) {
    // A new installation may not have an orders collection yet. createIndex
    // below will create it when the first index is needed.
    if (error.code !== 26) throw error;
  }

  const stripeSessionIndex = indexes.find((index) => index.name === "stripeSessionId_1");

  // Older versions created this index as unique but not sparse. That permits
  // only one order without a Stripe session ID, which blocks every COD order.
  if (stripeSessionIndex && (!stripeSessionIndex.unique || !stripeSessionIndex.sparse)) {
    await orders.dropIndex("stripeSessionId_1");
    console.log("Updated the Stripe session order index for COD compatibility");
  }

  const hasCorrectStripeIndex = stripeSessionIndex?.unique && stripeSessionIndex?.sparse;
  if (!hasCorrectStripeIndex) {
    await orders.createIndex(
      { stripeSessionId: 1 },
      { name: "stripeSessionId_1", unique: true, sparse: true },
    );
  }
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    await ensureOrderIndexes(conn.connection);
    console.log('MongoDB connected:',conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
