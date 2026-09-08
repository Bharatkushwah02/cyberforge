export type LabId = 'sqli' | 'idor' | 'xss' | 'traversal' | 'command';

export interface ServerDocument {
  filename: string;
  title: string;
  category: string;
  content: string;
  isRestricted?: boolean;
}

export interface DiagnosticResult {
  host: string;
  output: string;
  commandInjected: boolean;
  executedCommand?: string;
  flag?: string;
}

export interface Lab {
  id: LabId;
  number: number;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate';
  targetEndpoint: string;
  objective: string;
  overview: string;
  whyItMatters: string;
  hints: string[];
  solutionSteps: string[];
  samplePayloads: { title: string; payload: string; explanation: string }[];
  vulnerableCode: {
    language: string;
    file: string;
    code: string;
    vulnerabilityHighlight: string;
  };
  secureCode: {
    language: string;
    file: string;
    code: string;
    remediationExplanation: string;
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  stock: number;
  isHidden?: boolean;
}

export interface Review {
  id: string;
  productId: number;
  author: string;
  avatar: string;
  comment: string;
  rating: number;
  createdAt: string;
  isMalicious?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  tamperedPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  items: {
    productId: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Flagged';
  shippingAddress: string;
  isConfidential?: boolean;
  internalNotes?: string;
  vipToken?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'admin';
  walletBalance: number;
  avatar?: string;
  token?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  url: string;
  isExecutable: boolean;
  content: string;
}

export interface RequestInterceptorState {
  enabled: boolean;
  pendingRequest: {
    method: string;
    url: string;
    body: Record<string, any>;
    headers: Record<string, string>;
  } | null;
}
