import vuetify from 'eslint-config-vuetify';

export default vuetify({
  rules: {
    '@stylistic/arrow-parens': ['error', 'always'],
    '@stylistic/comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
      },
    ],
    '@stylistic/member-delimiter-style': [
      'error',
      {
        multiline: { delimiter: 'semi', requireLast: true },
      },
    ],
    '@stylistic/operator-linebreak': [
      'error',
      'after',
      {
        overrides: {
          '?': 'before',
          ':': 'before',
        },
      },
    ],
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/space-before-function-paren': [
      'error',
      {
        named: 'never',
      },
    ],
    'unicorn/prefer-structured-clone': 'off',
    'vue/script-indent': 'off',
  },
});
