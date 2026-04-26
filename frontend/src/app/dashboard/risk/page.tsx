'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { getAnalyses, type AnalysisResult } from '@/lib/api';

type FlatRisk = {
    title: string;
    severity: string;
    description: string;
    impact?: string;
    filename: string;
    analysisId: string;
};

function normalizeSeverity(raw: string): string {
    const s = (raw || '').toLowerCase();
    if (s.includes('critical')) return 'Critical';
    if (s.includes('high')) return 'High';
    if (s.includes('medium')) return 'Medium';
    if (s.includes('low')) return 'Low';
    return raw?.trim() || 'Unknown';
}

function severitySortKey(sev: string): number {
    const order: Record<string, number> = {
        Critical: 0,
        High: 1,
        Medium: 2,
        Low: 3,
        Unknown: 4,
    };
    return order[normalizeSeverity(sev)] ?? 5;
}

function badgeVariantForSeverity(sev: string): 'destructive' | 'warning' | 'default' | 'secondary' | 'success' | 'outline' {
    const n = normalizeSeverity(sev);
    if (n === 'Critical') return 'destructive';
    if (n === 'High') return 'warning';
    if (n === 'Medium') return 'default';
    if (n === 'Low') return 'success';
    return 'outline';
}

export default function RiskAnalysisPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['analyses'],
        queryFn: getAnalyses,
        refetchInterval: 30_000,
    });

    const { flatRisks, distribution, stats } = useMemo(() => {
        const results: AnalysisResult[] = data?.results ?? [];
        const stats = data?.stats ?? { total: 0, avg_risk: 0, critical: 0 };
        const flat: FlatRisk[] = [];
        for (const r of results) {
            const risks = r.risks ?? [];
            for (const risk of risks) {
                flat.push({
                    title: risk.title || 'Risk',
                    severity: normalizeSeverity(risk.severity || ''),
                    description: risk.description || '',
                    impact: risk.impact,
                    filename: r.filename,
                    analysisId: r.id,
                });
            }
        }
        flat.sort((a, b) => severitySortKey(a.severity) - severitySortKey(b.severity));

        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, Other: 0 };
        for (const fr of flat) {
            const k = normalizeSeverity(fr.severity);
            if (k in counts) counts[k as keyof typeof counts]++;
            else counts.Other++;
        }
        const total = flat.length;
        return { flatRisks: flat, distribution: { counts, total }, stats };
    }, [data]);

    const pct = (n: number) => (distribution.total > 0 ? Math.round((n / distribution.total) * 100) : 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold font-heading tracking-tight">Risk Analysis Dashboard</h2>
                <p className="text-muted-foreground">
                    Risk items detected in your uploaded documents (same data as each analysis). Nothing here until you analyze PDFs on this
                    account.
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your analyses…
                </div>
            )}

            {isError && (
                <p className="text-sm text-destructive">Could not load analyses. Check that you are logged in and the API is running.</p>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>High Priority Risks</CardTitle>
                        <CardDescription>From your analyzed documents ({stats.total} file{stats.total === 1 ? '' : 's'}).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isLoading && flatRisks.length === 0 && (
                            <div className="text-sm text-muted-foreground border rounded-lg p-8 text-center">
                                No risk rows yet. Upload a document from <span className="font-medium text-foreground">Upload Document</span>{' '}
                                to run AI risk extraction for your account.
                            </div>
                        )}
                        {flatRisks.map((risk, i) => (
                            <Link
                                key={`${risk.analysisId}-${i}`}
                                href={`/dashboard/analysis/${risk.analysisId}`}
                                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                                    <div className="min-w-0">
                                        <div className="font-semibold text-sm">{risk.title}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <FileText className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{risk.filename}</span>
                                        </div>
                                        {(risk.description || risk.impact) && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {risk.description}
                                                {risk.impact ? ` — ${risk.impact}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Badge variant={badgeVariantForSeverity(risk.severity)} className="shrink-0">
                                    {risk.severity}
                                </Badge>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-muted/10 border-dashed">
                    <CardHeader>
                        <CardTitle>Risk distribution</CardTitle>
                        <CardDescription>Share of flagged risk items by severity (this session&apos;s uploads).</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="rounded-lg border bg-card/50 p-4 text-center">
                            <div className="text-3xl font-bold tabular-nums">{Math.round(stats.avg_risk)}</div>
                            <div className="text-xs text-muted-foreground">Avg. document risk score (0–100)</div>
                            <div className="text-xs text-muted-foreground mt-2">
                                {distribution.total} risk item{distribution.total === 1 ? '' : 's'} across {stats.total} document
                                {stats.total === 1 ? '' : 's'}
                            </div>
                        </div>

                        {distribution.total === 0 ? (
                            <p className="text-sm text-muted-foreground text-center">No items to chart yet.</p>
                        ) : (
                            <div className="space-y-3 text-sm">
                                {(
                                    [
                                        ['Critical', distribution.counts.Critical, 'bg-red-500'],
                                        ['High', distribution.counts.High, 'bg-amber-500'],
                                        ['Medium', distribution.counts.Medium, 'bg-yellow-400'],
                                        ['Low', distribution.counts.Low, 'bg-emerald-500'],
                                    ] as const
                                ).map(([label, count, color]) => (
                                    <div key={label}>
                                        <div className="flex justify-between mb-1">
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                                {label}
                                            </span>
                                            <span className="text-muted-foreground tabular-nums">
                                                {count} ({pct(count)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct(count)}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {distribution.counts.Other > 0 && (
                                    <div className="text-xs text-muted-foreground">Other / unknown severity: {distribution.counts.Other}</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
