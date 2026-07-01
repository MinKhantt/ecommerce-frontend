// ===== Enums =====

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  REQUIRES_ACTION = 'REQUIRES_ACTION',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  K_PAY = 'K_PAY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

// ===== Core DTOs =====

export interface Category {
  id: string;
  name: string;
}

export interface Image {
  id: string;
  fileName: string;
  fileType: string;
  downloadUrl: string;
  publicId: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  inventory: number;
  description: string;
  category: Category;
  images: Image[];
}

export interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

export interface Cart {
  id: string;
  totalAmount: number;
  cartItems: CartItem[];
}

export interface OrderSummary {
  id: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface UserSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  shippingAddress: string;
  orderItems: OrderItem[];
  user: UserSummaryDto;
}

export interface Payment {
  id: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  currency: string;
  transactionId: string;
  stripePaymentIntentId: string;
  order: Order;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cart?: Cart;
  orders?: OrderSummary[];
}

// ===== Request Types =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OAuth2ExchangeRequest {
  code: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AddProductRequest {
  name: string;
  brand: string;
  price: number;
  inventory: number;
  description: string;
  category: string;
}

export interface UpdateProductRequest {
  name: string;
  brand: string;
  price: number;
  inventory: number;
  description: string;
  category: string;
}

export interface AddCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface AddOrderRequest {
  shippingAddress: string;
}

export interface AddPaymentRequest {
  orderId: string;
  paymentMethod: string;
  paymentProvider: string;
  currency?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
}

// ===== Response Types =====

export interface ApiResponse<T = unknown> {
  message: string;
  data: T | null;
}

export interface LoginResponse {
  id: string;
  token: string;
}

export interface PaymentIntentResponse {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
}

// ===== Auth Context =====

export interface AuthUser {
  id: string;
  token: string;
  isAdmin: boolean;
}
