import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';

function Settings() {
  const { colors, updateColors } = useTheme();
  const [tempColors, setTempColors] = React.useState(colors);

  const handleSave = async () => {
    await updateColors(tempColors);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-primary" />
            Personalização do Tema
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="max-w-xl">
            <p className="text-sm text-gray-500 mb-6">
              Personalize as cores do seu sistema de gerenciamento de casamento. 
              Cada cor tem um propósito específico na interface:
            </p>

            <div className="space-y-6">
              {/* Cor Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Principal
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Define a cor dos botões principais, links e elementos de destaque.
                  Esta cor deve ser vibrante e representar a ação principal.
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tempColors.primary}
                    onChange={(e) => setTempColors({ ...tempColors, primary: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={tempColors.primary.toUpperCase()}
                    onChange={(e) => setTempColors({ ...tempColors, primary: e.target.value })}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTempColors({ ...tempColors, primary: '#EC4899' })}
                      className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Resetar
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Elementos afetados:</h4>
                  <ul className="text-sm text-gray-500 list-disc list-inside">
                    <li>Botões principais</li>
                    <li>Links de navegação ativos</li>
                    <li>Ícones de destaque</li>
                    <li>Bordas de elementos focados</li>
                  </ul>
                </div>
              </div>

              {/* Cor Secundária */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Usada para elementos de suporte e estados hover. 
                  Deve ser uma variação mais clara ou escura da cor principal.
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tempColors.secondary}
                    onChange={(e) => setTempColors({ ...tempColors, secondary: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={tempColors.secondary.toUpperCase()}
                    onChange={(e) => setTempColors({ ...tempColors, secondary: e.target.value })}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTempColors({ ...tempColors, secondary: '#F472B6' })}
                      className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Resetar
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Elementos afetados:</h4>
                  <ul className="text-sm text-gray-500 list-disc list-inside">
                    <li>Botões secundários</li>
                    <li>Estados hover de links</li>
                    <li>Badges e indicadores</li>
                    <li>Ícones secundários</li>
                  </ul>
                </div>
              </div>

              {/* Cor de Destaque */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Destaque
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Utilizada para fundos sutis e elementos decorativos.
                  Deve ser uma cor muito clara para manter o contraste.
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={tempColors.accent}
                    onChange={(e) => setTempColors({ ...tempColors, accent: e.target.value })}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    value={tempColors.accent.toUpperCase()}
                    onChange={(e) => setTempColors({ ...tempColors, accent: e.target.value })}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTempColors({ ...tempColors, accent: '#FDF2F8' })}
                      className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                    >
                      Resetar
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Elementos afetados:</h4>
                  <ul className="text-sm text-gray-500 list-disc list-inside">
                    <li>Fundos de seções</li>
                    <li>Bordas decorativas</li>
                    <li>Estados hover sutis</li>
                    <li>Elementos de destaque suave</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTempColors(colors)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-opacity-90"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prévia */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Prévia do Tema</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Botões</h3>
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-opacity-90"
                  style={{ backgroundColor: tempColors.primary }}
                >
                  Botão Principal
                </button>
                <button
                  className="w-full px-4 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:bg-opacity-90"
                  style={{ backgroundColor: tempColors.secondary }}
                >
                  Botão Secundário
                </button>
                <button
                  className="w-full px-4 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-accent"
                  style={{ 
                    borderColor: tempColors.primary, 
                    color: tempColors.primary,
                    backgroundColor: 'transparent',
                  }}
                >
                  Botão Outline
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Elementos</h3>
              <div className="space-y-2">
                <div
                  className="p-4 rounded-md"
                  style={{ backgroundColor: tempColors.accent }}
                >
                  <p className="text-sm">Seção com Fundo de Destaque</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tempColors.primary, color: 'white' }}
                  >
                    Badge Principal
                  </span>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tempColors.secondary, color: 'white' }}
                  >
                    Badge Secundário
                  </span>
                </div>
                <div
                  className="p-4 border rounded-md"
                  style={{ borderColor: tempColors.primary }}
                >
                  <p className="text-sm">Borda Colorida</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;