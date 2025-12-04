const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Otimizado para Termux:
 * - Watchman desabilitado (não funciona bem no Termux)
 * - Resolução de módulos ajustada
 * - Cache otimizado
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Desabilitar watchman (problemas no Termux)
  watchFolders: [path.resolve(__dirname)],

  // Resolver node_modules
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    extraNodeModules: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // Otimizações de cache
  cacheStores: [],

  // Transformer config
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
