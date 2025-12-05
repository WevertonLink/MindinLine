module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Só adiciona o plugin do reanimated quando NÃO estiver rodando testes
    ...(process.env.NODE_ENV !== 'test' ? ['react-native-reanimated/plugin'] : []),
  ],
};
