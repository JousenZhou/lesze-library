module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['@vue/prettier', 'plugin:vue/essential', 'eslint:recommended'],
    rules: {
        // 'import/no-unresolved': [1, { ignore: ['^@/'] }],
        'vue/valid-v-for': 'off',
        'no-console': 'off',
        'no-unused-vars': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
    },
    parserOptions: {
        parser: 'babel-eslint',
        ecmaFeatures: {
            legacyDecorators: true
        }
    }
};
