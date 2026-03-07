import { KeiApiRequest, KeiApiResponse } from '@/types';
import axios, { AxiosError } from 'axios';

const KEI_API_BASE_URL = 'https://api.kie.ai';
const NANO_BANANA_MODEL = 'nano-banana-2';

interface CreateTaskResponse {
  code: number;
  msg: string;
  data?: {
    taskId?: string;
    recordId?: string;
  };
}

interface TaskDetailResponse {
  code: number;
  msg: string;
  data?: {
    taskId?: string;
    state?: string;        // "pending" | "processing" | "success" | "failed"
    resultJson?: string;   // JSON string: { resultUrls: string[] }
    failMsg?: string;
    failCode?: string;
  };
}

export class KeiApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = KEI_API_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async waitForTask(taskId: string, maxAttempts = 60): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      let response;
      try {
        response = await axios.get<TaskDetailResponse>(
          `${this.baseUrl}/api/v1/jobs/recordInfo`,
          {
            params: { taskId },
            headers: this.headers,
            timeout: 15000,
          }
        );
      } catch (pollError) {
        const e = pollError as AxiosError;
        console.error(`[KIE] Poll error (attempt ${attempt + 1}):`, e.response?.status, e.response?.data);
        throw new Error(`Poll failed (${e.response?.status}): ${JSON.stringify(e.response?.data)}`);
      }

      console.log(`[KIE] Poll response (attempt ${attempt + 1}):`, JSON.stringify(response.data));

      const { code, msg, data } = response.data;

      if (code !== 200) {
        throw new Error(msg || `Poll error: ${code}`);
      }

      const state = data?.state;

      if (state === 'success') {
        const resultJson = data?.resultJson ? JSON.parse(data.resultJson) : null;
        const url = resultJson?.resultUrls?.[0];
        if (!url) throw new Error('Task succeeded but no image URL in resultJson');
        return url;
      }

      if (state === 'failed' || state === 'error') {
        throw new Error(`Task failed: ${data?.failMsg || msg || 'Unknown error'}`);
      }

      console.log(`[KIE] Task ${taskId} state: ${state ?? 'unknown'} (attempt ${attempt + 1})`);
    }

    throw new Error('Task timed out after polling. Please try again.');
  }

  async generateImage(request: KeiApiRequest): Promise<KeiApiResponse> {
    try {
      const response = await axios.post<CreateTaskResponse>(
        `${this.baseUrl}/api/v1/jobs/createTask`,
        {
          model: NANO_BANANA_MODEL,
          input: {
            prompt: request.prompt,
            aspect_ratio: request.aspect_ratio ?? 'auto',
            resolution: request.resolution ?? '1K',
            output_format: request.output_format ?? 'jpg',
          },
        },
        { headers: this.headers, timeout: 30000 }
      );

      const { code, msg, data } = response.data;
      console.log('[KIE] createTask response:', response.data);

      if (code !== 200) {
        throw new Error(msg || `API error: ${code}`);
      }

      const taskId = data?.taskId || data?.recordId;
      if (!taskId) throw new Error('No task ID returned from API');

      const imageUrl = await this.waitForTask(taskId);
      return { image_url: imageUrl };
    } catch (error) {
      const axiosError = error as AxiosError<{ code?: number; msg?: string }>;

      if (axiosError.response) {
        const { status, data } = axiosError.response;
        const msg = data?.msg;

        if (status === 401) throw new Error('Invalid API key. Check your KEI_API_KEY.');
        if (status === 402) throw new Error('Insufficient credits. Top up at https://kie.ai/pricing');
        if (status === 429) throw new Error('Rate limit exceeded. Please wait and retry.');
        throw new Error(`API error (${status}): ${msg || 'Unknown error'}`);
      }

      if (axiosError.request) throw new Error('Network error. Check your internet connection.');
      throw error;
    }
  }

  async generateImagePro(request: KeiApiRequest): Promise<KeiApiResponse> {
    return this.generateImage(request);
  }
}

export function createKeiClient(): KeiApiClient {
  const apiKey = process.env.KEI_API_KEY;
  if (!apiKey) throw new Error('KEI_API_KEY environment variable is not set');
  return new KeiApiClient(apiKey);
}
