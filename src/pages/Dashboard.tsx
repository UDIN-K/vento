import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, MapPin, Users, Server, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  capacity: number;
  created_at: string;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sys-text flex items-center gap-2">
            Event Orchestra
          </h1>
          <p className="text-sys-dim mt-1">Managing global event operations via Vento infrastructure.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden sm:flex gap-4">
            <div className="bg-sys-card border border-sys-border py-1 px-3 rounded-full font-mono text-[11px] text-sys-dim flex items-center gap-2 shadow-sm">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-sys-text font-bold">VENTO</span> Core 1.0.0
            </div>
            <div className="bg-sys-card border border-sys-border py-1 px-3 rounded-full font-mono text-[11px] text-sys-dim flex items-center gap-2 shadow-sm">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               Optimized
            </div>
          </div>
          <Button asChild className="rounded-full px-6 shadow-sm hover:shadow-md transition-shadow">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-sys-card border-sys-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-sys-dim uppercase tracking-wider">Total Events</p>
              <div className="w-8 h-8 rounded-full bg-sys-bg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-sys-text" />
              </div>
            </div>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-sys-dim mt-1">Active nodes in cluster</p>
          </CardContent>
        </Card>
        <Card className="bg-sys-card border-sys-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-sys-dim uppercase tracking-wider">System Load</p>
              <div className="w-8 h-8 rounded-full bg-sys-bg flex items-center justify-center">
                <Server className="h-4 w-4 text-sys-text" />
              </div>
            </div>
            <div className="text-2xl font-bold">0.42</div>
            <p className="text-xs text-sys-dim mt-1">Healthy processing state</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse shadow-sm">
              <CardHeader className="h-32 bg-sys-bg rounded-t-lg" />
              <CardContent className="h-24 bg-sys-card" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-sys-border rounded-xl bg-sys-card/50 shadow-sm animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-full bg-sys-bg flex items-center justify-center mb-4">
            <Wind className="h-8 w-8 text-sys-dim" />
          </div>
          <h3 className="text-xl font-semibold text-sys-text">No active instances</h3>
          <p className="text-sys-dim mt-2 max-w-sm mb-6">You haven't initialized any events yet. Get started by provisioning a new event container.</p>
          <Button asChild className="rounded-full px-6 shadow-sm">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" /> Provision Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => (
            <Card 
              key={event.id} 
              className="flex flex-col h-full bg-sys-card hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationFillMode: 'both', animationDelay: \`\${idx * 100}ms\` }}
            >
              <CardHeader className="p-0">
                <div className="h-2 w-full bg-gradient-to-r from-sys-border to-sys-border border-b border-sys-border opacity-50"></div>
                <div className="p-6 pb-2">
                  <CardTitle className="text-xl line-clamp-1 flex items-start justify-between gap-4">
                    <span>{event.title}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-3 text-sys-text font-medium bg-sys-bg border border-sys-border w-fit px-3 py-1.5 rounded-md text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(event.date), 'MMMM d, yyyy \u2022 h:mm a')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-4 px-6 shrink-0">
                <div className="flex items-center gap-3 text-sm text-sys-dim">
                  <MapPin className="h-4 w-4 text-sys-dim shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-sys-dim">
                  <Users className="h-4 w-4 text-sys-dim shrink-0" />
                  <span>Capacity: {event.capacity} persons</span>
                </div>
                {event.description && (
                  <p className="text-sm text-sys-dim line-clamp-2 mt-4 pt-4 border-t border-sys-border/50">
                    {event.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-4 pb-6 px-6 mt-auto">
                <Button asChild variant="outline" className="w-full bg-sys-bg hover:bg-sys-border text-sys-text shadow-sm rounded-lg transition-colors">
                  <Link to={`/events/${event.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
