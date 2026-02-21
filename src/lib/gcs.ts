import { Storage } from '@google-cloud/storage';

const BUCKET_NAME = process.env.GCS_BUCKET_RESUMES || 'hireu-resumes-staging';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = 'application/pdf';

/**
 * Credential order:
 * 1. GCS_SERVICE_ACCOUNT_JSON (env) – explicit service account key (recommended for production).
 * 2. Otherwise: Storage() uses Application Default Credentials (ADC):
 *    - GOOGLE_APPLICATION_CREDENTIALS (path to key file), or
 *    - gcloud Application Default Credentials from: gcloud auth application-default login
 *    Note: "gcloud config" (account/project) is for the CLI only; Node uses ADC, which can be a different account.
 */
function getStorage(): Storage {
    const keyJson = process.env.GCS_SERVICE_ACCOUNT_JSON;
    if (keyJson) {
        try {
            const credentials = JSON.parse(keyJson);
            return new Storage({ credentials });
        } catch (e) {
            console.error('[GCS] Invalid GCS_SERVICE_ACCOUNT_JSON:', e);
        }
    }
    return new Storage(); // ADC: GOOGLE_APPLICATION_CREDENTIALS or gcloud application-default login
}

export function getResumesBucket() {
    return getStorage().bucket(BUCKET_NAME);
}

export function getResumesBucketName(): string {
    return BUCKET_NAME;
}

export const RESUME_UPLOAD = {
    MAX_FILE_SIZE_BYTES,
    ALLOWED_MIME,
    BUCKET_NAME,
} as const;

/**
 * Extract GCS object name from a storage URL (e.g. https://storage.googleapis.com/bucket/path or gs://bucket/path).
 * Returns null if not our bucket or invalid.
 */
export function parseResumeObjectNameFromUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    // gs://bucket/path
    const gsMatch = trimmed.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (gsMatch) {
        if (gsMatch[1] !== BUCKET_NAME) return null;
        return decodeURIComponent(gsMatch[2]);
    }
    // https://storage.googleapis.com/bucket/path or https://storage.cloud.google.com/bucket/path
    const httpsMatch = trimmed.match(/^https:\/\/(?:storage\.googleapis\.com|storage\.cloud\.google\.com)\/([^/]+)\/(.+)$/);
    if (httpsMatch) {
        if (httpsMatch[1] !== BUCKET_NAME) return null;
        return decodeURIComponent(httpsMatch[2]);
    }
    return null;
}

/**
 * Public URL for an object in our resumes bucket (requires bucket/objects to be publicly readable).
 */
export function getPublicResumeUrl(objectName: string): string {
    const path = objectName.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `https://storage.googleapis.com/${BUCKET_NAME}/${path}`;
}
