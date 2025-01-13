import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Calendar, AlertCircle, ArrowUp, ArrowDown, Clock, Edit2, Trash2, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import type { Task, TaskList } from '../types/database.types';

function Tasks() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    list_id: '',
  });

  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, []);

  async function fetchLists() {
    const { data, error } = await supabase
      .from('task_lists')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar listas:', error);
      return;
    }

    setLists(data || []);
    if (data && data.length > 0 && !newTask.list_id) {
      setNewTask(prev => ({ ...prev, list_id: data[0].id }));
    }
  }

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_lists(name)')
      .order('order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tarefas:', error);
      return;
    }

    setTasks(data || []);
  }

  function getListBackgroundColor(listName: string) {
    switch (listName.toLowerCase()) {
      case 'a fazer':
        return 'bg-gray-50';
      case 'em andamento':
        return 'bg-blue-50';
      case 'concluído':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  }

  function getCardBackgroundColor(listName: string) {
    switch (listName.toLowerCase()) {
      case 'a fazer':
        return 'bg-white hover:bg-gray-50';
      case 'em andamento':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'concluído':
        return 'bg-green-50 hover:bg-green-100';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  }

  function getListBorderColor(listName: string) {
    switch (listName.toLowerCase()) {
      case 'a fazer':
        return 'border-gray-200';
      case 'em andamento':
        return 'border-blue-200';
      case 'concluído':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
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

  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();

    if (selectedTask) {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...newTask,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTask.id);

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...newTask,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        return;
      }
    }

    setShowModal(false);
    setSelectedTask(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      list_id: lists[0]?.id,
    });
    fetchTasks();
  }

  async function handleDeleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir tarefa:', error);
      return;
    }

    fetchTasks();
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData('taskId', taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(e: React.DragEvent, listId: string) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    const tasksInList = tasks.filter(t => t.list_id === listId);
    const newOrder = tasksInList.length;

    const { error } = await supabase
      .from('tasks')
      .update({
        list_id: listId,
        order: newOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('Erro ao mover tarefa:', error);
      return;
    }

    fetchTasks();
  }

  if (lists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-gray-500">Nenhuma lista encontrada. Isso pode acontecer se:</div>
        <ul className="list-disc text-gray-500 pl-5">
          <li>Você acabou de se cadastrar e as listas ainda estão sendo criadas</li>
          <li>Houve algum problema durante a criação das listas</li>
        </ul>
        <button
          onClick={fetchLists}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90"
        >
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Nova Tarefa
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-16rem)]">
        {lists.map(list => (
          <div
            key={list.id}
            className={`rounded-lg p-4 flex flex-col border ${getListBackgroundColor(list.name)} ${getListBorderColor(list.name)}`}
            onDrop={(e) => handleDrop(e, list.id)}
            onDragOver={handleDragOver}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">{list.name}</h3>
            <div className="space-y-3 flex-grow overflow-y-auto">
              {tasks
                .filter(task => task.list_id === list.id)
                .sort((a, b) => a.order - b.order)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`rounded-lg shadow p-4 cursor-move transition-shadow ${getCardBackgroundColor(list.name)}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setNewTask(task);
                            setShowModal(true);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
                    {selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTask(null);
                      setNewTask({
                        title: '',
                        description: '',
                        priority: 'medium',
                        list_id: lists[0]?.id,
                      });
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveEvent} className="overflow-y-auto max-h-[calc(100vh-16rem)]">
                <div className="px-4 sm:px-6 py-4 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="list" className="block text-sm font-medium text-gray-700">
                      Lista
                    </label>
                    <select
                      id="list"
                      value={newTask.list_id}
                      onChange={(e) => setNewTask({ ...newTask, list_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      required
                    >
                      {lists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                      Prioridade
                    </label>
                    <select
                      id="priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">
                      Data de Vencimento
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="datetime-local"
                        id="due-date"
                        value={newTask.due_date || ''}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-4 bg-gray-50 rounded-b-lg flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedTask(null);
                    }}
                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {selectedTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;