module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.aprifield.clipboard-cleaner',
        productName: 'Clipboard Cleaner'
      },
      preload: 'src/preload.ts'
    }
  },
  transpileDependencies: ['vuetify']
};
