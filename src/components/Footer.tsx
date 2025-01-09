import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setEmail('');
  };

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-serif text-gray-900">Vows4Ever</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Tornando seu dia especial perfeito, um detalhe de cada vez.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-rose-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/budget" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Planejador de Orçamento
                </Link>
              </li>
              <li>
                <Link to="/suppliers" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Diretório de Fornecedores
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Linha do Tempo
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Galeria de Inspiração
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Recursos
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Checklist de Casamento
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Dicas de Planejamento
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Guia de Fornecedores
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-rose-500 transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Fique Atualizado
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Inscreva-se em nossa newsletter para receber dicas de planejamento e inspiração.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex-shrink-0 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Inscrever-se
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Vows4Ever. Todos os direitos reservados. Desenvolvido por{' '}
            <a 
              href="https://www.instagram.com/labora_tech/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-rose-500 hover:text-rose-600 transition-colors"
            >
              Labora Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}