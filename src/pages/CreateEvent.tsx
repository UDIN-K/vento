import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    const dateTime = `${date}T${time}:00`;

    const data = {
      title: formData.get('title'),
      date: dateTime,
      location: formData.get('location'),
      capacity: parseInt(formData.get('capacity') as string),
      description: formData.get('description'),
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-sys-card shadow-sm border border-sys-border hover:bg-sys-border transition-colors">
          <ArrowLeft className="h-5 w-5 text-sys-text" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sys-text">Provision Event</h1>
          <p className="text-sys-dim mt-1">Initialize a new event structure inside the Vento ecosystem.</p>
        </div>
      </div>

      <Card className="shadow-sm border-sys-border bg-sys-card">
        <CardHeader>
          <CardTitle>Event Parameters</CardTitle>
          <CardDescription>Configure the properties for your new event instance.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-500 bg-red-400/10 border border-red-400/20 rounded-md animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sys-dim font-semibold uppercase tracking-wider text-xs">Instance Name <span className="text-red-500">*</span></Label>
              <Input id="title" name="title" required placeholder="e.g. Distributed Systems Seminar" className="bg-sys-bg border-sys-border shadow-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sys-dim font-semibold uppercase tracking-wider text-xs">Scheduled Date <span className="text-red-500">*</span></Label>
                <Input id="date" name="date" type="date" required className="[color-scheme:dark] bg-sys-bg border-sys-border shadow-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sys-dim font-semibold uppercase tracking-wider text-xs">Time Start <span className="text-red-500">*</span></Label>
                <Input id="time" name="time" type="time" required className="[color-scheme:dark] bg-sys-bg border-sys-border shadow-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sys-dim font-semibold uppercase tracking-wider text-xs">Mount Point (Location) <span className="text-red-500">*</span></Label>
                <Input id="location" name="location" required placeholder="e.g. Server Room A / Webinar URL" className="bg-sys-bg border-sys-border shadow-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-sys-dim font-semibold uppercase tracking-wider text-xs">Hardware Limits (Persons) <span className="text-red-500">*</span></Label>
                <Input id="capacity" name="capacity" type="number" min="1" required placeholder="e.g. 100" className="bg-sys-bg border-sys-border shadow-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sys-dim font-semibold uppercase tracking-wider text-xs">Instance Metadata</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Give details about what the event covers, speakers, etc." 
                rows={5}
                className="bg-sys-bg border-sys-border shadow-none"
              />
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-sys-border">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-full shadow-sm text-sys-text bg-sys-card hover:bg-sys-border border-sys-border">Abort</Button>
              <Button type="submit" disabled={loading} className="rounded-full px-6 shadow-sm">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {loading ? 'Committing...' : 'Commit Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
