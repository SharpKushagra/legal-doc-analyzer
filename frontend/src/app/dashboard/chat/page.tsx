'use client';

import { useState } from 'react';
import { Send, User, Bot, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function ChatPage() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Legal AI Assistant. How can I help you analyze your documents today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages([...messages, userMsg]);
        setInput('');
        setLoading(true);

        // Mock Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I've analyzed your question: "${input}". Based on standard contract law, this clause typically requires mutual indemnification. Would you like me to draft a revision?`
            }]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-bold font-heading tracking-tight">AI Legal Assistant</h2>
                <Button variant="outline" size="sm">Clear History</Button>
            </div>

            <Card className="flex-1 flex flex-col bg-muted/5 border overflow-hidden">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-card border rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-card border p-3 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}
                </CardContent>

                <div className="p-4 bg-background border-t flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <input
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                        placeholder="Ask a legal question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}
