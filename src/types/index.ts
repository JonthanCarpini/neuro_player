// ---- API Response Types ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

// ---- XUI (Xtream Codes) Types ----

export interface XuiUserInfo {
  username: string;
  password: string;
  auth: number;
  status: string;
  exp_date: string | null;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

export interface XuiServerInfo {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: number;
  time_now: string;
}

export interface XuiAuthResponse {
  user_info: XuiUserInfo;
  server_info: XuiServerInfo;
}

export interface XuiCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

// ---- Provider Data (stored in user.providerData JSON) ----

export interface ProviderData {
  password: string;
  base_url: string;
  user_info?: XuiUserInfo;
}

// ---- Pagination ----

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
