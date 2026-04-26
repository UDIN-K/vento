import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, Trash2, CheckCircle2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  capacity: number;
}

interface Registration {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`).then(res => res.json()),
      fetch(`/api/events/${id}/registrations`).then(res => res.json())
    ])
    .then(([eventData, regData]) => {
      setEvent(eventData);
      setRegistrations(regData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    setRegSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
    };

    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      setRegSuccess(true);
      (e.target as HTMLFormElement).reset();
      
      // Refresh registrations
      const regRes = await fetch(`/api/events/${id}/registrations`);
      const regData = await regRes.json();
      setRegistrations(regData);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to destruct this event cluster? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete event cluster');
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sys-dim animate-pulse">Synchronizing event state...</div>;
  }

  if (!event || (event as any).error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-in fade-in zoom-in-95">
        <h2 className="text-2xl font-bold text-sys-text">Event Not Found</h2>
        <p className="text-sys-dim mt-2">The event container you're looking for doesn't exist or has been terminated.</p>
        <Button onClick={() => navigate('/')} className="mt-6 rounded-full px-6">Return to Core</Button>
      </div>
    );
  }

  const spotsLeft = event.capacity - registrations.length;
  const isFull = spotsLeft <= 0;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-sys-card shadow-sm border border-sys-border hover:bg-sys-border">
            <ArrowLeft className="h-5 w-5 text-sys-text" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-sys-text hidden sm:block">Event Matrix</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} className="rounded-full shadow-sm px-4">
          <Trash2 className="mr-2 h-4 w-4" /> Terminate Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden bg-sys-card border-sys-border shadow-sm">
            <div className="h-32 bg-gradient-to-r from-sys-accent to-sys-bg border-b border-sys-border opacity-80" />
            <div className="p-6 sm:p-8 -mt-10 bg-sys-card rounded-t-xl relative z-10 mx-4 border border-sys-border shadow-lg">
              <h1 className="text-3xl font-extrabold text-sys-text mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sys-text mb-6">
                <div className="flex items-center gap-3 bg-sys-bg p-3 rounded-lg border border-sys-border">
                  <div className="bg-sys-card shadow-sm p-2 rounded-md text-sys-accent border border-sys-border/50">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-sys-dim font-bold uppercase tracking-wider">Date & Time</p>
                    <p className="font-medium text-sys-text mt-0.5">{format(new Date(event.date), 'MMM d, yyyy \u2022 h:mm a')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-sys-bg p-3 rounded-lg border border-sys-border">
                  <div className="bg-sys-card shadow-sm p-2 rounded-md text-sys-accent border border-sys-border/50">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-sys-dim font-bold uppercase tracking-wider">Mount Point</p>
                    <p className="font-medium text-sys-text mt-0.5 line-clamp-1">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-sys-bg p-3 rounded-lg border border-sys-border sm:col-span-2">
                  <div className="bg-sys-card shadow-sm p-2 rounded-md text-sys-accent border border-sys-border/50">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-sys-dim font-bold uppercase tracking-wider">Cluster Capacity</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="font-medium text-sys-text">{registrations.length} registered / {event.capacity} nodes</p>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-sys-card shadow-sm border border-sys-border ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isFull ? 'CAPACITY REACHED' : `${spotsLeft} SEATS LEFT`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-sys-border">
                <h3 className="text-sm font-bold tracking-wider uppercase text-sys-dim mb-4">Event Metadata</h3>
                <div className="prose prose-slate max-w-none text-sys-text whitespace-pre-wrap leading-relaxed text-sm">
                  {event.description || 'No description provided for this instance.'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border-sys-border bg-sys-card">
            <CardHeader className="border-b border-sys-border bg-sys-bg/50">
              <CardTitle>Connected Nodes</CardTitle>
              <CardDescription>Members currently registered in this event cluster.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {registrations.length === 0 ? (
                <div className="text-center py-12 text-sys-dim">
                  No incoming connections yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-sys-dim uppercase bg-sys-bg border-b border-sys-border tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-4">Identifier</th>
                        <th className="px-6 py-4">Network Contact</th>
                        <th className="px-6 py-4 text-right">Join Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sys-border">
                      {registrations.map((reg, idx) => (
                        <tr key={reg.id} className="bg-sys-card hover:bg-sys-bg/50 transition-colors animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                          <td className="px-6 py-4 font-medium text-sys-text">{reg.name}</td>
                          <td className="px-6 py-4 text-sys-dim font-mono text-[13px]">{reg.email}</td>
                          <td className="px-6 py-4 text-right text-sys-dim font-mono text-[13px]">
                            {format(new Date(reg.created_at), 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Registration Form */}
        <div className="h-full">
          <Card className="sticky top-24 border-sys-accent shadow-md bg-sys-card">
            <CardHeader className="bg-sys-bg rounded-t-lg border-b border-sys-border">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-sys-accent" /> 
                Acquire Access
              </CardTitle>
              <CardDescription>Allocate your spot in this cluster.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isFull ? (
                <div className="p-4 text-center bg-red-400/10 text-red-500 rounded-lg border border-red-400/20 font-medium">
                  Allocation denied: Cluster capacity is full.
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  {regSuccess && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg flex items-start gap-2 text-sm animate-in fade-in zoom-in-95">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>Allocation successful! Spot confirmed.</p>
                    </div>
                  )}
                  {regError && (
                    <div className="p-3 bg-red-400/10 text-red-500 border border-red-400/20 rounded-lg text-sm animate-in fade-in zoom-in-95">
                      {regError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-sys-dim">System Identifier (Name)</Label>
                    <Input id="name" name="name" required placeholder="User_404" className="bg-sys-bg border-sys-border shadow-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-sys-dim">Return Channel (Email)</Label>
                    <Input id="email" name="email" type="email" required placeholder="user@domain.tld" className="bg-sys-bg border-sys-border shadow-none h-11 font-mono text-[13px]" />
                  </div>
                  <Button type="submit" className="w-full h-11 shadow-sm font-semibold rounded-lg" disabled={regLoading}>
                    {regLoading ? 'Processing allocation...' : 'Initialize Allocation'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
