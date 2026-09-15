import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
  avatar?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface GoogleAuthDTO {
  credential?: string; // Google ID token
  email?: string;
  name?: string;
  avatar?: string;
  googleId?: string;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface CreateAddressDTO {
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  addressType?: 'HOME' | 'WORK' | 'OTHER';
}

export interface UpdateAddressDTO extends Partial<CreateAddressDTO> {}

export interface OrderItemInput {
  title: string;
  size: string; // '200g' | '500g' | '1kg'
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderDTO {
  requestId: string;
  items: OrderItemInput[];
  shippingAddressId?: string;
  newAddress?: CreateAddressDTO;
  notes?: string;
  paymentMethod?: string;
}

