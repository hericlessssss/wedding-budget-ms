import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, X, Calendar, Clock, FileText, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database.types';

function Schedule() {
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
        return '#10B981'; // green-500
      case 'cancelled':
        return '#EF4444'; // red-500
      default:
        return '#8B5CF6'; // violet-500
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
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 1000 }}>
          <div className="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedEvent ? 'Editar Evento' : 'Adicionar Evento'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedEvent(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveEvent}>
                <div className="px-4 sm:px-6 py-4 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                        Data de Início
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="datetime-local"
                          id="start-date"
                          value={format(parseISO(newEvent.start_date || new Date().toISOString()), "yyyy-MM-dd'T'HH:mm")}
                          onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                          required
                        />
                        <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                        Data de Término
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="datetime-local"
                          id="end-date"
                          value={format(parseISO(newEvent.end_date || newEvent.start_date || new Date().toISOString()), "yyyy-MM-dd'T'HH:mm")}
                          onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                        />
                        <Clock className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      value={newEvent.status}
                      onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as 'pending' | 'completed' | 'cancelled' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="completed">Concluído</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-lg flex flex-col-reverse sm:flex-row sm:justify-between">
                  {selectedEvent ? (
                    <>
                      <button
                        type="button"
                        onClick={handleDeleteEvent}
                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Excluir
                      </button>
                      <div className="flex flex-col-reverse sm:flex-row sm:space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(false);
                            setSelectedEvent(null);
                          }}
                          className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Adicionar Evento
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fc-theme-custom {
          font-size: 14px;
        }
        
        @media (max-width: 640px) {
          .fc-theme-custom {
            font-size: 12px;
          }
          
          .fc-theme-custom .fc-toolbar {
            flex-direction: column;
            gap: 1rem;
          }
          
          .fc-theme-custom .fc-toolbar-title {
            font-size: 1.25rem;
          }
          
          .fc-theme-custom .fc-button {
            padding: 0.375rem 0.75rem;
          }
          
          .fc-theme-custom .fc-event {
            padding: 1px 2px;
          }
        }
        
        .fc-theme-custom .fc-button-primary {
          background-color: #fff;
          border-color: #e5e7eb;
          color: #374151;
        }
        .fc-theme-custom .fc-button-primary:hover {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }
        .fc-theme-custom .fc-button-primary:disabled {
          background-color: #fff;
          border-color: #e5e7eb;
        }
        .fc-theme-custom .fc-button-primary:not(:disabled).fc-button-active,
        .fc-theme-custom .fc-button-primary:not(:disabled):active {
          background-color: #f3f4f6;
          border-color: #d1d5db;
          color: #374151;
        }
        .fc-theme-custom .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        .fc-theme-custom .fc-event {
          border-radius: 0.375rem;
          padding: 2px 4px;
        }
        .fc-theme-custom .fc-day-today {
          background-color: #fdf2f8 !important;
        }
        .fc-theme-custom .fc-col-header-cell {
          background-color: #f9fafb;
          padding: 8px;
        }
        .fc-theme-custom .fc-scrollgrid {
          border-radius: 0.5rem;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default Schedule;