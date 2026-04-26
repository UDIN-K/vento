import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, MapPin, Users, Trash2, CheckCircle2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';

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

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
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
    return <div className="p-8 text-center text-sys-dim">Synchronizing event state...</div>;
  }

  if (!event || event.error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-sys-text">Event Not Found</h2>
        <p className="text-sys-dim mt-2">The event container you're looking for doesn't exist or has been terminated.</p>
        <Button onClick={() => navigate('/')} className="mt-6">Return to Core</Button>
      </div>
    );
  }

  const spotsLeft = event.capacity - registrations.length;
  const isFull = spotsLeft <= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-sys-card shadow-sm border border-sys-border hover:bg-sys-border">
            <ArrowLeft className="h-5 w-5 text-sys-text" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-sys-text hidden sm:block">Event Matrix</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Terminate Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden bg-sys-card border-sys-border">
            <div className="h-32 bg-gradient-to-r from-sys-accent to-sys-bg border-b border-sys-border" />
            <div className="p-6 sm:p-8 -mt-10 bg-sys-card rounded-t-xl relative z-10 mx-4 border border-sys-border shadow-sm">
              <h1 className="text-3xl font-extrabold text-sys-text mb-4">{event.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sys-text mb-6">
                <div className="flex items-center gap-3 bg-sys-bg p-3 rounded-lg border border-sys-border">
                  <div className="bg-sys-accent-dim p-2 rounded-md text-sys-accent">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-sys-dim font-medium uppercase">Date & Time</p>
                    <p className="font-medium text-sys-text">{format(new Date(event.date), 'MMM d, yyyy \u2022 h:mm a')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-sys-bg p-3 rounded-lg border border-sys-border">
                  <div className="bg-sys-accent-dim p-2 rounded-md text-sys-accent">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-sys-dim font-medium uppercase">Mount Point</p>
                    <p className="font-medium text-sys-text line-clamp-1">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-sys-bg p-3 rounded-lg border border-sys-border sm:col-span-2">
                  <div className="bg-sys-accent-dim p-2 rounded-md text-sys-accent">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-sys-dim font-medium uppercase">Cluster Capacity</p>
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sys-text">{registrations.length} registered / {event.capacity} nodes</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${isFull ? 'bg-red-400/10 text-red-500' : 'bg-green-400/10 text-green-500'}`}>
                        {isFull ? 'CAPACITY REACHED' : `${spotsLeft} SEATS LEFT`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-sys-text mb-2">Event Metadata</h3>
                <div className="prose prose-slate max-w-none text-sys-dim whitespace-pre-wrap leading-relaxed">
                  {event.description || 'No description provided for this instance.'}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Nodes</CardTitle>
              <CardDescription>Members currently registered in this event cluster.</CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <div className="text-center py-6 text-sys-dim bg-sys-bg rounded-lg border border-sys-border">
                  No incoming connections yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-sys-dim uppercase bg-sys-bg border-b border-sys-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Identifier</th>
                        <th className="px-4 py-3 font-medium">Network Contact</th>
                        <th className="px-4 py-3 font-medium text-right">Join Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map(reg => (
                        <tr key={reg.id} className="border-b border-sys-border hover:bg-sys-bg transition-colors">
                          <td className="px-4 py-3 font-medium text-sys-text">{reg.name}</td>
                          <td className="px-4 py-3 text-sys-dim">{reg.email}</td>
                          <td className="px-4 py-3 text-right text-sys-dim">
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
          <Card className="sticky top-24 border-sys-accent shadow-md">
            <CardHeader className="bg-sys-accent-dim rounded-t-lg border-b border-sys-accent-dim">
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
                <form onSubmit={handleRegister} className="space-y-4">
                  {regSuccess && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-green-400/10 text-green-500 border border-green-400/20 rounded-md flex items-start gap-2 text-sm overflow-hidden">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>Allocation successful! Spot confirmed.</p>
                    </motion.div>
                  )}
                  {regError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-red-400/10 text-red-500 border border-red-400/20 rounded-md text-sm overflow-hidden">
                      {regError}
                    </motion.div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">System Identifier (Name)</Label>
                    <Input id="name" name="name" required placeholder="User_404" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Return Channel (Email)</Label>
                    <Input id="email" name="email" type="email" required placeholder="user@domain.tld" />
                  </div>
                  <Button type="submit" className="w-full" disabled={regLoading}>
                    {regLoading ? 'Processing allocation...' : 'Initialize Allocation'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
