import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
    ApiResponse,
    Category,
    MenuItem,
    Cart,
    Order,
    OrderStatus,
    DietaryTag,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

class ApiClient {
    private http: AxiosInstance;
    constructor() {
        this.http = axios.create({
            baseURL: BASE,
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
        });
        this.http.interceptors.response.use(
            (r) => r,
            (err) => {
                const msg =
                    err.response?.data?.message ??
                    err.message ??
                    "Unexpected error";
                return Promise.reject(
                    new Error(Array.isArray(msg) ? msg.join(", ") : msg),
                );
            },
        );
    }
    setAuth(token: string) {
        this.http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    clearAuth() {
        delete this.http.defaults.headers.common["Authorization"];
    }
    useToken(token: string) {
        this.setAuth(token);
    }
    private unwrap<T>(r: AxiosResponse<ApiResponse<T>>): T {
        return r.data.data;
    }

    async login(username: string, password: string) {
        const r = await this.http.post<
            ApiResponse<{
                accessToken: string;
                expiresIn: string;
                username: string;
            }>
        >("/auth/login", { username, password });
        const d = this.unwrap(r);
        this.setAuth(d.accessToken);
        return d;
    }
    logout() {
        this.clearAuth();
    }

    async getCategories(): Promise<Category[]> {
        return this.unwrap(await this.http.get("/menu/categories"));
    }
    async getItems(f?: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        dietary?: DietaryTag[];
    }): Promise<MenuItem[]> {
        const p = new URLSearchParams();
        if (f?.category) p.set("category", f.category);
        if (f?.search) p.set("search", f.search);
        if (f?.minPrice !== undefined) p.set("minPrice", String(f.minPrice));
        if (f?.maxPrice !== undefined) p.set("maxPrice", String(f.maxPrice));
        if (f?.dietary?.length) p.set("dietary", f.dietary.join(","));
        const q = p.toString();
        return this.unwrap(
            await this.http.get(`/menu/items${q ? `?${q}` : ""}`),
        );
    }
    async getItemById(id: string): Promise<MenuItem> {
        return this.unwrap(await this.http.get(`/menu/items/${id}`));
    }

    async getCart(sid: string): Promise<Cart> {
        return this.unwrap(await this.http.get(`/cart/${sid}`));
    }
    async setTable(sid: string, tableNumber: string): Promise<Cart> {
        return this.unwrap(
            await this.http.post(`/cart/${sid}/table`, { tableNumber }),
        );
    }
    async addToCart(
        sid: string,
        p: {
            menuItemId: string;
            quantity: number;
            customizations?: { optionId: string }[];
            specialInstructions?: string;
        },
    ): Promise<Cart> {
        return this.unwrap(await this.http.post(`/cart/${sid}/items`, p));
    }
    async updateCartItem(
        sid: string,
        id: string,
        p: { quantity?: number; specialInstructions?: string },
    ): Promise<Cart> {
        return this.unwrap(
            await this.http.patch(`/cart/${sid}/items/${id}`, p),
        );
    }
    async removeFromCart(sid: string, id: string): Promise<Cart> {
        return this.unwrap(await this.http.delete(`/cart/${sid}/items/${id}`));
    }
    async clearCart(sid: string): Promise<void> {
        await this.http.delete(`/cart/${sid}`);
    }

    async placeOrder(p: {
        sessionId: string;
        tableNumber: string;
        cardLastFour: string;
    }): Promise<Order> {
        return this.unwrap(await this.http.post("/orders", p));
    }
    async getOrder(id: string): Promise<Order> {
        return this.unwrap(await this.http.get(`/orders/${id}`));
    }
    async getOrdersBySession(sid: string): Promise<Order[]> {
        return this.unwrap(await this.http.get(`/orders/session/${sid}`));
    }
    async getAllOrders(): Promise<Order[]> {
        return this.unwrap(await this.http.get("/orders"));
    }
    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
        return this.unwrap(
            await this.http.patch(`/orders/${id}/status`, { status }),
        );
    }
}

export const api = new ApiClient();
