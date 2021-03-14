module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Clipboard Cleaner'
      },
      preload: 'src/preload.ts'
    }
  },
  transpileDependencies: ['vuetify']
};
