'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getAnalysis } from '@/lib/api';
import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    Share2,
    Download,
    Loader2,
    ShieldAlert,
    Clock,
    Gavel
} from 'lucide-react';
import { downloadAnalysisReport } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

export default function AnalysisResultPage() {
    const { id } = useParams();
    const router = useRouter();
    const [downloading, setDownloading] = useState(false);

    const { data: analysisData, isLoading, error } = useQuery({
        queryKey: ['analysis', id],
        queryFn: () => getAnalysis(id as string),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Fetching Analysis Results...</p>
            </div>
        );
    }

    if (error || !analysisData) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] space-y-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Analysis Not Found</h2>
                <p className="text-muted-foreground max-w-md">
                    The requested analysis could not be retrieved. It may have expired or the ID is invalid.
                </p>
                <Button onClick={() => router.push('/dashboard/upload')}>Upload New Document</Button>
            </div>
        );
    }

    const { filename, text, summary, risk_score, risks, metadata } = analysisData;

    // Determine High Risk status
    const riskColor = risk_score > 70 ? 'text-red-600' : risk_score > 40 ? 'text-amber-500' : 'text-emerald-500';
    const riskBg = risk_score > 70 ? 'bg-red-500' : risk_score > 40 ? 'bg-amber-500' : 'bg-emerald-500';
    const riskBadge = risk_score > 70 ? 'destructive' : risk_score > 40 ? 'warning' : 'success';

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">

            {/* 1. Top Banner: Risk Score & Metadata (Full Width) */}
            <Card className="shrink-0 bg-background border-none shadow-md overflow-hidden relative">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${riskBg}`} />
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant={riskBadge} className="text-sm px-3 py-1">
                                    {risk_score > 70 ? "CRITICAL RISK DETECTED" : risk_score > 40 ? "MODERATE RISK DETECTED" : "LOW RISK DOCUMENT"}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> Analyzed just now
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold font-heading tracking-tight">{metadata?.Court || "Legal Document Analysis"}</h1>
                            <div className="text-base text-muted-foreground mt-2 flex gap-6">
                                <span className="flex items-center gap-2"><Gavel className="h-4 w-4" /> {metadata?.Type || "Contract Agreement"}</span>
                                <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> {filename}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    setDownloading(true);
                                    try {
                                        await downloadAnalysisReport(analysisData.id, `${(filename || 'document').replace(/\.pdf$/i, '')}_analysis_report.txt`);
                                    } finally {
                                        setDownloading(false);
                                    }
                                }}
                                disabled={downloading}
                            >
                                {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                Download Report
                            </Button>
                            <div className="flex items-center gap-6 bg-muted/30 p-4 rounded-xl border min-w-[200px] justify-between">
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</div>
                                    <div className={`text-5xl font-extrabold ${riskColor}`}>{risk_score}</div>
                                </div>
                                <div className="h-16 w-16 rounded-full border-4 border-muted flex items-center justify-center relative bg-background">
                                    <ShieldAlert className={`h-8 w-8 ${riskColor}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Main Content Area: Split 50/50 for Maximum Visibility */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

                {/* Left: Executive Summary (The "Soul") */}
                <Card className="flex flex-col shadow-sm border-t-4 border-t-primary/50">
                    <CardHeader className="py-6 border-b bg-muted/5">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <FileText className="h-6 w-6 text-primary" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 relative bg-muted/5">
                        <ScrollArea className="h-full">
                            {typeof summary === 'string' ? (
                                <div className="p-8 prose dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h3: ({ node, ...props }: any) => <h3 className="text-xl font-bold text-foreground mt-6 mb-3 border-b pb-1" {...props} />,
                                            strong: ({ node, ...props }: any) => <span className="font-bold text-primary" {...props} />,
                                            p: ({ node, ...props }: any) => <p className="leading-relaxed mb-4 text-foreground/90" {...props} />,
                                            ul: ({ node, ...props }: any) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                            li: ({ node, ...props }: any) => <li className="text-foreground/90" {...props} />,
                                        }}
                                    >
                                        {summary}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {/* Structured Summary Rendering */}
                                    {[
                                        { key: 'parties', title: 'Parties Involved', icon: <Share2 className="h-4 w-4" />, color: 'blue' },
                                        { key: 'court', title: 'Court Info', icon: <Gavel className="h-4 w-4" />, color: 'indigo' },
                                        { key: 'issues', title: 'Legal Issues', icon: <AlertTriangle className="h-4 w-4" />, color: 'amber' },
                                        { key: 'verdict', title: 'Verdict', icon: <CheckCircle2 className="h-4 w-4" />, color: 'emerald' },
                                        { key: 'summary', title: 'Plain English Summary', icon: <FileText className="h-4 w-4" />, color: 'slate' },
                                    ].map((section, i) => (
                                        summary[section.key] && (
                                            <div key={i} className="p-6 hover:bg-background transition-colors flex gap-5 group">
                                                <div className="mt-1.5 shrink-0">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-${section.color}-100 dark:bg-${section.color}-900/30 text-${section.color}-600 dark:text-${section.color}-400`}>
                                                        {section.icon}
                                                    </div>
                                                </div>
                                                <div className="space-y-3 w-full">
                                                    <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                                        {section.title}
                                                    </h4>
                                                    <div className={`bg-${section.color}-50/50 dark:bg-${section.color}-950/10 p-4 rounded-lg border border-${section.color}-100 dark:border-${section.color}-900/20`}>
                                                        <div className="text-base text-foreground/90 leading-relaxed font-medium">
                                                            {(() => {
                                                                const content = summary[section.key];
                                                                if (typeof content === 'string') return content;
                                                                if (Array.isArray(content)) return content.join(', ');
                                                                if (typeof content === 'object' && content !== null) {
                                                                    // Handle the specific case causing the error: {name, location}
                                                                    if (content.name) return `${content.name} ${content.location ? `(${content.location})` : ''}`;
                                                                    // Fallback for other objects
                                                                    return Object.entries(content).map(([k, v]) => `${k}: ${v}`).join(', ');
                                                                }
                                                                return String(content);
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Right: Identified Risks (The "Details") */}
                <Card className="flex flex-col shadow-sm border-t-4 border-t-destructive/50">
                    <CardHeader className="py-6 border-b bg-muted/5 flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                            Identified Risks
                            <Badge variant="outline" className="ml-2 text-base px-2 py-0.5">{risks.length} Issues</Badge>
                        </CardTitle>
                        <Button variant="ghost" size="sm">Export Report</Button>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 bg-muted/5">
                        <ScrollArea className="h-full">
                            <div className="divide-y divide-border/50">
                                {risks.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                                        <h3 className="text-xl font-medium text-foreground">All Clear</h3>
                                        <p className="text-lg">No significant risks were detected in this document.</p>
                                    </div>
                                ) : (
                                    risks.map((risk: any, i: number) => (
                                        <div key={i} className="p-6 hover:bg-background transition-colors flex gap-5 group">
                                            <div className="mt-1.5 shrink-0">
                                                <div className={`h-3 w-3 rounded-full shadow-lg ${risk.severity === 'Critical' ? 'bg-red-500 ring-2 ring-red-200 dark:ring-red-900' : risk.severity === 'High' ? 'bg-orange-500 ring-2 ring-orange-200 dark:ring-orange-900' : 'bg-yellow-500'}`} />
                                            </div>
                                            <div className="space-y-3 w-full">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{risk.title}</h4>
                                                    <Badge variant="outline" className={`text-xs font-semibold ${risk.severity === 'Critical' ? 'border-red-500 text-red-500' : risk.severity === 'High' ? 'border-orange-500 text-orange-500' : 'text-yellow-600'}`}>
                                                        {risk.severity.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <div className="grid gap-3">
                                                    <div className="bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                                                        <span className="text-xs font-bold text-destructive uppercase tracking-wide block mb-1">The Risk</span>
                                                        <p className="text-sm text-foreground/90">{risk.description}</p>
                                                    </div>

                                                    {risk.impact && (
                                                        <div className="bg-orange-50/50 dark:bg-orange-950/10 p-3 rounded-lg border border-orange-100 dark:border-orange-900/20">
                                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide block mb-1">The Impact</span>
                                                            <p className="text-sm text-foreground/90">{risk.impact}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

