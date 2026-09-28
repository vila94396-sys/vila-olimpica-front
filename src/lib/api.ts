import { getLocalAuthSession } from "@/lib/localAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Uploaded files are stored as paths relative to the backend (e.g. "/uploads/x.jpg")
// so they keep working regardless of which domain the backend is hosted on.
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  return `${API_ORIGIN}${url}`;
}

export interface BackendUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  status: string;
}

export interface LoginResponse {
  user: BackendUser;
  token: string;
}

export interface AccessRequestPayload {
  full_name?: string;
  block?: string;
  building?: string;
  apartment?: string;
  resident_type?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getLocalAuthSession()?.token;
  const isFormData = options.body instanceof FormData;

  // Abort after 10s to prevent requests hanging during Render cold starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || "Erro na requisição");
  }

  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { email: string; password: string; name?: string; role?: string }) =>
    request<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  requestAccess: (payload: AccessRequestPayload) =>
    request<{ message: string }>("/auth/request-access", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export interface AccessRequestDto {
  id: number;
  full_name: string;
  block: string;
  building: string;
  apartment: string;
  resident_type: string;
  phone: string;
  whatsapp: string;
  email: string;
  status: string;
  created_at: string;
}

export interface ApproveAccessResponse {
  message: string;
  email: string;
  password: string;
  full_name: string;
  whatsapp: string;
}

export const accessRequestsApi = {
  list: () => request<AccessRequestDto[]>("/auth/access-requests"),

  approve: (id: number) =>
    request<ApproveAccessResponse>(`/auth/access-requests/${id}/approve`, { method: "POST" }),

  reject: (id: number) =>
    request<{ message: string }>(`/auth/access-requests/${id}/reject`, { method: "POST" }),

  remove: (id: number) =>
    request<{ message: string }>(`/auth/access-requests/${id}`, { method: "DELETE" }),
};

export interface ResidentDto {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  block: string | null;
  building: string | null;
  apartment: string | null;
  resident_type: string | null;
  status: string;
  is_locked: boolean;
  failed_login_count: number;
  locked_at: string | null;
  created_at: string;
}

export interface UnlockResidentResponse {
  email: string;
  password: string;
  full_name: string | null;
  whatsapp: string | null;
}

export const residentsApi = {
  list: () => request<ResidentDto[]>("/admin/residents"),
  myFees: () => request<Array<{
    id: string;
    unidade_id: number;
    reference_month: string;
    reference_year: number;
    amount: number;
    valor_pago: number;
    due_date: string;
    status: string;
    paid_at: string | null;
    payment_method: string | null;
    receipt_url: string | null;
  }>>("/residents/me/fees"),
  myUnidade: () => request<{ id: number; divida_anterior: number; pagamentos_historicos: number } | null>("/residents/me/unidade"),
  uploadReceipt: (feeId: string, formData: FormData) =>
    request<{ url: string }>(`/residents/me/fees/${encodeURIComponent(feeId)}/receipt`, { method: "POST", body: formData }),
  submitPaymentReceipt: (feeId: string, payload: { payment_method: string; receipt_url: string }) =>
    request<{ message: string }>(`/residents/me/fees/${encodeURIComponent(feeId)}/submit-receipt`, { method: "POST", body: JSON.stringify(payload) }),
  processPayment: async (_payload: { feeId: string; method: string; amount: number; phone?: string; cardNumber?: string; cardExpiry?: string; cardCvv?: string; cardName?: string }): Promise<never> => {
    throw new Error("Pagamentos digitais ainda não estão configurados. Envie o comprovativo de transferência bancária.");
  },

  deactivate: (id: number) =>
    request<ResidentDto>(`/admin/residents/${id}/deactivate`, { method: "POST" }),

  reactivate: (id: number) =>
    request<ResidentDto>(`/admin/residents/${id}/reactivate`, { method: "POST" }),

  unlock: (id: number) =>
    request<UnlockResidentResponse>(`/admin/residents/${id}/unlock`, { method: "POST" }),

  remove: (id: number) =>
    request<{ message: string }>(`/admin/residents/${id}`, { method: "DELETE" }),
};

export interface PropertyDto {
  id: number;
  title: string;
  description: string | null;
  full_description: string | null;
  property_type: string;
  transaction_type: string;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  block: string | null;
  building: string | null;
  apartment_number: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  features: string[] | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  owner_name: string | null;
  owner_whatsapp: string | null;
  user_id: number | null;
  created_at: string;
}

export type PropertyInput = Partial<Omit<PropertyDto, "id" | "created_at" | "user_id">>;

export const propertiesApi = {
  list: () => request<PropertyDto[]>("/admin/properties"),
  listMine: () => request<PropertyDto[]>("/properties/my"),

  create: (payload: PropertyInput) =>
    request<PropertyDto>("/admin/properties", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number | string, payload: PropertyInput) =>
    request<PropertyDto>(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  remove: (id: number | string) =>
    request<{ message: string }>(`/properties/${id}`, { method: "DELETE" }),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return request<{ url: string }>("/admin/properties/upload", {
      method: "POST",
      body: formData,
    });
  },
};

export const publicPropertiesApi = {
  list: () => request<PropertyDto[]>("/properties"),
  listMine: () => request<PropertyDto[]>("/properties/my"),
  get: (id: number | string) => request<PropertyDto>(`/properties/${id}`),
};


export interface UnidadeDto {
  id: number;
  ord: number;
  bloco: number;
  edificio: number;
  apartamento: number;
  nome: string;
  contacto: string;
  via: string;
  categoria: string;
  divida_anterior: number;
  pagamentos_historicos: number;
  user_id: number | null;
  created_at: string;
}

export interface CondominiumFeeDto {
  id: number;
  unidade_id: number;
  reference_month: number;
  reference_year: number;
  amount: number;
  valor_pago: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface CascadePaymentResult {
  allocations: { period: string; amount: number }[];
  paidMonths: string[];
  totalPago: number;
  saldoRemanescente: number;
  unidade_id: number;
  categoria: string;
}

export interface FpdUnidadeDto {
  id: number;
  ord: number;
  apartamento: number;
  nome: string;
  contacto: string;
  taxa: number;
  divida_anterior: number;
  pagamentos_historicos: number;
  user_id: number | null;
  created_at: string;
}

export interface FpdFeeDto {
  id: number;
  unidade_id: number;
  reference_month: number;
  reference_year: number;
  amount: number;
  valor_pago: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface FpdCascadePaymentResult {
  allocations: { period: string; amount: number }[];
  paidMonths: string[];
  totalPago: number;
  saldoRemanescente: number;
  unidade_id: number;
}

export const fpdApi = {
  unidades: {
    list: () => request<FpdUnidadeDto[]>("/admin/fpd/unidades"),
    update: (id: number, payload: { nome?: string; apartamento?: number; contacto?: string; divida_acumulada?: number }) =>
      request<FpdUnidadeDto>(`/admin/fpd/unidades/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    cascadePayment: (id: number, payload: { ano: number; mesesSelecionados: number[]; valor: number; paymentMethod: string }) =>
      request<FpdCascadePaymentResult>(`/admin/fpd/unidades/${id}/cascade-payment`, { method: "POST", body: JSON.stringify(payload) }),
  },
  fees: {
    listByYear: (year: number) => request<FpdFeeDto[]>(`/admin/fpd/fees?year=${year}`),
    listYears: () => request<number[]>("/admin/fpd/fees/years"),
    generate: (payload: { year: number; amount: number; unidadeIds: number[] }) =>
      request<{ created: number; skipped: number }>("/admin/fpd/fees/generate", { method: "POST", body: JSON.stringify(payload) }),
    pay: (id: number, payload: { amount: number; paymentMethod: string }) =>
      request<FpdFeeDto>(`/admin/fpd/fees/${id}/payment`, { method: "POST", body: JSON.stringify(payload) }),
    updateStatus: (id: number, status: "PENDING" | "PAID" | "OVERDUE" | "PENDING_VERIFICATION") =>
      request<FpdFeeDto>(`/admin/fpd/fees/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
};

export interface InstitutionFeeDto {
  id: number;
  institution: string;
  reference_year: number;
  reference_month: number;
  period_label: string;
  descricao: string;
  taxa: number;
  n_apartamentos: number;
  valor: number;
  valor_pago: number;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
}

export interface InstitutionPaymentDto {
  id: number;
  fee_id: number;
  institution: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface InstitutionPayMultiResult {
  allocations: { period: string; amount: number }[];
  totalPago: number;
  saldoRemanescente: number;
  paidFeeIds: number[];
}

export interface InstitutionDashboardDto {
  totals: { valor: number; pago: number; saldo: number };
  byInstitution: Record<string, { valor: number; pago: number }>;
  recent: InstitutionPaymentDto[];
}

export interface DocumentDto {
  id: number;
  title: string;
  description: string | null;
  category: string;
  folder: string | null;
  year: number | null;
  file_url: string;
  file_name: string;
  file_size: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentInput {
  title?: string;
  description?: string | null;
  category?: string;
  folder?: string | null;
  year?: number | null;
  file_url?: string;
  file_name?: string;
  file_size?: string | null;
  file_type?: string | null;
}

export interface DocumentDownloadDto {
  id: number;
  document_id: number;
  downloaded_at: string;
  document: { id: number; title: string; category: string; folder: string | null } | null;
}

export const documentsApi = {
  list: () => request<DocumentDto[]>("/admin/documents"),
  create: (payload: DocumentInput) =>
    request<DocumentDto>("/admin/documents", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: DocumentInput) =>
    request<DocumentDto>(`/admin/documents/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) =>
    request<{ message: string }>(`/admin/documents/${id}`, { method: "DELETE" }),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string }>("/admin/documents/upload", { method: "POST", body: formData });
  },
  downloads: () => request<DocumentDownloadDto[]>("/admin/documents/downloads"),
};

export const publicDocumentsApi = {
  list: () => request<DocumentDto[]>("/documents"),
  trackDownload: (id: number) =>
    request<{ message: string }>(`/documents/${id}/download`, {
      method: "POST",
      body: JSON.stringify({ user_agent: navigator.userAgent }),
    }),
};

export interface NoticeDto {
  id: number;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticeInput {
  title?: string;
  content?: string;
  priority?: string;
  is_active?: boolean;
}

export const noticesApi = {
  list: () => request<NoticeDto[]>("/admin/notices"),
  create: (payload: NoticeInput) =>
    request<NoticeDto>("/admin/notices", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: NoticeInput) =>
    request<NoticeDto>(`/admin/notices/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) =>
    request<{ message: string }>(`/admin/notices/${id}`, { method: "DELETE" }),
};

export const publicNoticesApi = {
  list: () => request<NoticeDto[]>("/notices"),
};

export interface NewsDto {
  id: number;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string | null;
  gallery_urls: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface NewsInput {
  title?: string;
  summary?: string;
  content?: string;
  category?: string;
  image_url?: string | null;
  gallery_urls?: string[] | null;
}

export const newsApi = {
  list: () => request<NewsDto[]>("/admin/news"),
  create: (payload: NewsInput) =>
    request<NewsDto>("/admin/news", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: NewsInput) =>
    request<NewsDto>(`/admin/news/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) =>
    request<{ message: string }>(`/admin/news/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string }>("/admin/news/upload", { method: "POST", body: formData });
  },
};

export const publicNewsApi = {
  list: () => request<NewsDto[]>("/news"),
};

export const institutionApi = {
  fees: {
    list: (institution: string) => request<InstitutionFeeDto[]>(`/admin/institutions/${encodeURIComponent(institution)}/fees`),
    create: (institution: string, payload: { reference_year: number; reference_month: number; descricao?: string; taxa: number; n_apartamentos: number }) =>
      request<InstitutionFeeDto>(`/admin/institutions/${encodeURIComponent(institution)}/fees`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: { reference_year: number; reference_month: number; descricao: string; taxa: number; n_apartamentos: number; valor_pago: number }) =>
      request<InstitutionFeeDto>(`/admin/institutions/fees/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id: number) =>
      request<{ message: string }>(`/admin/institutions/fees/${id}`, { method: "DELETE" }),
    payments: (id: number) => request<InstitutionPaymentDto[]>(`/admin/institutions/fees/${id}/payments`),
    payMulti: (payload: { feeIds: number[]; amount: number; paymentMethod: string; paymentDate?: string; reference?: string; notes?: string }) =>
      request<InstitutionPayMultiResult>(`/admin/institutions/fees/pay-multi`, { method: "POST", body: JSON.stringify(payload) }),
  },
  dashboard: () => request<InstitutionDashboardDto>(`/admin/institutions/dashboard`),
};

export interface MessageDto {
  id: string;
  sender_id: string;
  recipient_id: string;
  is_from_admin: boolean;
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ConversationDto {
  user_id: number;
  last_message_at: string;
  unread: number;
}

export const messagesApi = {
  peerAdmin: () => request<{ admin_id: number | null }>("/messages/peer-admin"),

  thread: (peerId: string | number) => request<MessageDto[]>(`/messages/thread/${peerId}`),

  send: (payload: {
    recipient_id: string | number;
    content?: string | null;
    attachment_url?: string | null;
    attachment_name?: string | null;
    attachment_type?: string | null;
  }) => request<MessageDto>("/messages", { method: "POST", body: JSON.stringify(payload) }),

  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string }>("/messages/upload", { method: "POST", body: formData });
  },

  conversations: () => request<ConversationDto[]>("/messages/admin/conversations"),
};

export const ffhApi = {
  unidades: {
    list: () => request<UnidadeDto[]>("/admin/ffh/unidades"),
    create: (payload: { nome: string; bloco: number; edificio: number; apartamento: number; contacto: string; via: string; categoria: string }) =>
      request<UnidadeDto>("/admin/ffh/unidades", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: { nome?: string; bloco?: number; edificio?: number; apartamento?: number; contacto?: string; categoria?: string; divida_acumulada?: number }) =>
      request<UnidadeDto>(`/admin/ffh/unidades/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id: number) =>
      request<{ message: string }>(`/admin/ffh/unidades/${id}`, { method: "DELETE" }),
    cascadePayment: (id: number, payload: { ano: number; mesesSelecionados: number[]; valor: number; paymentMethod: string }) =>
      request<CascadePaymentResult>(`/admin/ffh/unidades/${id}/cascade-payment`, { method: "POST", body: JSON.stringify(payload) }),
  },
  fees: {
    listByYear: (year: number) => request<CondominiumFeeDto[]>(`/admin/ffh/fees?year=${year}`),
    listYears: () => request<number[]>("/admin/ffh/fees/years"),
    generate: (payload: { month: number | null; year: number; amount: number; unidadeIds: number[] }) =>
      request<{ created: number; skipped: number }>("/admin/ffh/fees/generate", { method: "POST", body: JSON.stringify(payload) }),
    pay: (id: number, payload: { amount: number; paymentMethod: string }) =>
      request<CondominiumFeeDto>(`/admin/ffh/fees/${id}/payment`, { method: "POST", body: JSON.stringify(payload) }),
    updateStatus: (id: number, status: "PENDING" | "PAID" | "OVERDUE" | "PENDING_VERIFICATION") =>
      request<CondominiumFeeDto>(`/admin/ffh/fees/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
};

export interface GalleryImageDto {
  id: string;
  image_url: string;
  title: string | null;
  display_order: number;
  created_at: string;
}

export const aboutGalleryApi = {
  list: () => request<GalleryImageDto[]>("/admin/about-gallery"),
  create: (payload: { image_url: string; title?: string | null; display_order?: number }) =>
    request<GalleryImageDto>("/admin/about-gallery", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string | number, payload: { title?: string | null; display_order?: number }) =>
    request<GalleryImageDto>(`/admin/about-gallery/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: string | number) =>
    request<{ message: string }>(`/admin/about-gallery/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string }>("/admin/about-gallery/upload", { method: "POST", body: formData });
  },
};

export const publicAboutGalleryApi = {
  list: () => request<GalleryImageDto[]>("/about-gallery"),
};

export interface CommonAreaDto {
  id: string;
  name: string;
  description: string;
  capacity: number;
  rules?: string;
}

export interface ReservationDto {
  id: string;
  user_id: string;
  area_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  common_areas?: { name: string };
}

export const reservationsApi = {
  list: () => request<ReservationDto[]>("/reservations"),
  listMine: () => request<ReservationDto[]>("/reservations/my"),
  listAreas: () => request<CommonAreaDto[]>("/reservations/areas"),
  create: (payload: { area_id: number | string; reservation_date: string; start_time: string; end_time: string; notes?: string | null }) =>
    request<ReservationDto>("/reservations", { method: "POST", body: JSON.stringify(payload) }),
  updateStatus: (id: number | string, status: string) =>
    request<ReservationDto>(`/reservations/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/reservations/${id}`, { method: "DELETE" }),
};

export interface MarketplaceServiceDto {
  id: string;
  user_id?: string | null;
  owner_name: string;
  business_name: string;
  category: string;
  phone: string;
  email: string;
  location: string | null;
  description: string;
  full_description: string | null;
  hours: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
}

export interface MarketplaceServiceInput {
  owner_name: string;
  business_name: string;
  category: string;
  phone: string;
  email?: string;
  location?: string | null;
  description: string;
  full_description?: string | null;
  hours?: string | null;
  image_url?: string | null;
}

export const marketplaceApi = {
  list: () => request<MarketplaceServiceDto[]>("/marketplace"),
  listApproved: () => request<MarketplaceServiceDto[]>("/marketplace"),
  listAll: () => request<MarketplaceServiceDto[]>("/admin/marketplace"),
  listMine: () => request<MarketplaceServiceDto[]>("/marketplace/my"),
  create: (payload: MarketplaceServiceInput) =>
    request<MarketplaceServiceDto>("/marketplace", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Partial<MarketplaceServiceInput>) =>
    request<MarketplaceServiceDto>(`/marketplace/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  updateStatus: (id: number | string, status: string) =>
    request<MarketplaceServiceDto>(`/admin/marketplace/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: (id: number | string) =>
    request<{ message: string }>(`/marketplace/${id}`, { method: "DELETE" }),
  uploadImage: (fileOrFormData: File | FormData) => {
    const formData = fileOrFormData instanceof FormData ? fileOrFormData : (() => {
      const fd = new FormData();
      fd.append("image", fileOrFormData);
      return fd;
    })();
    return request<{ url: string }>("/marketplace/upload", { method: "POST", body: formData });
  },
};


