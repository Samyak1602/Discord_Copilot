"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SignOutButton from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
    const supabase = createClient();
    const [instructions, setInstructions] = useState("");
    const [logs, setLogs] = useState<any[]>([]);
    const [allowedChannels, setAllowedChannels] = useState<string[]>([]);
    const [newChannel, setNewChannel] = useState("");
    const [configId, setConfigId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch Config
    useEffect(() => {
        fetchConfig();
        fetchLogs();

        // Subscribe to logs
        const channel = supabase
            .channel('realtime logs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_logs' }, (payload) => {
                setLogs((prev) => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchConfig() {
        const { data, error } = await supabase.from('bot_config').select('*').single();
        if (data) {
            setInstructions(data.system_instructions);
            setAllowedChannels(data.allowed_channels || []);
            setConfigId(data.id);
        }
    }

    async function fetchLogs() {
        const { data } = await supabase.from('chat_logs').select('*').order('timestamp', { ascending: false }).limit(50);
        if (data) setLogs(data);
    }

    async function saveInstructions() {
        setLoading(true);
        // Upsert equivalent
        if (configId) {
            await supabase.from('bot_config').update({ system_instructions: instructions }).eq('id', configId);
        } else {
            const { data } = await supabase.from('bot_config').insert([{ system_instructions: instructions }]).select().single();
            if (data) setConfigId(data.id);
        }
        setLoading(false);
    }

    async function addChannel() {
        if (!newChannel) return;
        const updated = [...allowedChannels, newChannel];
        setAllowedChannels(updated);
        setNewChannel("");
        if (configId) {
            await supabase.from('bot_config').update({ allowed_channels: updated }).eq('id', configId);
        }
    }

    async function removeChannel(channelId: string) {
        const updated = allowedChannels.filter(c => c !== channelId);
        setAllowedChannels(updated);
        if (configId) {
            await supabase.from('bot_config').update({ allowed_channels: updated }).eq('id', configId);
        }
    }

    async function clearLogs() {
        if (!confirm("Are you sure you want to wipe the bot's memory? This cannot be undone.")) return;

        setLoading(true);
        const { error } = await supabase.from('chat_logs').delete().neq('id', 0); // Delete all rows where id != 0 (all rows)

        if (error) {
            console.error('Error clearing logs:', error);
            alert('Failed to clear memory');
        } else {
            setLogs([]); // Clear local state
        }
        setLoading(false);
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Discord Copilot</h1>
                        <p className="text-muted-foreground">Manage your bot's brain and view its memories.</p>
                    </div>
                    <SignOutButton />
                </div>
            </div>

            <Tabs defaultValue="brain" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="brain">Brain</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                </TabsList>

                <TabsContent value="brain" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Instructions</CardTitle>
                            <CardDescription>
                                Define the persona and rules for the bot. This is the "System Prompt" passed to the LLM.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                className="min-h-[300px] font-mono"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="You are a helpful assistant..."
                            />
                            <Button onClick={saveInstructions} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Live Chat Logs</CardTitle>
                                    <CardDescription>
                                        Real-time stream of bot interactions.
                                    </CardDescription>
                                </div>
                                <Button variant="destructive" size="sm" onClick={clearLogs} disabled={loading || logs.length === 0}>
                                    Clear Memory
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-4 text-sm group hover:bg-muted/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-primary">{log.user_handle}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="border-l-2 border-primary/20 pl-2">{log.message_content}</p>
                                            <p className="bg-muted p-2 rounded-md font-mono text-xs">{log.bot_response}</p>
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <p className="text-muted-foreground text-center py-8">No logs yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Allowed Channels</CardTitle>
                            <CardDescription>
                                Control which Discord channels the bot listens to.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Channel ID"
                                    value={newChannel}
                                    onChange={(e) => setNewChannel(e.target.value)}
                                />
                                <Button onClick={addChannel}>Add</Button>
                            </div>

                            <div className="grid gap-2">
                                {allowedChannels.map((cid) => (
                                    <div key={cid} className="flex items-center justify-between border p-3 rounded-md bg-white dark:bg-black">
                                        <span className="font-mono">{cid}</span>
                                        <Button variant="ghost" size="sm" onClick={() => removeChannel(cid)} className="text-destructive hover:bg-destructive/10">
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                {allowedChannels.length === 0 && <p className="text-muted-foreground text-sm">No channels allowed. The bot will ignore all messages.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
