import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Link as LinkIcon,
  Instagram,
  FileText,
  Check,
  AlertCircle,
  DollarSign,
  Upload,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [uploading, setUploading] = useState(false);
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return;
    }

    setSuppliers(data || []);
  }

  async function handleFileUpload(file: File, type: 'budget' | 'contract', supplierId: string) {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${supplierId}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      // Atualizar o fornecedor com o novo URL do arquivo
      const updates = type === 'contract' 
        ? { contract_url: publicUrl }
        : { budget_url: publicUrl };

      const { error: updateError } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', supplierId);

      if (updateError) throw updateError;

      await fetchSuppliers();
    } catch (error) {
      console.error(`Erro ao fazer upload do ${type}:`, error);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedSupplier) {
      const { error } = await supabase
        .from('suppliers')
        .update({
          ...newSupplier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSupplier.id);

      if (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        return;
      }
    } else {
      const { error } = await supabase
        .from('suppliers')
        .insert([{
          ...newSupplier,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) {
        console.error('Erro ao adicionar fornecedor:', error);
        return;
      }
    }

    setShowModal(false);
    setSelectedSupplier(null);
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

  async function handleDelete(id: string) {
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

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === 'all' || supplier.service === filterService;
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || supplier.payment_status === filterPayment;

    return matchesSearch && matchesService && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos os Serviços</option>
              {serviceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos os Status</option>
              <option value="potential">Potencial</option>
              <option value="final">Confirmado</option>
            </select>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
            >
              <option value="all">Todos os Pagamentos</option>
              <option value="pending">Pendente</option>
              <option value="partial">Parcial</option>
              <option value="paid">Pago</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Novo Fornecedor
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Fornecedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden ${
              supplier.status === 'final' ? 'border-2 border-green-500' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">{supplier.service}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setNewSupplier(supplier);
                      setShowModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Valor:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(supplier.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    supplier.status === 'final'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {supplier.status === 'final' ? 'Confirmado' : 'Potencial'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Pagamento:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    supplier.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : supplier.payment_status === 'partial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {supplier.payment_status === 'paid'
                      ? 'Pago'
                      : supplier.payment_status === 'partial'
                      ? 'Parcial'
                      : 'Pendente'}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {supplier.portfolio_link && (
                  <a
                    href={supplier.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-opacity-80"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Portfólio
                  </a>
                )}

                {supplier.instagram && (
                  <a
                    href={`https://instagram.com/${supplier.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-opacity-80"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    {supplier.instagram}
                  </a>
                )}

                {supplier.contract_url && (
                  <a
                    href={supplier.contract_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-opacity-80"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Contrato
                  </a>
                )}

                {supplier.budget_url && (
                  <a
                    href={supplier.budget_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-opacity-80"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Orçamento
                  </a>
                )}
              </div>

              {supplier.comments && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 whitespace-pre-line">{supplier.comments}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 1000 }}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedSupplier(null);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                        Serviço
                      </label>
                      <select
                        id="service"
                        value={newSupplier.service}
                        onChange={(e) => setNewSupplier({ ...newSupplier, service: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                      >
                        {serviceCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Valor
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">R$</span>
                        </div>
                        <input
                          type="number"
                          id="price"
                          value={newSupplier.price || ''}
                          onChange={(e) => setNewSupplier({ ...newSupplier, price: parseFloat(e.target.value) })}
                          className="pl-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        value={newSupplier.status}
                        onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value as 'potential' | 'final' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="potential">Potencial</option>
                        <option value="final">Confirmado</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700">
                        Status do Pagamento
                      </label>
                      <select
                        id="payment_status"
                        value={newSupplier.payment_status}
                        onChange={(e) => setNewSupplier({ ...newSupplier, payment_status: e.target.value as 'pending' | 'partial' | 'paid' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="pending">Pendente</option>
                        <option value="partial">Parcial</option>
                        <option value="paid">Pago</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                        Link do Portfólio
                      </label>
                      <input
                        type="url"
                        id="portfolio"
                        value={newSupplier.portfolio_link || ''}
                        onChange={(e) => setNewSupplier({ ...newSupplier, portfolio_link: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                        Instagram
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">@</span>
                        </div>
                        <input
                          type="text"
                          id="instagram"
                          value={newSupplier.instagram || ''}
                          onChange={(e) => setNewSupplier({ ...newSupplier, instagram: e.target.value })}
                          className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="usuario"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                        Observações
                      </label>
                      <textarea
                        id="comments"
                        value={newSupplier.comments || ''}
                        onChange={(e) => setNewSupplier({ ...newSupplier, comments: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {selectedSupplier && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Orçamento (PDF)
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, 'budget', selectedSupplier.id);
                                }
                              }}
                              className="sr-only"
                              id="budget-upload"
                            />
                            <label
                              htmlFor="budget-upload"
                              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              <Upload className="h-5 w-5 mr-2" />
                              Upload do Orçamento
                            </label>
                            {selectedSupplier.budget_url && (
                              <a
                                href={selectedSupplier.budget_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 text-sm text-primary hover:text-opacity-80"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Contrato (PDF)
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, 'contract', selectedSupplier.id);
                                }
                              }}
                              className="sr-only"
                              id="contract-upload"
                            />
                            <label
                              htmlFor="contract-upload"
                              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              <Upload className="h-5 w-5 mr-2" />
                              Upload do Contrato
                            </label>
                            {selectedSupplier.contract_url && (
                              <a
                                href={selectedSupplier.contract_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 text-sm text-primary hover:text-opacity-80"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <AlertCircle className="h-5 w-5 mr-2 animate-pulse" />
                        Enviando...
                      </>
                    ) : selectedSupplier ? (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Adicionar Fornecedor
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedSupplier(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
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

export default Suppliers;