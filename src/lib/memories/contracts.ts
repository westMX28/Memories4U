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

export type SourceImage = {
  url: string;
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
  customerName?: string;
  storyPrompt: string;
  sourceImages: SourceImage[];
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

export type UnlockJobInput = {
  paymentReference: string;
  provider?: 'stripe' | 'manual';
};

export type CheckoutSessionResponse = {
  checkoutUrl: string;
  sessionId: string;
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
