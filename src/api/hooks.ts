import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { refreshClient } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  OAuth2ExchangeRequest,
  AddProductRequest,
  UpdateProductRequest,
  AddOrderRequest,
  AddPaymentRequest,
  UpdateUserRequest,
  LoginResponse,
  Product,
  Cart,
  Order,
  Payment,
  User,
  Category,
  PaymentIntentResponse,
  ApiResponse,
} from '../types';

function unwrapList<T>(data: unknown, key?: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (key && Array.isArray(obj[key])) return obj[key] as T[];
    if (Array.isArray(obj.content)) return obj.content as T[];
    const firstArray = Object.values(obj).find(Array.isArray);
    if (firstArray) return firstArray as T[];
  }
  return [];
}

// Auth
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data).then((r) => r.data.data!),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiClient.post<ApiResponse<User>>('/auth/register', data).then((r) => r.data.data!),
  });
}

export function useOAuth2Exchange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OAuth2ExchangeRequest) =>
      apiClient.post<ApiResponse<LoginResponse>>('/auth/oauth2/exchange', data).then((r) => r.data.data!),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      refreshClient.post<ApiResponse>('/auth/logout').then((r) => r.data.message),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Products 
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () =>
      apiClient.get('/products').then((r) => {
        const data = r.data.data;
        if (Array.isArray(data)) return data as Product[];
        if (data?.products && Array.isArray(data.products)) return data.products as Product[];
        if (data?.content && Array.isArray(data.content)) return data.content as Product[];
        return [] as Product[];
      }),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Product>>(`/products/product/${id}`)
        .then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products/by-category?category=${encodeURIComponent(category)}`)
        .then((r) => unwrapList<Product>(r.data.data, 'products')),
    enabled: !!category,
  });
}

export function useProductsByBrand(brand: string) {
  return useQuery({
    queryKey: ['products', 'brand', brand],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products/by-brand?brand=${encodeURIComponent(brand)}`)
        .then((r) => unwrapList<Product>(r.data.data, 'products')),
    enabled: !!brand,
  });
}

export function useProductsByName(name: string) {
  return useQuery({
    queryKey: ['products', 'name', name],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Product[]>>(`/products/by-name?name=${encodeURIComponent(name)}`)
        .then((r) => unwrapList<Product>(r.data.data, 'products')),
    enabled: !!name,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddProductRequest) =>
      apiClient.post<ApiResponse<Product>>('/products', data).then((r) => r.data.data!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      apiClient
        .put<ApiResponse<Product>>(`/products/product/${id}`, data)
        .then((r) => r.data.data!),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', vars.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/product/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// Images
export function useUploadImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ files, productId }: { files: File[]; productId: string }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('file', file));
      formData.append('productId', productId);
      return apiClient.post<ApiResponse>('/images/upload', formData).then((r) => r.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, file }: { imageId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.put<ApiResponse>(`/images/${imageId}`, formData).then((r) => r.data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => apiClient.delete(`/images/${imageId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      apiClient.get('/categories').then((r) => unwrapList<Category>(r.data.data, 'categories')),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiClient.post<ApiResponse<Category>>('/categories', { name }).then((r) => r.data.data!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data).then((r) => r.data.data!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// Cart
export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () =>
      apiClient.get<ApiResponse<Cart>>('/carts').then((r) => r.data.data),
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiClient.post(`/cartItems/add?productId=${productId}&quantity=${quantity}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      apiClient.put(`/cartItems/update/${productId}?quantity=${quantity}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => apiClient.delete(`/cartItems/remove/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete('/carts'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

// Orders
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddOrderRequest) =>
      apiClient.post<ApiResponse<Order>>('/orders', data).then((r) => r.data.data!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () =>
      apiClient.get('/orders/my-orders').then((r) => unwrapList<Order>(r.data.data, 'orders')),
    enabled: !!localStorage.getItem('token'),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () =>
      apiClient.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['order', 'admin', id],
    queryFn: () =>
      apiClient.get<ApiResponse<Order>>(`/orders/admin/${id}`).then((r) => r.data.data!),
    enabled: !!id,
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: () =>
      apiClient.get('/orders').then((r) => unwrapList<Order>(r.data.data, 'orders')),
    enabled: !!localStorage.getItem('token'),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => apiClient.delete(`/orders/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      apiClient.patch(`/orders/${orderId}/order-status?status=${status}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// Payments
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: AddPaymentRequest) =>
      apiClient
        .post<ApiResponse<PaymentIntentResponse>>('/payments/create-intent', data)
        .then((r) => r.data.data!),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPaymentRequest) =>
      apiClient
        .post<ApiResponse<PaymentIntentResponse>>('/payments/create-intent', data)
        .then((r) => r.data.data!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['payments', 'my'],
    queryFn: () =>
      apiClient.get('/payments/my-payments').then((r) => unwrapList<Payment>(r.data.data, 'payments')),
    enabled: !!localStorage.getItem('token'),
  });
}

export function useAllPayments() {
  return useQuery({
    queryKey: ['payments', 'all'],
    queryFn: () =>
      apiClient.get('/payments').then((r) => unwrapList<Payment>(r.data.data, 'payments')),
    enabled: !!localStorage.getItem('token'),
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: string }) =>
      apiClient.patch(`/payments/${paymentId}/status?status=${status}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) =>
      apiClient.delete(`/payments/${paymentId}/cancel`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });
}

// Users
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () =>
      apiClient.get<ApiResponse<User>>(`/users/${userId}`).then((r) => r.data.data!),
    enabled: !!userId,
  });
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: () =>
      apiClient.get('/users').then((r) => {
        console.log('[useAllUsers] raw response:', r.data);
        const data = r.data.data;
        if (Array.isArray(data)) return data as User[];
        if (data?.users && Array.isArray(data.users)) return data.users as User[];
        if (Array.isArray(r.data.users)) return r.data.users as User[];
        return unwrapList<User>(data, 'users');
      }),
    enabled: !!localStorage.getItem('token'),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      apiClient.put<ApiResponse<User>>(`/users/${userId}`, data).then((r) => r.data.data!),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['user', vars.userId] });
    },
  });
}
