'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, AlertCircle, FileText } from "lucide-react";

export default function RiskAnalysisPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold font-heading tracking-tight">Risk Analysis Dashboard</h2>
                <p className="text-muted-foreground">Aggregated risk insights across your legal portfolio.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>High Priority Risks</CardTitle>
                        <CardDescription>Documents requiring immediate attention.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { title: "Missing Indemnification", doc: "NDA_Vendor_V2.pdf", severity: "Critical" },
                            { title: "Uncapped Liability", doc: "Service_Agreement_Q3.docx", severity: "High" },
                            { title: "Auto-Renewal Clause", doc: "Lease_Agreement_2025.pdf", severity: "Critical" },
                            { title: "Wait Period Exceeded", doc: "Employee_Offer.pdf", severity: "High" },
                        ].map((risk, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    <div>
                                        <div className="font-semibold text-sm">{risk.title}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {risk.doc}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="destructive">{risk.severity}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-muted/10 border-dashed">
                    <CardHeader>
                        <CardTitle>Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="relative w-40 h-40 rounded-full border-8 border-muted flex items-center justify-center">
                            <div className="absolute inset-0 border-8 border-red-500 rounded-full border-l-transparent border-b-transparent rotate-45" />
                            <div className="text-center">
                                <div className="text-2xl font-bold">12%</div>
                                <div className="text-xs text-muted-foreground">Critical</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Critical</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full" /> High</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full" /> Medium</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> Safe</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
