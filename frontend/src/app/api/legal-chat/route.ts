import { NextRequest, NextResponse } from 'next/server';

/** Server-side backend URL (preferred in Docker). Falls back to public URL used by other client calls. */
function backendBase(): string {
    const raw =
        process.env.API_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://127.0.0.1:8000';
    return raw.replace(/\/$/, '');
}

export async function POST(req: NextRequest) {
    const target = `${backendBase()}/api/legal-chat`;
    let body: string;
    try {
        body = await req.text();
    } catch {
        return NextResponse.json({ detail: 'Invalid request body' }, { status: 400 });
    }

    const auth = req.headers.get('authorization');

    try {
        const upstream = await fetch(target, {
            method: 'POST',
            headers: {
                'Content-Type': req.headers.get('content-type') || 'application/json',
                ...(auth ? { Authorization: auth } : {}),
            },
            body,
            cache: 'no-store',
        });
        const text = await upstream.text();
        return new NextResponse(text, {
            status: upstream.status,
            headers: {
                'Content-Type': upstream.headers.get('content-type') || 'application/json',
            },
        });
    } catch {
        return NextResponse.json(
            {
                detail:
                    'Could not reach the Python API. Start it with `python api.py` (port 8000) or set API_BACKEND_URL / NEXT_PUBLIC_API_URL to your FastAPI base URL.',
            },
            { status: 502 }
        );
    }
}
