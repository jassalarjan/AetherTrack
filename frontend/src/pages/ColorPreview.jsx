import { useState } from 'react';
import { Palette, Copy, Check } from 'lucide-react';

const ColorPreview = () => {
  const [copiedColor, setCopiedColor] = useState(null);

  const colorSchemes = {
    blue: {
      name: 'Blue (Current)',
      primary: '#2563eb',
      secondary: '#06b6d4',
      gradient: 'from-blue-600 via-cyan-600 to-blue-700',
      colors: [
        { name: 'Blue 50', value: '#eff6ff', dark: false },
        { name: 'Blue 100', value: '#dbeafe', dark: false },
        { name: 'Blue 200', value: '#bfdbfe', dark: false },
        { name: 'Blue 300', value: '#93c5fd', dark: false },
        { name: 'Blue 400', value: '#60a5fa', dark: false },
        { name: 'Blue 500', value: '#3b82f6', dark: false },
        { name: 'Blue 600', value: '#2563eb', dark: true },
        { name: 'Blue 700', value: '#1d4ed8', dark: true },
        { name: 'Cyan 500', value: '#06b6d4', dark: false },
        { name: 'Cyan 600', value: '#0891b2', dark: true },
      ]
    },
    purple: {
      name: 'Purple (Alternative)',
      primary: '#a855f7',
      secondary: '#c026d3',
      gradient: 'from-purple-600 via-fuchsia-600 to-purple-700',
      colors: [
        { name: 'Purple 50', value: '#faf5ff', dark: false },
        { name: 'Purple 100', value: '#f3e8ff', dark: false },
        { name: 'Purple 200', value: '#e9d5ff', dark: false },
        { name: 'Purple 300', value: '#d8b4fe', dark: false },
        { name: 'Purple 400', value: '#c084fc', dark: false },
        { name: 'Purple 500', value: '#a855f7', dark: false },
        { name: 'Purple 600', value: '#9333ea', dark: true },
        { name: 'Purple 700', value: '#7e22ce', dark: true },
        { name: 'Fuchsia 500', value: '#d946ef', dark: false },
        { name: 'Fuchsia 600', value: '#c026d3', dark: true },
      ]
    },
    green: {
      name: 'Green (Alternative)',
      primary: '#10b981',
      secondary: '#059669',
      gradient: 'from-emerald-600 via-green-600 to-emerald-700',
      colors: [
        { name: 'Green 50', value: '#f0fdf4', dark: false },
        { name: 'Green 100', value: '#dcfce7', dark: false },
        { name: 'Green 200', value: '#bbf7d0', dark: false },
        { name: 'Green 300', value: '#86efac', dark: false },
        { name: 'Green 400', value: '#4ade80', dark: false },
        { name: 'Green 500', value: '#22c55e', dark: false },
        { name: 'Green 600', value: '#16a34a', dark: true },
        { name: 'Green 700', value: '#15803d', dark: true },
        { name: 'Emerald 500', value: '#10b981', dark: false },
        { name: 'Emerald 600', value: '#059669', dark: true },
      ]
    },
    indigo: {
      name: 'Indigo (Alternative)',
      primary: '#6366f1',
      secondary: '#4f46e5',
      gradient: 'from-indigo-600 via-violet-600 to-indigo-700',
      colors: [
        { name: 'Indigo 50', value: '#eef2ff', dark: false },
        { name: 'Indigo 100', value: '#e0e7ff', dark: false },
        { name: 'Indigo 200', value: '#c7d2fe', dark: false },
        { name: 'Indigo 300', value: '#a5b4fc', dark: false },
        { name: 'Indigo 400', value: '#818cf8', dark: false },
        { name: 'Indigo 500', value: '#6366f1', dark: false },
        { name: 'Indigo 600', value: '#4f46e5', dark: true },
        { name: 'Indigo 700', value: '#4338ca', dark: true },
        { name: 'Violet 500', value: '#8b5cf6', dark: false },
        { name: 'Violet 600', value: '#7c3aed', dark: true },
      ]
    },
    rose: {
      name: 'Rose (Alternative)',
      primary: '#f43f5e',
      secondary: '#e11d48',
      gradient: 'from-rose-600 via-pink-600 to-rose-700',
      colors: [
        { name: 'Rose 50', value: '#fff1f2', dark: false },
        { name: 'Rose 100', value: '#ffe4e6', dark: false },
        { name: 'Rose 200', value: '#fecdd3', dark: false },
        { name: 'Rose 300', value: '#fda4af', dark: false },
        { name: 'Rose 400', value: '#fb7185', dark: false },
        { name: 'Rose 500', value: '#f43f5e', dark: false },
        { name: 'Rose 600', value: '#e11d48', dark: true },
        { name: 'Rose 700', value: '#be123c', dark: true },
        { name: 'Pink 500', value: '#ec4899', dark: false },
        { name: 'Pink 600', value: '#db2777', dark: true },
      ]
    },
  };

  const copyToClipboard = (text, colorName) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Color Scheme Preview
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Explore different color schemes for AetherTrack
          </p>
        </div>

        {Object.entries(colorSchemes).map(([key, scheme]) => (
          <div key={key} className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {scheme.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Primary: {scheme.primary} | Secondary: {scheme.secondary}
                  </p>
                </div>
                <div className={`h-16 w-32 rounded-xl bg-gradient-to-r ${scheme.gradient} shadow-lg`}></div>
              </div>

              {/* Gradient Preview */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Gradient Preview
                </h3>
                <div className={`h-32 rounded-xl bg-gradient-to-r ${scheme.gradient} shadow-xl flex items-center justify-center`}>
                  <span className="text-white text-xl font-bold">AetherTrack</span>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Color Palette
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {scheme.colors.map((color) => (
                    <div key={color.name} className="group relative">
                      <button
                        onClick={() => copyToClipboard(color.value, color.name)}
                        className="w-full aspect-square rounded-xl shadow-lg hover:scale-105 transition-transform relative overflow-hidden border-2 border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: color.value }}
                      >
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedColor === color.name ? (
                            <Check className="w-6 h-6 text-white drop-shadow-lg" />
                          ) : (
                            <Copy className="w-6 h-6 text-white drop-shadow-lg" />
                          )}
                        </div>
                      </button>
                      <div className="mt-2 text-center">
                        <p className={`text-xs font-semibold ${color.dark ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {color.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {color.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UI Examples */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  UI Components Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Button */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Button</p>
                    <button
                      className={`w-full px-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${scheme.gradient} shadow-lg hover:shadow-xl transition-all`}
                    >
                      Click Me
                    </button>
                  </div>

                  {/* Card */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Card</p>
                    <div className={`p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br ${scheme.gradient} bg-opacity-10`}>
                      <p className={`text-sm font-semibold`} style={{ color: scheme.primary }}>
                        Sample Card
                      </p>
                    </div>
                  </div>

                  {/* Badge */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Badge</p>
                    <div className="flex gap-2 flex-wrap">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: scheme.primary }}
                      >
                        Active
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: scheme.secondary }}
                      >
                        New
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
            How to Use This Preview
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Click on any color swatch to copy its hex code</li>
            <li>• Review gradient previews to see color combinations</li>
            <li>• Check UI component examples to see colors in action</li>
            <li>• Current scheme is <strong>Blue</strong> - other schemes are alternatives you can choose</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPreview;
