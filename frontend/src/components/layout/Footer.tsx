import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-muted/20">
            <div className="container py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center">
                            <Image src="/logo.png" alt="Clause Sense Logo" width={150} height={44} className="object-contain h-10 w-auto" />
                        </Link>
                        <p className="text-sm text-muted-foreground w-64">
                            Enterprise-grade legal document analysis and compliance checking, powered by advanced AI agents.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground">Product</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="#" className="hover:text-foreground">Features</Link>
                            <Link href="#" className="hover:text-foreground">Pricing</Link>
                            <Link href="#" className="hover:text-foreground">Security</Link>
                            <Link href="#" className="hover:text-foreground">Enterprise</Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground">Resources</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="#" className="hover:text-foreground">Documentation</Link>
                            <Link href="#" className="hover:text-foreground">API Reference</Link>
                            <Link href="#" className="hover:text-foreground">Case Studies</Link>
                            <Link href="#" className="hover:text-foreground">Blog</Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground">Company</h4>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="#" className="hover:text-foreground">About Us</Link>
                            <Link href="#" className="hover:text-foreground">Careers</Link>
                            <Link href="#" className="hover:text-foreground">Legal</Link>
                            <Link href="#" className="hover:text-foreground">Contact</Link>
                        </div>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2026 Clause Sense. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
