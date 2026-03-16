import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 600000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token from localStorage for authenticated requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('legaldoc_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('legaldoc_token');
                localStorage.removeItem('legaldoc_user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

export interface AnalysisResult {
    id: string;
    filename: string;
    text: string;
    metadata: Record<string, any>;
    summary: any;
    risk_score: number;
    risks: Array<{ severity: string; title: string; description: string }>;
    created_at?: string;
}

// --- Auth ---
export const login = async (email: string, password: string) => {
    const { data } = await api.post<{ access_token: string; user: { id: string; email: string; full_name: string | null } }>('/api/auth/login', { email, password });
    return data;
};

export const register = async (email: string, password: string, fullName?: string) => {
    const { data } = await api.post<{ access_token: string; user: { id: string; email: string; full_name: string | null } }>('/api/auth/register', { email, password, full_name: fullName ?? null });
    return data;
};

// --- Documents (require auth) ---
export const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getAnalysis = async (id: string) => {
    const response = await api.get(`/api/analysis/${id}`);
    return response.data;
};

export const getAnalyses = async () => {
    const response = await api.get('/api/analyses');
    return response.data;
};

/** Get download URL for an analysis report (call in new tab or fetch and blob) */
export function getDownloadUrl(analysisId: string): string {
    const token = typeof window !== 'undefined' ? localStorage.getItem('legaldoc_token') : null;
    const base = API_BASE_URL.replace(/\/$/, '');
    return `${base}/api/analysis/${analysisId}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}

/** Download analysis report as file (uses Authorization header via fetch with token) */
export const downloadAnalysisReport = async (analysisId: string, filename?: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('legaldoc_token') : null;
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE_URL}/api/analysis/${analysisId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const name = filename || res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] || `analysis_${analysisId}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};
