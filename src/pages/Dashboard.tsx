import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Users,
  Image,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  CheckSquare,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Event, BudgetCategory, Supplier, Task } from '../types/database.types';

function Dashboard() {
  const [budgetSummary, setBudgetSummary] = useState({
    total: 0,
    spent: 0,
    remaining: 0
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: 'event' | 'supplier';
    title: string;
    date: string;
  }>>([]);

  useEffect(() => {
    fetchBudgetSummary();
    fetchSuppliers();
    fetchUpcomingEvents();
    fetchRecentTasks();
    fetchRecentActivities();
  }, []);

  async function fetchBudgetSummary() {
    const { data: categories, error } = await supabase
      .from('budget_categories')
      .select('agreed_amount, spent_amount');

    if (error) {
      console.error('Erro ao buscar orçamento:', error);
      return;
    }

    const total = categories?.reduce((sum, cat) => sum + (cat.agreed_amount || 0), 0) || 0;
    const spent = categories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0;

    setBudgetSummary({
      total,
      spent,
      remaining: total - spent
    });
  }

  async function fetchSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return;
    }

    setSuppliers(data || []);
  }

  async function fetchUpcomingEvents() {
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Erro ao buscar eventos:', error);
      return;
    }

    setUpcomingEvents(data || []);
  }

  async function fetchRecentTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_lists (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Erro ao buscar tarefas:', error);
      return;
    }

    setRecentTasks(data || []);
  }

  async function fetchRecentActivities() {
    const [eventsResponse, suppliersResponse] = await Promise.all([
      supabase
        .from('events')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('suppliers')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const activities = [
      ...(eventsResponse.data || []).map(event => ({
        id: event.id,
        type: 'event' as const,
        title: event.title,
        date: event.created_at
      })),
      ...(suppliersResponse.data || []).map(supplier => ({
        id: supplier.id,
        type: 'supplier' as const,
        title: supplier.name,
        date: supplier.created_at
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 5);

    setRecentActivities(activities);
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  }

  function getPriorityLabel(priority: string) {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      default:
        return 'Baixa';
    }
  }

  return (
    <div className="space-y-6">
      {/* Visão Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orçamento Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                R$ {budgetSummary.total.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Gasto: R$ {budgetSummary.spent.toLocaleString('pt-BR')}</span>
              <span className="text-gray-500">Restante: R$ {budgetSummary.remaining.toLocaleString('pt-BR')}</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${(budgetSummary.spent / budgetSummary.total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Link
          to="/suppliers"
          className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fornecedores</p>
              <p className="text-2xl font-semibold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-600">
            <span className="text-sm font-medium">Ver todos os fornecedores</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </div>
        </Link>

        <Link
          to="/schedule"
          className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
              <p className="text-2xl font-semibold text-gray-900">{upcomingEvents.length}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-full">
              <Calendar className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-rose-600">
            <span className="text-sm font-medium">Ver calendário</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </div>
        </Link>

        <Link
          to="/tasks"
          className="bg-white rounded-lg shadow p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tarefas</p>
              <p className="text-2xl font-semibold text-gray-900">{recentTasks.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-purple-600">
            <span className="text-sm font-medium">Ver quadro de tarefas</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </div>
        </Link>
      </div>

      {/* Linha do Tempo e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Eventos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Próximos Eventos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {format(new Date(event.start_date), "PPP", { locale: ptBR })}
                    </p>
                    {event.description && (
                      <p className="mt-2 text-sm text-gray-500">{event.description}</p>
                    )}
                  </div>
                  <div className="ml-auto">
                    {event.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : event.status === 'cancelled' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                Nenhum evento próximo
              </div>
            )}
          </div>
        </div>

        {/* Tarefas Recentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Tarefas Recentes</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {(task.task_lists as any)?.name}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-sm text-gray-500">{task.description}</p>
                    )}
                  </div>
                  {task.due_date && (
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-sm text-gray-500">
                        {format(new Date(task.due_date), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {recentTasks.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                Nenhuma tarefa recente
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Atividade Recente</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {activity.type === 'event' ? (
                      <Calendar className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Users className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {activity.type === 'event' ? 'Novo evento:' : 'Novo fornecedor:'} {activity.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {format(new Date(activity.date), "PPp", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                Nenhuma atividade recente
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Ações Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <Link
            to="/budget"
            className="p-6 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Atualizar Orçamento</p>
                <p className="mt-1 text-sm text-gray-500">Controle seus gastos</p>
              </div>
            </div>
          </Link>

          <Link
            to="/suppliers"
            className="p-6 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Adicionar Fornecedor</p>
                <p className="mt-1 text-sm text-gray-500">Gerenciar fornecedores</p>
              </div>
            </div>
          </Link>

          <Link
            to="/schedule"
            className="p-6 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-rose-100 rounded-full group-hover:bg-rose-200 transition-colors">
                <Calendar className="h-6 w-6 text-rose-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Agendar Evento</p>
                <p className="mt-1 text-sm text-gray-500">Planejar cronograma</p>
              </div>
            </div>
          </Link>

          <Link
            to="/tasks"
            className="p-6 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                <CheckSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Adicionar Tarefa</p>
                <p className="mt-1 text-sm text-gray-500">Gerenciar tarefas</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;