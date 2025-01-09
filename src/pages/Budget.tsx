import React, { useState, useEffect } from 'react';
import { PlusCircle, DollarSign, Trash2, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BudgetCategory } from '../types/database.types';

function Budget() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    agreed_amount: 0,
    spent_amount: 0,
    payment_status: 'pending' as const,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return;
    }

    setCategories(data || []);
    const total = (data || []).reduce((sum, cat) => sum + cat.agreed_amount, 0);
    setTotalBudget(total);
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('budget_categories').insert([{
      ...newCategory,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    }]);

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      return;
    }

    setNewCategory({
      name: '',
      agreed_amount: 0,
      spent_amount: 0,
      payment_status: 'pending',
    });
    fetchCategories();
  }

  async function updateCategory(id: string, updates: Partial<BudgetCategory>) {
    const { error } = await supabase
      .from('budget_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return;
    }

    setEditingId(null);
    fetchCategories();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir categoria:', error);
      return;
    }

    fetchCategories();
  }

  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Orçamento Total</h3>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            R$ {totalBudget.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Total Gasto</h3>
            <DollarSign className="h-8 w-8 text-rose-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            R$ {totalSpent.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Restante</h3>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            R$ {remaining.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Formulário de Nova Categoria */}
      <form onSubmit={addCategory} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Ex: Buffet, Decoração, Fotografia"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            required
          />
          <input
            type="number"
            placeholder="Valor acordado (Ex: 5000)"
            value={newCategory.agreed_amount || ''}
            onChange={(e) => setNewCategory({ ...newCategory, agreed_amount: parseFloat(e.target.value) })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            min="0"
            step="0.01"
            required
          />
          <input
            type="number"
            placeholder="Valor já pago (Ex: 1000)"
            value={newCategory.spent_amount || ''}
            onChange={(e) => setNewCategory({ ...newCategory, spent_amount: parseFloat(e.target.value) })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            min="0"
            step="0.01"
            required
          />
          <select
            value={newCategory.payment_status}
            onChange={(e) => setNewCategory({ ...newCategory, payment_status: e.target.value as 'pending' | 'partial' | 'paid' })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          >
            <option value="pending">Pendente</option>
            <option value="partial">Parcial</option>
            <option value="paid">Pago</option>
          </select>
          <button
            type="submit"
            className="md:col-span-4 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Adicionar Categoria
          </button>
        </div>
      </form>

      {/* Lista de Categorias */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Acordado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Gasto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      placeholder="Nome da categoria"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="number"
                      value={category.agreed_amount}
                      onChange={(e) => updateCategory(category.id, { agreed_amount: parseFloat(e.target.value) })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      min="0"
                      step="0.01"
                      placeholder="Valor acordado"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">R$ {category.agreed_amount.toLocaleString('pt-BR')}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <input
                      type="number"
                      value={category.spent_amount}
                      onChange={(e) => updateCategory(category.id, { spent_amount: parseFloat(e.target.value) })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      min="0"
                      step="0.01"
                      placeholder="Valor já pago"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">R$ {category.spent_amount.toLocaleString('pt-BR')}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === category.id ? (
                    <select
                      value={category.payment_status}
                      onChange={(e) => updateCategory(category.id, { payment_status: e.target.value as 'pending' | 'partial' | 'paid' })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    >
                      <option value="pending">Pendente</option>
                      <option value="partial">Parcial</option>
                      <option value="paid">Pago</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${category.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      ${category.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${category.payment_status === 'pending' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {category.payment_status === 'paid' ? 'Pago' : 
                       category.payment_status === 'partial' ? 'Parcial' : 'Pendente'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === category.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-green-600 hover:text-green-900"
                        title="Salvar"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancelar"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingId(category.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Budget;