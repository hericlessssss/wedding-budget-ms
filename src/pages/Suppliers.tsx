import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Save, X, Link, Instagram, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Supplier } from '../types/database.types';

const serviceCategories = [
  'Buffet',
  'Decoração',
  'Fotografia',
  'Música',
  'Cerimonial',
  'Vestido',
  'Local',
  'Convites',
  'Doces',
  'Bolo',
  'Outro'
];

function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    service: serviceCategories[0],
    price: 0,
    status: 'potential',
    payment_status: 'pending',
    comments: '',
    portfolio_link: '',
    instagram: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return;
    }

    setSuppliers(data || []);
  }

  async function addSupplier(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('suppliers').insert([{
      ...newSupplier,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    }]);

    if (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      return;
    }

    setNewSupplier({
      name: '',
      service: serviceCategories[0],
      price: 0,
      status: 'potential',
      payment_status: 'pending',
      comments: '',
      portfolio_link: '',
      instagram: '',
    });
    fetchSuppliers();
  }

  async function updateSupplier(id: string, updates: Partial<Supplier>) {
    const { error } = await supabase
      .from('suppliers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      return;
    }

    setEditingId(null);
    fetchSuppliers();
  }

  async function deleteSupplier(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir fornecedor:', error);
      return;
    }

    fetchSuppliers();
  }

  async function handleContractUpload(id: string, file: File) {
    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(`${id}/${file.name}`, file);

    if (error) {
      console.error('Erro ao fazer upload do contrato:', error);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(data.path);

    await updateSupplier(id, { contract_url: publicUrl });
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Novo Fornecedor */}
      <form onSubmit={addSupplier} className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Fornecedor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome do Fornecedor"
            value={newSupplier.name}
            onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            required
          />
          <select
            value={newSupplier.service}
            onChange={(e) => setNewSupplier({ ...newSupplier, service: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
            required
          >
            {serviceCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Preço"
            value={newSupplier.price || ''}
            onChange={(e) => setNewSupplier({ ...newSupplier, price: parseFloat(e.target.value) })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          />
          <select
            value={newSupplier.status}
            onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value as 'potential' | 'final' })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          >
            <option value="potential">Potencial</option>
            <option value="final">Confirmado</option>
          </select>
          <select
            value={newSupplier.payment_status}
            onChange={(e) => setNewSupplier({ ...newSupplier, payment_status: e.target.value as 'pending' | 'partial' | 'paid' })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          >
            <option value="pending">Pendente</option>
            <option value="partial">Parcial</option>
            <option value="paid">Pago</option>
          </select>
          <input
            type="url"
            placeholder="Link do Portfólio"
            value={newSupplier.portfolio_link}
            onChange={(e) => setNewSupplier({ ...newSupplier, portfolio_link: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          />
          <input
            type="text"
            placeholder="Instagram (ex: @fornecedor)"
            value={newSupplier.instagram}
            onChange={(e) => setNewSupplier({ ...newSupplier, instagram: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
          />
          <textarea
            placeholder="Observações"
            value={newSupplier.comments}
            onChange={(e) => setNewSupplier({ ...newSupplier, comments: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 md:col-span-2 lg:col-span-3"
            rows={3}
          />
          <button
            type="submit"
            className="md:col-span-2 lg:col-span-3 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Adicionar Fornecedor
          </button>
        </div>
      </form>

      {/* Lista de Fornecedores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço e Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className={supplier.status === 'final' ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4">
                    {editingId === supplier.id ? (
                      <input
                        type="text"
                        value={supplier.name}
                        onChange={(e) => updateSupplier(supplier.id, { name: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === supplier.id ? (
                      <div className="space-y-2">
                        <select
                          value={supplier.service}
                          onChange={(e) => updateSupplier(supplier.id, { service: e.target.value })}
                          className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                        >
                          {serviceCategories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={supplier.price || ''}
                          onChange={(e) => updateSupplier(supplier.id, { price: parseFloat(e.target.value) })}
                          className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-900">{supplier.service}</div>
                        <div className="text-sm text-gray-500">
                          R$ {supplier.price?.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === supplier.id ? (
                      <div className="space-y-2">
                        <select
                          value={supplier.status}
                          onChange={(e) => updateSupplier(supplier.id, { status: e.target.value as 'potential' | 'final' })}
                          className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                        >
                          <option value="potential">Potencial</option>
                          <option value="final">Confirmado</option>
                        </select>
                        <select
                          value={supplier.payment_status}
                          onChange={(e) => updateSupplier(supplier.id, { payment_status: e.target.value as 'pending' | 'partial' | 'paid' })}
                          className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                        >
                          <option value="pending">Pendente</option>
                          <option value="partial">Parcial</option>
                          <option value="paid">Pago</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${supplier.status === 'final' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          {supplier.status === 'final' ? 'Confirmado' : 'Potencial'}
                        </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${supplier.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                          ${supplier.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${supplier.payment_status === 'pending' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {supplier.payment_status === 'paid' ? 'Pago' : 
                           supplier.payment_status === 'partial' ? 'Parcial' : 'Pendente'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {supplier.portfolio_link && (
                        <a
                          href={supplier.portfolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-600 hover:text-rose-900 inline-flex items-center space-x-1"
                        >
                          <Link className="h-4 w-4" />
                          <span>Portfólio</span>
                        </a>
                      )}
                      {supplier.instagram && (
                        <a
                          href={`https://instagram.com/${supplier.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-600 hover:text-rose-900 inline-flex items-center space-x-1"
                        >
                          <Instagram className="h-4 w-4" />
                          <span>{supplier.instagram}</span>
                        </a>
                      )}
                      {supplier.contract_url ? (
                        <a
                          href={supplier.contract_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-600 hover:text-rose-900 inline-flex items-center space-x-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Contrato</span>
                        </a>
                      ) : (
                        <div className="text-sm text-gray-500">Sem contrato</div>
                      )}
                      {editingId === supplier.id && (
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleContractUpload(supplier.id, file);
                          }}
                          accept=".pdf,.doc,.docx"
                          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === supplier.id ? (
                      <textarea
                        value={supplier.comments || ''}
                        onChange={(e) => updateSupplier(supplier.id, { comments: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 w-full"
                        rows={3}
                      />
                    ) : (
                      <div className="text-sm text-gray-500">{supplier.comments}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === supplier.id ? (
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
                          onClick={() => setEditingId(supplier.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteSupplier(supplier.id)}
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
    </div>
  );
}

export default Suppliers;