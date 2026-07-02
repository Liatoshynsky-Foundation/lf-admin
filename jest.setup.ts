import '@testing-library/jest-dom';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import type { MessageChannel as MessageChannelType, MessagePort as MessagePortType } from 'node:worker_threads';
import type {
  fetch as fetchType,
  Headers as HeadersType,
  Request as RequestType,
  Response as ResponseType
} from 'undici';

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

globalThis.ReadableStream = ReadableStream as unknown as typeof globalThis.ReadableStream;
globalThis.WritableStream = WritableStream as unknown as typeof globalThis.WritableStream;
globalThis.TransformStream = TransformStream as unknown as typeof globalThis.TransformStream;

type GlobalWithMessaging = typeof globalThis & {
  MessageChannel: typeof globalThis.MessageChannel;
  MessagePort: typeof globalThis.MessagePort;
};

if (globalThis.fetch === undefined) {
  /* eslint-disable-next-line @typescript-eslint/no-require-imports */
  const { MessageChannel: WTMC, MessagePort: WTMP } = require('node:worker_threads') as {
    MessageChannel: typeof MessageChannelType;
    MessagePort: typeof MessagePortType;
  };

  const globalWithMessaging = globalThis as GlobalWithMessaging;

  const savedMessageChannel = globalWithMessaging.MessageChannel;
  const savedMessagePort = globalWithMessaging.MessagePort;

  globalWithMessaging.MessageChannel = WTMC as unknown as typeof globalThis.MessageChannel;
  globalWithMessaging.MessagePort = WTMP as unknown as typeof globalThis.MessagePort;

  /* eslint-disable-next-line @typescript-eslint/no-require-imports */
  const { fetch, Request, Response, Headers } = require('undici') as {
    fetch: typeof fetchType;
    Request: typeof RequestType;
    Response: typeof ResponseType;
    Headers: typeof HeadersType;
  };
  globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
  globalThis.Request = Request as unknown as typeof globalThis.Request;
  globalThis.Response = Response as unknown as typeof globalThis.Response;
  globalThis.Headers = Headers as unknown as typeof globalThis.Headers;

  globalWithMessaging.MessageChannel = savedMessageChannel;
  globalWithMessaging.MessagePort = savedMessagePort;
}

if (globalThis.structuredClone === undefined) {
  globalThis.structuredClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
}

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
) as jest.Mock;

jest.mock('~/middleware/logger/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('@azure/storage-blob', () => {
  type MockBlobServiceClient = jest.Mock & {
    fromConnectionString: jest.Mock;
  };

  const mockBlockBlobClient = {
    upload: jest.fn().mockResolvedValue({}),
    uploadData: jest.fn().mockResolvedValue({}),
    download: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    exists: jest.fn().mockResolvedValue(true),
    getProperties: jest.fn().mockResolvedValue({}),
    url: 'https://mock.blob.url/test'
  };

  const mockContainerClient = {
    getBlockBlobClient: jest.fn().mockReturnValue(mockBlockBlobClient),
    listBlobsFlat: jest.fn().mockReturnValue([])
  };

  const mockBlobServiceClient = jest.fn().mockImplementation(() => ({
    getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
  })) as MockBlobServiceClient;

  mockBlobServiceClient.fromConnectionString = jest.fn().mockReturnValue({
    getContainerClient: jest.fn().mockReturnValue(mockContainerClient)
  });

  return {
    BlobServiceClient: mockBlobServiceClient
  };
});
