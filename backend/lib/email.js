import nodemailer from "nodemailer";

let didWarnAboutAdminEmailConfiguration = false;

const escapeHtml = (value) =>
	String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");

const formatRands = (amount) => `R${Number(amount || 0).toFixed(2)}`;

const getSmtpConfiguration = () => {
	const { SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASS, SMTP_SECURE = "false" } = process.env;

	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || SMTP_HOST.includes("@")) {
		throw new Error(
			"SMTP is not configured. SMTP_HOST must be a mail server address, not an email address.",
		);
	}

	return {
		from: SMTP_USER,
		transport: {
			host: SMTP_HOST,
			port: Number(SMTP_PORT),
			secure: SMTP_SECURE === "true" || (!process.env.SMTP_SECURE && Number(SMTP_PORT) === 465),
			auth: { user: SMTP_USER, pass: SMTP_PASS },
		},
	};
};

const getAdminEmailConfiguration = () => {
	const adminEmail = process.env.ADMIN_ORDER_EMAIL || process.env.ADMIN_EMAIL;

	try {
		const smtpConfiguration = getSmtpConfiguration();
		if (!adminEmail) throw new Error("ADMIN_ORDER_EMAIL is not configured.");

		return {
			...smtpConfiguration,
			adminEmail,
			from: process.env.ORDER_EMAIL_FROM || smtpConfiguration.from,
		};
	} catch (error) {
		if (!didWarnAboutAdminEmailConfiguration) {
			console.warn(`Admin order emails are disabled: ${error.message}`);
			didWarnAboutAdminEmailConfiguration = true;
		}
		return null;
	}
};

export const sendVerificationEmail = async ({ email, name, rawToken }) => {
	const emailConfiguration = getSmtpConfiguration();
	const clientUrl = process.env.CLIENT_URL?.trim();

	if (!clientUrl) {
		throw new Error("CLIENT_URL is not configured.");
	}

	let verificationUrl;
	try {
		verificationUrl = new URL("/verify-email", clientUrl);
		verificationUrl.searchParams.set("token", rawToken);
	} catch {
		throw new Error("CLIENT_URL must be a valid absolute URL.");
	}

	const safeName = escapeHtml(name || "there");
	const safeVerificationUrl = escapeHtml(verificationUrl.toString());
	const transporter = nodemailer.createTransport(emailConfiguration.transport);

	await transporter.sendMail({
		from: process.env.EMAIL_FROM || process.env.ORDER_EMAIL_FROM || emailConfiguration.from,
		to: email,
		subject: "Verify your myLinx email",
		text: [
			`Welcome to myLinx, ${name || "there"}!`,
			"",
			"Please verify your email address to activate your account:",
			verificationUrl.toString(),
			"",
			"This verification link expires in 1 hour.",
			"If you did not create this account, you can ignore this email.",
		].join("\n"),
		html: `
			<div style="margin:0;padding:32px 16px;background:#031b14;font-family:Arial,sans-serif;color:#f5fbf7">
				<div style="margin:0 auto;max-width:560px;overflow:hidden;border:1px solid #1d4f3d;border-radius:20px;background:#092b20;box-shadow:0 20px 60px rgba(0,0,0,.25)">
					<div style="padding:24px 32px;border-bottom:1px solid #1d4f3d;background:#061f17">
						<div style="font-size:26px;font-weight:800;letter-spacing:-.5px;color:#ffffff">my<span style="color:#31c47d">Linx</span></div>
					</div>
					<div style="padding:36px 32px">
						<p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#6bda9e">WELCOME TO MYLINX</p>
						<h1 style="margin:0 0 18px;font-size:28px;line-height:1.25;color:#ffffff">Verify your email address</h1>
						<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#c4d8ce">Hi ${safeName}, please verify your email address to activate your account.</p>
						<a href="${safeVerificationUrl}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:#14ad68;color:#031b14;font-size:16px;font-weight:800;text-decoration:none">Verify Email</a>
						<p style="margin:24px 0 8px;font-size:14px;line-height:1.6;color:#91afa2">This verification link expires in 1 hour.</p>
						<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#91afa2">If the button does not work, copy and paste this link into your browser:</p>
						<p style="margin:0;overflow-wrap:anywhere;font-size:12px;line-height:1.6;color:#6bda9e"><a href="${safeVerificationUrl}" style="color:#6bda9e">${safeVerificationUrl}</a></p>
					</div>
					<div style="padding:20px 32px;border-top:1px solid #1d4f3d;background:#061f17;font-size:13px;line-height:1.6;color:#66877a">If you did not create this account, you can safely ignore this email.</div>
				</div>
			</div>`,
	});
};

export const sendAdminOrderNotification = async ({ order, customer, productNamesById = new Map() }) => {
	const emailConfiguration = getAdminEmailConfiguration();
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
