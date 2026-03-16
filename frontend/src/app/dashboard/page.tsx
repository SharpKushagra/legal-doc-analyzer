'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { FileText, AlertCircle, CheckCircle2, AlertTriangle, ArrowUpRight, Plus, Download, ShieldCheck, PieChart, BarChart3 } from "lucide-react";
import { getAnalyses } from '@/lib/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['analyses'],
        queryFn: getAnalyses,
        refetchInterval: 5000 // Refresh every 5s
    });

    const results = data?.results || [];
    const stats = data?.stats || { total: 0, avg_risk: 0, critical: 0 };

    // Prepare chart data - last 10 documents
    const chartData = results.slice(-10).map((r: any) => ({
        name: r.filename.length > 15 ? r.filename.substring(0, 15) + '...' : r.filename,
        risk: r.risk_score,
        full_name: r.filename
    }));

    const handleGenerateReport = () => {
        if (results.length === 0) return alert("No data to export.");

        // Generate CSV
        const headers = ["ID", "Filename", "Court", "Risk Score", "Critical Issues"];
        const rows = results.map((r: any) => [
            r.id,
            r.filename,
            r.metadata?.Court || "N/A",
            r.risk_score,
            r.risks.length
        ]);

        const csvContent = [headers.join(","), ...rows.map((row: any) => row.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `legal_doc_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleVerifyCompliance = () => {
        // Scroll to recent documents
        const docsSection = document.getElementById('recent-docs');
        if (docsSection) docsSection.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-3xl font-bold font-heading tracking-tight">Overview</h2>
                <Link href="/dashboard/upload">
                    <Button className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> New Analysis
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
                <StatCard
                    title="Documents Analyzed"
                    value={stats.total.toString()}
                    change="Total processed"
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                />
                <StatCard
                    title="Avg Risk Score"
                    value={`${Math.round(stats.avg_risk)}%`}
                    change={stats.avg_risk < 30 ? "Generally Safe" : stats.avg_risk > 70 ? "High Risk Level" : "Moderate Risk Level"}
                    icon={<PieChart className="h-4 w-4 text-primary" />}
                />
                <StatCard
                    title="Critical Flags"
                    value={stats.critical.toString()}
                    change="Requires immediate attention"
                    icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                />
                <StatCard
                    title="Compliance Rate"
                    value={`${Math.round(100 - stats.avg_risk)}%`}
                    change="Inverse risk metric"
                    icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
                {/* Recent Documents List */}
                <Card className="col-span-4 bg-background/50 backdrop-blur-sm flex flex-col" id="recent-docs">
                    <CardHeader>
                        <CardTitle>Recent Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                                <FileText className="h-12 w-12 mb-4 opacity-20" />
                                <p>No documents analyzed yet.</p>
                                <Button variant="link" asChild><Link href="/dashboard/upload">Upload your first document</Link></Button>
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto p-6 space-y-4">
                                {results.slice().reverse().map((doc: any, i: number) => {
                                    const status = doc.risk_score > 70 ? 'Critical' : doc.risk_score > 40 ? 'Review' : 'Safe';
                                    return (
                                        <Link href={`/dashboard/analysis/${doc.id}`} key={doc.id}>
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group mb-2 cursor-pointer">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="truncate min-w-0">
                                                        <div className="font-medium text-sm truncate">{doc.filename}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{doc.metadata?.Court || "Unknown Court"}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <Badge variant={status === 'Critical' ? 'destructive' : status === 'Safe' ? 'success' : 'warning'}>
                                                        {status}
                                                    </Badge>
                                                    <div className={`text-sm font-semibold w-8 text-right ${doc.risk_score > 70 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                        {doc.risk_score}%
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Risk Distribution Chart & Actions */}
                <Card className="col-span-3 bg-gradient-to-br from-background to-muted/20 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Risk Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-6">
                        {/* Interactive Chart */}
                        <div className="h-64 w-full bg-card/50 rounded-xl border p-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.risk > 70 ? '#ef4444' : entry.risk > 40 ? '#f59e0b' : '#10b981'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                    No data to visualize
                                </div>
                            )}
                        </div>

                        {/* Functional Quick Actions */}
                        <div className="mt-auto space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-1"
                                    onClick={handleGenerateReport}
                                >
                                    <Download className="h-6 w-6 text-primary" />
                                    <span className="font-semibold">Generate Report</span>
                                    <span className="text-xs text-muted-foreground font-normal">Export CSV</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all hover:-translate-y-1"
                                    onClick={handleVerifyCompliance}
                                >
                                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                                    <span className="font-semibold">Check Analysis</span>
                                    <span className="text-xs text-muted-foreground font-normal">Review Docs</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: any }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 text-primary/80 font-medium">
                    {change}
                </p>
            </CardContent>
        </Card>
    )
}
