import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-heading tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">Manage your account and preferences.</p>
                </div>
                <Button>Save Changes</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Profile Information</CardTitle>
                        <Button variant="ghost" size="sm">Edit</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <input type="text" className="w-full mt-1 px-3 py-2 bg-muted/50 border rounded-md text-sm" defaultValue="John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <input type="email" className="w-full mt-1 px-3 py-2 bg-muted/50 border rounded-md text-sm" defaultValue="john@example.com" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Email Alerts for Risks</span>
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Weekly Summary</span>
                            <div className="w-10 h-6 bg-muted/50 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-muted-foreground">Connected Integrations</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm text-muted-foreground bg-muted/20">
                            <div className="w-2 h-2 bg-green-500 rounded-full" /> Google Drive
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm text-muted-foreground bg-muted/20">
                            <div className="w-2 h-2 bg-gray-400 rounded-full" /> Dropbox (Connect)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
