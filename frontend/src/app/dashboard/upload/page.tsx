'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, ShieldCheck, FileText, Loader2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { uploadDocument } from '@/lib/api';

export default function UploadPage() {
    // We now support multiple files
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const folderInputRef = useRef<HTMLInputElement>(null);

    // Mutation handles single file upload, we'll loop it
    const { mutateAsync } = useMutation({
        mutationFn: uploadDocument,
        onError: (error) => {
            console.error("Upload failed", error);
        }
    });

    const triggerFolderUpload = () => {
        if (folderInputRef.current) {
            folderInputRef.current.click();
        }
    };

    const handleBatchUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        let lastId = "";

        try {
            // Sequential upload to avoid overwhelming backend/network
            for (const file of files) {
                console.log("Uploading file:", file.name);
                const res = await mutateAsync(file);
                lastId = res.id;
            }
            // Navigate to the analysis of the last file (or a summary page if we had one)
            // For now, let's go to the last analysis result
            if (lastId) {
                router.push(`/dashboard/analysis/${lastId}`);
            } else {
                setUploading(false); // In case of empty response?
                alert("Upload completed but no analysis ID returned.");
            }
        } catch (e: any) {
            console.error("Batch upload error:", e);
            let errorMessage = "Some files failed to upload. Check console for details.";

            if (e.code === 'ECONNABORTED') {
                errorMessage = "Upload timed out. The analysis is taking longer than expected (over 10 minutes). Please try smaller files.";
            } else if (e.message === "Network Error") {
                errorMessage = "Network error. Please check if the backend server is running.";
            } else if (e.response?.data?.detail) {
                errorMessage = `Server Error: ${e.response.data.detail}`;
            }

            alert(errorMessage);
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            console.log("Files dropped:", e.dataTransfer.files);
            // Convert FileList to Array and filter
            const droppedFiles = Array.from(e.dataTransfer.files);
            const newFiles = droppedFiles.filter(f =>
                f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
            );

            if (newFiles.length === 0) {
                alert("Only PDF files are supported.");
                return;
            }
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            console.log("Files selected:", e.target.files);
            const selectedFiles = Array.from(e.target.files);
            const newFiles = selectedFiles.filter(f =>
                f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
            );

            if (newFiles.length === 0) {
                alert("No PDF files found in selection.");
            } else {
                console.log("Added files:", newFiles.map(f => f.name));
                setFiles(prev => [...prev, ...newFiles]);
            }
            // clear value so same files can be selected again if needed
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold font-heading">Upload Legal Documents</h1>
                <p className="text-muted-foreground">Upload individual PDFs or select entire folders for bulk analysis.</p>
            </div>

            <Card className="w-full max-w-2xl border-dashed border-2 bg-muted/5 hover:bg-muted/10 transition-colors">
                <CardContent className="flex flex-col items-center justify-center p-12 space-y-6">
                    {files.length === 0 ? (
                        <>
                            <div
                                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <Upload className="h-10 w-10 text-primary" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-medium">Drag & drop your PDFs here</p>
                                <p className="text-sm text-muted-foreground">or choose an option below</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileSelect}
                                    />
                                    <Button variant="outline" className="gap-2">
                                        <FileText className="h-4 w-4" />
                                        Select Files
                                    </Button>
                                </div>

                                <div>
                                    {/* The hidden folder input */}
                                    <input
                                        type="file"
                                        ref={folderInputRef}
                                        className="hidden"
                                        // @ts-expect-error webkitdirectory is non-standard
                                        webkitdirectory=""
                                        directory=""
                                        multiple
                                        onChange={handleFileSelect}
                                    />
                                    <Button variant="outline" className="gap-2" onClick={triggerFolderUpload}>
                                        <FolderOpen className="h-4 w-4" />
                                        Select Folder
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{files.length} Document{files.length > 1 ? 's' : ''} Selected</h3>
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={uploading} className="text-muted-foreground">Clear All</Button>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2 bg-background/50">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded text-red-600 shrink-0">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm truncate">{f.name}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeFile(i)}
                                            disabled={uploading}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <Button
                                    className="w-full shadow-lg shadow-primary/20"
                                    size="lg"
                                    onClick={handleBatchUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing {files.length} Files...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Run Analysis on {files.length} Files
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Batch processing may take some time depending on document complexity.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
