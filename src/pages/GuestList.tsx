import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Save, X, UserPlus, Users, Heart, BellRing as Ring } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Guest } from '../types/database.types';

interface GuestFamilyMember {
  name: string;
  surname?: string;
  age?: number;
}

function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [familyMembers, setFamilyMembers] = useState<GuestFamilyMember[]>([]);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: '',
    surname: '',
    side: 'bride',
    probability: 'medium',
    invitation_delivered: false
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
        guest_family_members (
          id,
          name,
          surname,
          age
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar convidados:', error);
      return;
    }

    setGuests(data || []);
  }

  function calculateStats() {
    const brideGuests = guests.filter(g => g.side === 'bride');
    const groomGuests = guests.filter(g => g.side === 'groom');

    const brideFamilyMembers = brideGuests.reduce((sum, guest) => 
      sum + (guest.guest_family_members?.length || 0), 0);
    const groomFamilyMembers = groomGuests.reduce((sum, guest) => 
      sum + (guest.guest_family_members?.length || 0), 0);

    const totalBrideSide = brideGuests.length + brideFamilyMembers;
    const totalGroomSide = groomGuests.length + groomFamilyMembers;
    const totalGuests = totalBrideSide + totalGroomSide;

    const deliveredInvitations = guests.filter(g => g.invitation_delivered).length;

    return {
      totalGuests,
      totalBrideSide,
      totalGroomSide,
      brideGuests: brideGuests.length,
      groomGuests: groomGuests.length,
      brideFamilyMembers,
      groomFamilyMembers,
      deliveredInvitations
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (selectedGuest) {
        // Atualizar convidado existente
        const { error: updateError } = await supabase
          .from('guests')
          .update({
            ...newGuest,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedGuest.id);

        if (updateError) throw updateError;

        // Remover familiares antigos
        const { error: deleteError } = await supabase
          .from('guest_family_members')
          .delete()
          .eq('guest_id', selectedGuest.id);

        if (deleteError) throw deleteError;

        // Adicionar novos familiares se houver
        if (familyMembers.length > 0) {
          const { error: familyError } = await supabase
            .from('guest_family_members')
            .insert(
              familyMembers.map(member => ({
                guest_id: selectedGuest.id,
                user_id: user.id,
                ...member
              }))
            );

          if (familyError) throw familyError;
        }
      } else {
        // Criar novo convidado
        const { data: guestData, error: insertError } = await supabase
          .from('guests')
          .insert([{
            ...newGuest,
            user_id: user.id,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!guestData) throw new Error('Erro ao criar convidado');

        // Adicionar familiares para o novo convidado
        if (familyMembers.length > 0) {
          const { error: familyError } = await supabase
            .from('guest_family_members')
            .insert(
              familyMembers.map(member => ({
                guest_id: guestData.id,
                user_id: user.id,
                ...member
              }))
            );

          if (familyError) throw familyError;
        }
      }

      setShowModal(false);
      setSelectedGuest(null);
      setNewGuest({
        name: '',
        surname: '',
        side: 'bride',
        probability: 'medium',
        invitation_delivered: false
      });
      setFamilyMembers([]);
      fetchGuests();
    } catch (error) {
      console.error('Erro ao salvar convidado:', error);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir convidado:', error);
      return;
    }

    fetchGuests();
  }

  const stats = calculateStats();
  const brideGuests = guests.filter(g => g.side === 'bride');
  const groomGuests = guests.filter(g => g.side === 'groom');

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Convidados</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalGuests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lado da Noiva</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBrideSide}</p>
              <p className="text-sm text-gray-500">
                {stats.brideGuests} convidados + {stats.brideFamilyMembers} familiares
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lado do Noivo</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalGroomSide}</p>
              <p className="text-sm text-gray-500">
                {stats.groomGuests} convidados + {stats.groomFamilyMembers} familiares
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Ring className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Convites Entregues</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.deliveredInvitations}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lista de Convidados</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Adicionar Convidado
        </button>
      </div>

      {/* Lista de Convidados em Duas Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lado da Noiva */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 text-pink-500 mr-2" />
            Lado da Noiva ({stats.totalBrideSide} pessoas)
          </h2>
          <div className="space-y-4">
            {brideGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {guest.name} {guest.surname}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGuest(guest);
                          setNewGuest(guest);
                          setFamilyMembers(guest.guest_family_members || []);
                          setShowModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Probabilidade:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guest.probability === 'high'
                          ? 'bg-green-100 text-green-800'
                          : guest.probability === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {guest.probability === 'high' ? 'Alta' : 
                         guest.probability === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Convite Entregue:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guest.invitation_delivered
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {guest.invitation_delivered ? 'Sim' : 'Não'}
                      </span>
                    </div>

                    {guest.guest_family_members && guest.guest_family_members.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Familiares:</h4>
                        <ul className="space-y-1">
                          {guest.guest_family_members.map((member, index) => (
                            <li key={index} className="text-sm text-gray-500">
                              {member.name} {member.surname}
                              {member.age && ` (${member.age} anos)`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lado do Noivo */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Ring className="h-5 w-5 text-blue-500 mr-2" />
            Lado do Noivo ({stats.totalGroomSide} pessoas)
          </h2>
          <div className="space-y-4">
            {groomGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {guest.name} {guest.surname}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedGuest(guest);
                          setNewGuest(guest);
                          setFamilyMembers(guest.guest_family_members || []);
                          setShowModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Probabilidade:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guest.probability === 'high'
                          ? 'bg-green-100 text-green-800'
                          : guest.probability === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {guest.probability === 'high' ? 'Alta' : 
                         guest.probability === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Convite Entregue:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        guest.invitation_delivered
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {guest.invitation_delivered ? 'Sim' : 'Não'}
                      </span>
                    </div>

                    {guest.guest_family_members && guest.guest_family_members.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Familiares:</h4>
                        <ul className="space-y-1">
                          {guest.guest_family_members.map((member, index) => (
                            <li key={index} className="text-sm text-gray-500">
                              {member.name} {member.surname}
                              {member.age && ` (${member.age} anos)`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                      {selectedGuest ? 'Editar Convidado' : 'Novo Convidado'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedGuest(null);
                        setNewGuest({
                          name: '',
                          surname: '',
                          side: 'bride',
                          probability: 'medium',
                          invitation_delivered: false
                        });
                        setFamilyMembers([]);
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
                        value={newGuest.name || ''}
                        onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        id="surname"
                        value={newGuest.surname || ''}
                        onChange={(e) => setNewGuest({ ...newGuest, surname: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="side" className="block text-sm font-medium text-gray-700">
                        Lado
                      </label>
                      <select
                        id="side"
                        value={newGuest.side}
                        onChange={(e) => setNewGuest({ ...newGuest, side: e.target.value as 'bride' | 'groom' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="bride">Noiva</option>
                        <option value="groom">Noivo</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="probability" className="block text-sm font-medium text-gray-700">
                        Probabilidade de Comparecimento
                      </label>
                      <select
                        id="probability"
                        value={newGuest.probability}
                        onChange={(e) => setNewGuest({ ...newGuest, probability: e.target.value as 'high' | 'medium' | 'low' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      >
                        <option value="high">Alta</option>
                        <option value="medium">Média</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Convite Entregue
                      </label>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="invitation_delivered"
                              value="yes"
                              checked={newGuest.invitation_delivered === true}
                              onChange={() => setNewGuest({ ...newGuest, invitation_delivered: true })}
                              className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="invitation_delivered"
                              value="no"
                              checked={newGuest.invitation_delivered === false}
                              onChange={() => setNewGuest({ ...newGuest, invitation_delivered: false })}
                              className="form-radio h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700">Não</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Familiares */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Familiares
                        </label>
                        <button
                          type="button"
                          onClick={() => setFamilyMembers([...familyMembers, { name: '', surname: '' }])}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary hover:bg-primary hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Adicionar
                        </button>
                      </div>
                      {familyMembers.map((member, index) => (
                        <div key={index} className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Familiar {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newMembers = [...familyMembers];
                                newMembers.splice(index, 1);
                                setFamilyMembers(newMembers);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => {
                              const newMembers = [...familyMembers];
                              newMembers[index].name = e.target.value;
                              setFamilyMembers(newMembers);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            placeholder="Nome"
                            required
                          />
                          <input
                            type="text"
                            value={member.surname || ''}
                            onChange={(e) => {
                              const newMembers = [...familyMembers];
                              newMembers[index].surname = e.target.value;
                              setFamilyMembers(newMembers);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            placeholder="Sobrenome"
                          />
                          <input
                            type="number"
                            value={member.age || ''}
                            onChange={(e) => {
                              const newMembers = [...familyMembers];
                              newMembers[index].age = parseInt(e.target.value) || undefined;
                              setFamilyMembers(newMembers);
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            placeholder="Idade"
                            min="0"
                            max="120"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {selectedGuest ? (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Adicionar Convidado
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedGuest(null);
                      setNewGuest({
                        name: '',
                        surname: '',
                        side: 'bride',
                        probability: 'medium',
                        invitation_delivered: false
                      });
                      setFamilyMembers([]);
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

export default GuestList;