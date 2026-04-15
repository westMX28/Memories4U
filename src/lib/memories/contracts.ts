export const memoryStatuses = [
  'created',
  'unlocked',
  'queued',
  'processing',
  'preview_ready',
  'completed',
  'delivered',
  'failed',
] as const;

export type MemoryStatus = (typeof memoryStatuses)[number];
export const sourceImageStorageTypes = ['remote_url', 'inline_data_url'] as const;
export const supportedSourceImageMimeTypes = ['image/png', 'image/jpeg'] as const;

export type SourceImageStorage = (typeof sourceImageStorageTypes)[number];
export type SupportedSourceImageMimeType = (typeof supportedSourceImageMimeTypes)[number];

export type SourceImage = {
  storage: SourceImageStorage;
  url?: string;
  dataUrl?: string;
  mimeType?: SupportedSourceImageMimeType;
  filename?: string;
  sizeBytes?: number;
  sha256?: string;
  label?: string;
};

export type MemoryAsset = {
  provider: 'cloudinary' | 'make' | 'manual';
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
};

export type DeliveryRecord = {
  channel: 'email';
  provider: 'make' | 'manual';
  recipient: string;
  deliveryId?: string;
  deliveredAt: string;
};

export type MemoryJob = {
  id: string;
  accessToken: string;
  email: string;
  clientRequestId?: string;
  customerName?: string;
  storyPrompt: string;
  sourceImages: SourceImage[];
  cloudinaryFolder?: string;
  status: MemoryStatus;
  unlocked: boolean;
  paymentReference?: string;
  paymentProvider?: 'stripe' | 'manual';
  previewAsset?: MemoryAsset;
  finalAsset?: MemoryAsset;
  delivery?: DeliveryRecord;
  cloudinaryCloudName?: string;
  lastError?: string;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type CreateMemoryJobInput = {
  email: string;
  clientRequestId?: string;
  customerName?: string;
  storyPrompt: string;
  sourceImages: SourceImage[];
  metadata?: Record<string, string>;
};

export type MemoryStatusResponse = {
  jobId: string;
  status: MemoryStatus;
  unlocked: boolean;
  previewAsset?: MemoryAsset;
  finalAsset?: MemoryAsset;
  delivery?: DeliveryRecord;
  lastError?: string;
  updatedAt: string;
};

export type OperatorOrderState =
  | 'payment_pending'
  | 'paid'
  | 'in_progress'
  | 'ready'
  | 'delivered'
  | 'needs_attention';

export type OperatorPaymentStatus = 'pending' | 'paid';

export type OperatorOrderStatusResponse = {
  summary: {
    orderId: string;
    jobId: string;
    createdAt: string;
    updatedAt: string;
    customerEmail: string;
    orderState: OperatorOrderState;
  };
  payment: {
    status: OperatorPaymentStatus;
    provider?: 'stripe' | 'manual';
    reference?: string;
  };
  generation: {
    status: MemoryStatus;
    unlocked: boolean;
    lastError?: string;
  };
  assets: {
    preview: {
      present: boolean;
      asset?: MemoryAsset;
    };
    final: {
      present: boolean;
      asset?: MemoryAsset;
    };
  };
  delivery: {
    delivered: boolean;
    provider?: 'make' | 'manual';
    recipient?: string;
    deliveryId?: string;
    deliveredAt?: string;
  };
  history: {
    mode: 'current_state_only';
    note: string;
    timestamps: {
      createdAt: string;
      updatedAt: string;
      deliveredAt?: string;
    };
    references: {
      paymentReference?: string;
      previewAssetUrl?: string;
      finalAssetUrl?: string;
      deliveryId?: string;
    };
  };
};

export type LegacyMakeJobStateResponse = {
  id: string;
  jobId: string;
  accessToken: string;
  status: MemoryStatus;
  unlocked: boolean;
  email: string;
  deliveryEmail: string;
  customerName?: string;
  storyPrompt: string;
  sourceImage1Url?: string;
  sourceImage2Url?: string;
  paymentReference?: string;
  paymentProvider?: 'stripe' | 'manual';
  previewAssetUrl?: string;
  finalAssetUrl?: string;
  previewAsset?: MemoryAsset;
  finalAsset?: MemoryAsset;
  delivery?: DeliveryRecord;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type UnlockJobInput = {
  paymentReference: string;
  provider?: 'stripe' | 'manual';
};

export type CheckoutSessionResponse = {
  checkoutUrl: string;
  sessionId: string;
};

export type CreateMemoryJobResponse = {
  jobId: string;
  accessToken: string;
  status: MemoryStatus;
  statusUrl: string;
  sourceImages: SourceImage[];
};

export type ErrorResponse = {
  error: string;
  code?: string;
};

export type MediaCommand =
  | {
      command: 'request_generation';
      provider: 'make' | 'manual';
    }
  | {
      command: 'mark_processing';
      provider: 'make' | 'manual';
    }
  | {
      command: 'mark_preview_ready';
      provider: 'cloudinary' | 'make' | 'manual';
      asset: MemoryAsset;
    }
  | {
      command: 'mark_completed';
      provider: 'cloudinary' | 'make' | 'manual';
      asset: MemoryAsset;
    }
  | {
      command: 'mark_failed';
      provider: 'make' | 'manual';
      error: string;
    };

export type DeliveryCommand = {
  channel: 'email';
  provider: 'make' | 'manual';
  recipient: string;
  deliveryId?: string;
};

export type MakeUpdateEvent =
  | {
      event: 'queued' | 'processing';
      jobId: string;
    }
  | {
      event: 'preview_ready' | 'completed';
      jobId: string;
      asset: MemoryAsset;
    }
  | {
      event: 'failed';
      jobId: string;
      error: string;
    }
  | {
      event: 'delivered';
      jobId: string;
      delivery: DeliveryCommand;
    };
