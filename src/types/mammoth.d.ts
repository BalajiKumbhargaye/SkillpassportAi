declare module "mammoth" {
  export function extractRawText(input: {
    path?: string;
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
  }): Promise<{
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }>;
}