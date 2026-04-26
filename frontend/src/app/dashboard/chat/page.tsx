'use client';

import { useState } from 'react';
import { Send, User, Bot, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { sendLegalChat, type LegalChatRole } from '@/lib/api';
import axios from 'axios';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const WELCOME: ChatMessage = {
    role: 'assistant',
    content:
        'Hello! I am your Legal AI Assistant. How can I help you analyze your documents today?',
};

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const clearHistory = () => {
        setMessages([WELCOME]);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const historyForApi = messages.map((m) => ({
            role: m.role as LegalChatRole,
            content: m.content,
        }));

        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const { reply } = await sendLegalChat(text, historyForApi);
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch (e) {
            let detail = 'Something went wrong. Please try again.';
            if (axios.isAxiosError(e)) {
                if (e.response?.status === 404) {
                    detail =
                        'Assistant endpoint was not found. Restart the FastAPI server (`python api.py`) so it includes /api/legal-chat, or check API_BACKEND_URL / NEXT_PUBLIC_API_URL.';
                } else if (e.response?.data?.detail) {
                    const d = e.response.data.detail;
                    detail =
                        typeof d === 'string' ? d : Array.isArray(d) ? d.map((x: { msg?: string }) => x.msg).join(' ') : detail;
                } else if (e.response?.status === 502) {
                    detail =
                        'Could not reach the document API from the web server. Ensure the backend is running on port 8000 (or set API_BACKEND_URL for the Next.js proxy).';
                }
            }
            setMessages((prev) => [...prev, { role: 'assistant', content: detail }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-bold font-heading tracking-tight">AI Legal Assistant</h2>
                <Button variant="outline" size="sm" type="button" onClick={clearHistory}>
                    Clear History
                </Button>
            </div>

            <Card className="flex-1 flex flex-col bg-muted/5 border overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                                    msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card border rounded-bl-none shadow-sm'
                                }`}
                            >
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <Bot className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-card border p-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}
                </CardContent>

                <div className="p-4 bg-background border-t flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0" type="button" disabled aria-label="Attachments (not available)">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <input
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                        placeholder="Ask a legal question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                void handleSend();
                            }
                        }}
                    />
                    <Button size="icon" type="button" onClick={() => void handleSend()} disabled={loading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
