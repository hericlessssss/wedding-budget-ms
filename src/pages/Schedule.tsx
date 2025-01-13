import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, X, Calendar, Clock, FileText, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import type { Event } from '../types/database.types';

function Schedule() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return;
    }

    setEvents(data || []);
  }

  async function handleDateSelect(selectInfo: any) {
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      status: 'pending',
      start_date: selectInfo.startStr,
      end_date: selectInfo.endStr,
    });
    setShowModal(true);
  }

  async function handleEventClick(clickInfo: any) {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setNewEvent(event);
      setShowModal(true);
    }
  }

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    
    if (selectedEvent) {
      const { error } = await supabase
        .from('events')
        .update({
          ...newEvent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedEvent.id);

      if (error) {
        console.error('Erro ao atualizar evento:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) {
        console.error('Erro ao adicionar evento:', error);
        return;
      }
    }

    setShowModal(false);
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      status: 'pending',
    });
    fetchEvents();
  }

  async function handleDeleteEvent() {
    if (!selectedEvent) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', selectedEvent.id);

    if (error) {
      console.error('Erro ao excluir evento:', error);
      return;
    }

    setShowModal(false);
    setSelectedEvent(null);
    fetchEvents();
  }

  function getEventColor(status: string) {
    switch (status) {
      case 'completed':
        return '#10B981'; // verde para concluído
      case 'cancelled':
        return '#EF4444'; // vermelho para cancelado
      default:
        return colors.primary; // cor primária do tema para pendente
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-2 sm:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              locale={ptBR}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={true}
              events={events.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start_date,
                end: event.end_date,
                backgroundColor: getEventColor(event.status),
                borderColor: getEventColor(event.status),
              }))}
              select={handleDateSelect}
              eventClick={handleEventClick}
              height="auto"
              className="fc-theme-custom"
            />
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      {/* ... resto do código do modal permanece igual ... */}

      <style>{`
        .fc-theme-custom {
          font-size: 14px;
        }
        
        .fc-theme-custom .fc-button-primary {
          background-color: #fff;
          border-color: #e5e7eb;
          color: #374151;
        }
        
        .fc-theme-custom .fc-button-primary:hover {
          background-color: ${colors.accent};
          border-color: ${colors.primary};
          color: ${colors.primary};
        }
        
        .fc-theme-custom .fc-button-primary:not(:disabled).fc-button-active,
        .fc-theme-custom .fc-button-primary:not(:disabled):active {
          background-color: ${colors.primary};
          border-color: ${colors.primary};
          color: white;
        }
        
        .fc-theme-custom .fc-day-today {
          background-color: ${colors.accent} !important;
        }
        
        .fc-theme-custom .fc-event {
          border-radius: 0.375rem;
          padding: 2px 4px;
        }
        
        .fc-theme-custom .fc-event-main {
          font-size: 0.875rem;
        }
        
        .fc-theme-custom .fc-toolbar-title {
          color: ${colors.primary};
        }

        .fc-theme-custom .fc-highlight {
          background-color: ${colors.accent} !important;
        }

        .fc-theme-custom .fc-col-header-cell {
          background-color: ${colors.secondary};
          color: white;
        }

        .fc-theme-custom .fc-daygrid-day-number,
        .fc-theme-custom .fc-timegrid-slot-label {
          color: #374151;
        }

        .fc-theme-custom .fc-event:hover {
          filter: brightness(0.9);
        }
      `}</style>
    </div>
  );
}

export default Schedule;