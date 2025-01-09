import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { GalleryItem } from '../types/database.types';

const categories = [
  'Decoração',
  'Flores',
  'Vestidos',
  'Ternos',
  'Convites',
  'Bolos',
  'Locais',
  'Mesas',
];

function Gallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newImage, setNewImage] = useState<Partial<GalleryItem>>({
    title: '',
    category: categories[0],
    image_url: '',
  });

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar imagens:', error);
      return;
    }

    setImages(data || []);
  }

  async function handleImageUpload(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from('gallery')
      .insert([{
        ...newImage,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      }]);

    if (error) {
      console.error('Erro ao adicionar imagem:', error);
      return;
    }

    setShowModal(false);
    setNewImage({
      title: '',
      category: categories[0],
      image_url: '',
    });
    fetchImages();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir imagem:', error);
      return;
    }

    fetchImages();
  }

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Filtro de Categorias e Botão Adicionar */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Todas
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Adicionar Imagem
        </button>
      </div>

      {/* Grade de Imagens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-lg shadow-md overflow-hidden aspect-square"
          >
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium truncate">{image.title}</h3>
                <p className="text-gray-200 text-sm">{image.category}</p>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Adicionar Imagem */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Adicionar Nova Imagem</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newImage.title}
                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <select
                    id="category"
                    value={newImage.category}
                    onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    URL da Imagem
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input
                      type="url"
                      id="image"
                      value={newImage.image_url}
                      onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                      required
                    />
                    <div className="flex-shrink-0">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Digite uma URL válida de imagem
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Imagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;