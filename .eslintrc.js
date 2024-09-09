module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['import'],
  rules: {
    'import/no-unresolved': [2, { ignore: ['App.json'] }],
  },
};
