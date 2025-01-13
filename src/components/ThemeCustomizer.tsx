import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Settings, Check } from 'lucide-react';

export function ThemeCustomizer() {
  const { colors, updateColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [tempColors, setTempColors] = useState(colors);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    await updateColors(tempColors);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Personalizar Cores"
      >
        <Settings className="h-6 w-6 text-gray-600" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personalizar Cores do Tema</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Principal
                </label>
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
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
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
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Destaque
                </label>
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
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setTempColors(colors);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-opacity-90 flex items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  {showSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Salvo!
                    </>
                  ) : (
                    'Salvar Cores'
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Prévia</h3>
              <div className="space-y-2">
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: tempColors.primary }}
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: tempColors.secondary }}
                />
                <div
                  className="h-8 rounded"
                  style={{ backgroundColor: tempColors.accent }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}