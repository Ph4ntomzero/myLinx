import nodemailer from "nodemailer";

let didWarnAboutEmailConfiguration = false;

const escapeHtml = (value) =>
	String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");

const formatRands = (amount) => `R${Number(amount || 0).toFixed(2)}`;

const getEmailConfiguration = () => {
	const adminEmail = process.env.ADMIN_ORDER_EMAIL || process.env.ADMIN_EMAIL;
	const { SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASS, SMTP_SECURE = "false" } = process.env;

	if (!adminEmail || !SMTP_HOST || !SMTP_USER || !SMTP_PASS || SMTP_HOST.includes("@")) {
		if (!didWarnAboutEmailConfiguration) {
			console.warn("Admin order emails are disabled: configure ADMIN_ORDER_EMAIL and SMTP settings. SMTP_HOST must be a mail server address (for Gmail, use smtp.gmail.com), not an email address.");
			didWarnAboutEmailConfiguration = true;
		}
		return null;
	}

	return {
		adminEmail,
		from: process.env.ORDER_EMAIL_FROM || SMTP_USER,
		transport: {
			host: SMTP_HOST,
			port: Number(SMTP_PORT),
			secure: SMTP_SECURE === "true",
			auth: { user: SMTP_USER, pass: SMTP_PASS },
		},
	};
};

export const sendAdminOrderNotification = async ({ order, customer, productNamesById = new Map() }) => {
	const emailConfiguration = getEmailConfiguration();
	if (!emailConfiguration) return false;

	const transporter = nodemailer.createTransport(emailConfiguration.transport);
	const orderNumber = order._id.toString();
	const paymentMethod = order.paymentMethod === "cod" ? "Cash on Delivery" : "Paystack card payment";
	const products = order.products.map((item) => ({
		name: productNamesById.get(item.product.toString()) || "Product",
		quantity: item.quantity,
		price: item.price,
	}));
	const productRows = products
		.map(
			(item) =>
				`<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatRands(item.price * item.quantity)}</td></tr>`,
		)
		.join("");
	const plainTextProducts = products
		.map((item) => `- ${item.name} × ${item.quantity}: ${formatRands(item.price * item.quantity)}`)
		.join("\n");
	const deliveryDetails = order.paymentMethod === "cod"
		? `<p><strong>Delivery gate:</strong> ${escapeHtml(order.deliveryLocation)}<br /><strong>Phone:</strong> ${escapeHtml(order.phoneNumber)}${order.orderNote ? `<br /><strong>Note:</strong> ${escapeHtml(order.orderNote)}` : ""}</p>`
		: "";
	const plainTextDeliveryDetails = order.paymentMethod === "cod"
		? `\nDelivery gate: ${order.deliveryLocation}\nPhone: ${order.phoneNumber}${order.orderNote ? `\nNote: ${order.orderNote}` : ""}`
		: "";

	try {
		await transporter.sendMail({
			from: emailConfiguration.from,
			to: emailConfiguration.adminEmail,
			subject: `New ${paymentMethod} order #${orderNumber}`,
			text: [
				`New ${paymentMethod} order #${orderNumber}`,
				`Customer: ${customer.name} (${customer.email})`,
				`Total: ${formatRands(order.totalAmount)}`,
				plainTextDeliveryDetails,
				"",
				"Products:",
				plainTextProducts,
			].join("\n"),
			html: `
				<div style="font-family:Arial,sans-serif;color:#111827;max-width:640px">
					<h2 style="color:#059669">New ${escapeHtml(paymentMethod)} order</h2>
					<p><strong>Order:</strong> #${escapeHtml(orderNumber)}<br /><strong>Customer:</strong> ${escapeHtml(customer.name)} (${escapeHtml(customer.email)})<br /><strong>Total:</strong> ${formatRands(order.totalAmount)}</p>
					${deliveryDetails}
					<table style="border-collapse:collapse;width:100%"><thead><tr><th style="padding:8px;text-align:left;background:#ecfdf5">Product</th><th style="padding:8px;background:#ecfdf5">Qty</th><th style="padding:8px;text-align:right;background:#ecfdf5">Total</th></tr></thead><tbody>${productRows}</tbody></table>
				</div>`,
		});
		return true;
	} catch (error) {
		// Notifications must never undo or delay a successfully placed order.
		console.error("Unable to send the admin order email:", error.message);
		return false;
	}
};
