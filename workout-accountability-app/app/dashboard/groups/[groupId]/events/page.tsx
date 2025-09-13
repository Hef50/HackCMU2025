'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import GroupGainzLogo from '@/components/ui/GroupGainzLogo';
import { createEvent, rsvpToEvent } from '../actions';
import type { Database, GroupEvent, EventRSVP, User } from '@/lib/types';

interface EventsPageProps {
  params: { groupId: string };
}

interface EventWithRSVPs extends GroupEvent {
  created_by_user: User;
  rsvps: (EventRSVP & { user: User })[];
}

export default function EventsPage({ params }: EventsPageProps) {
  const [events, setEvents] = useState<EventWithRSVPs[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchEvents();
  }, [params.groupId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('group_events')
        .select(`
          *,
          created_by_user:users(id, name, email, profile_image_url),
          rsvps:event_rsvps(
            id,
            user_id,
            status,
            created_at,
            updated_at,
            user:users(id, name, email, profile_image_url)
          )
        `)
        .eq('group_id', params.groupId)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
        return;
      }

      setEvents(data || []);
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (formData: FormData) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createEvent(formData, params.groupId);

      if (result.success) {
        setSuccess('Event created successfully!');
        setShowCreateModal(false);
        fetchEvents(); // Refresh the events list
      } else {
        setError(result.error || 'Failed to create event');
      }
    });
  };

  const handleRSVP = async (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    setError(null);

    startTransition(async () => {
      const result = await rsvpToEvent(eventId, status);

      if (result.success) {
        fetchEvents(); // Refresh to show updated RSVP counts
      } else {
        setError(result.error || 'Failed to update RSVP');
      }
    });
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Tomorrow';
    } else if (diffInDays < 7) {
      return `In ${diffInDays} days`;
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRSVPCounts = (event: EventWithRSVPs) => {
    const going = event.rsvps?.filter(rsvp => rsvp.status === 'going').length || 0;
    const maybe = event.rsvps?.filter(rsvp => rsvp.status === 'maybe').length || 0;
    const notGoing = event.rsvps?.filter(rsvp => rsvp.status === 'not_going').length || 0;
    return { going, maybe, notGoing };
  };

  const getUserRSVP = (event: EventWithRSVPs, userId: string) => {
    return event.rsvps?.find(rsvp => rsvp.user_id === userId)?.status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="glass rounded-3xl p-8 border border-slate-600/50 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="gradient-surface border-b border-slate-600/50">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <a 
              href={`/dashboard/groups/${params.groupId}`} 
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <GroupGainzLogo size={40} showText={false} />
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
              disabled={pending}
            >
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text mb-2">Group Events</h1>
            <p className="text-slate-300 text-sm">Schedule and join group activities</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="glass rounded-2xl p-4 border border-red-500/20 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="glass rounded-2xl p-4 border border-green-500/20 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div className="glass rounded-3xl p-8 border border-slate-600/50 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Events</h3>
            <p className="text-slate-400 text-sm mb-6">
              Be the first to schedule an event for your group!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              disabled={pending}
            >
              Schedule Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const rsvpCounts = getRSVPCounts(event);
              const userRSVP = getUserRSVP(event, 'current-user-id'); // This would come from auth context
              
              return (
                <div key={event.id} className="glass rounded-2xl p-6 border border-slate-600/50">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatEventDate(event.event_date)} at {formatEventTime(event.event_date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Event Description */}
                  {event.description && (
                    <p className="text-slate-300 text-sm mb-4">{event.description}</p>
                  )}

                  {/* RSVP Counts */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-green-400">
                        <span>✓</span>
                        <span>{rsvpCounts.going}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <span>?</span>
                        <span>{rsvpCounts.maybe}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-red-400">
                        <span>✗</span>
                        <span>{rsvpCounts.notGoing}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      by {event.created_by_user?.name}
                    </div>
                  </div>

                  {/* RSVP Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRSVP(event.id, 'going')}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        userRSVP === 'going'
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-green-500/20'
                      }`}
                      disabled={pending}
                    >
                      Going
                    </button>
                    <button
                      onClick={() => handleRSVP(event.id, 'maybe')}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        userRSVP === 'maybe'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-yellow-500/20'
                      }`}
                      disabled={pending}
                    >
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRSVP(event.id, 'not_going')}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        userRSVP === 'not_going'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-red-500/20'
                      }`}
                      disabled={pending}
                    >
                      Can't Go
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateModal && (
          <CreateEventModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateEvent}
            pending={pending}
          />
        )}
      </div>
    </div>
  );
}

// Create Event Modal Component
interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
}

function CreateEventModal({ onClose, onSubmit, pending }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_attendees: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    
    // Combine date and time
    const eventDateTime = new Date(`${formData.event_date}T${formData.event_time}`).toISOString();
    form.append('event_date', eventDateTime);
    
    form.append('location', formData.location);
    form.append('max_attendees', formData.max_attendees);

    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-3xl p-6 border border-slate-600/50 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Schedule Event</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Weekend Hike"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell members what to expect..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
              <input
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location (Optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Central Park"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Attendees (Optional)</label>
            <input
              type="number"
              value={formData.max_attendees}
              onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty for unlimited"
              min="1"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-700/50 text-slate-300 rounded-xl font-medium hover:bg-slate-600/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 gradient-primary text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {pending ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
