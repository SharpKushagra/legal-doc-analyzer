'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import { getAnalyses, downloadAnalysisReport, type AnalysisResult } from '@/lib/api';

export default function MyDocumentsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['analyses'],
        queryFn: getAnalyses,
    });

    const results = data?.results ?? [];
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const handleDownload = async (doc: AnalysisResult) => {
        setDownloadingId(doc.id);
        try {
            await downloadAnalysisReport(doc.id, `${(doc.filename || 'document').replace(/\.pdf$/i, '')}_analysis_report.txt`);
        } catch (e) {
            console.error(e);
            alert('Download failed.');
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (createdAt: string | undefined) => {
        if (!createdAt) return '—';
        try {
            const d = new Date(createdAt);
            return d.toLocaleDateString();
        } catch {
            return '—';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold font-heading tracking-tight">My Documents</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption>A list of your analyzed legal documents. Download the analysis report for any document.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Document Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Risk Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No documents yet. <Link href="/dashboard/upload" className="text-primary underline">Upload your first document</Link> to analyze.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                results.map((doc: AnalysisResult) => {
                                    const status = doc.risk_score > 70 ? 'Critical' : doc.risk_score > 40 ? 'Review' : 'Safe';
                                    return (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                                <span className="truncate">{doc.filename}</span>
                                            </TableCell>
                                            <TableCell>{formatDate(doc.created_at)}</TableCell>
                                            <TableCell>
                                                <Badge variant={status === 'Critical' ? 'destructive' : status === 'Safe' ? 'success' : 'warning'}>
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${doc.risk_score > 70 ? 'bg-red-500' : doc.risk_score > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${doc.risk_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold">{doc.risk_score}/100</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/analysis/${doc.id}`}>
                                                        <Button variant="ghost" size="icon" title="View Analysis">
                                                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Download report"
                                                        onClick={() => handleDownload(doc)}
                                                        disabled={downloadingId === doc.id}
                                                    >
                                                        {downloadingId === doc.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
