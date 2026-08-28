import { create } from "zustand";
import { toast } from "react-hot-toast";

import axios from "../lib/axios";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	resendingVerification: false,

	signup: async ({ name, email, password, confirmPassword }) => {
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return null;
		}

		set({ loading: true });

		try {
			const response = await axios.post("/auth/signup", { name, email, password });
			set({ user: response.data.user || null, loading: false });
			toast.success(response.data.message);
			return response.data;
		} catch (error) {
			const responseData = error.response?.data;
			set({ loading: false });
			toast.error(responseData?.message || "An error occurred");

			// The account exists even when SMTP delivery failed, so let the signup
			// page continue to the resend flow instead of trapping the customer.
			return responseData?.requiresVerification ? responseData : null;
		}
	},

	login: async (email, password) => {
		set({ loading: true });

		try {
			const response = await axios.post("/auth/login", { email, password });
			set({ user: response.data.user, loading: false });
			return response.data;
		} catch (error) {
			const responseData = error.response?.data;
			set({ loading: false });
			toast.error(responseData?.message || "An error occurred");
			return responseData?.requiresVerification ? responseData : null;
		}
	},

	verifyEmail: async (token) => {
		const response = await axios.get("/auth/verify-email", {
			params: { token },
		});
		return response.data;
	},

	resendVerification: async (email) => {
		set({ resendingVerification: true });

		try {
			const response = await axios.post("/auth/resend-verification", { email });
			toast.success(response.data.message);
			return true;
		} catch (error) {
			toast.error(
				error.response?.data?.message ||
					"Unable to send a verification email right now.",
			);
			return false;
		} finally {
			set({ resendingVerification: false });
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				refreshPromise = null;
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	},
);
