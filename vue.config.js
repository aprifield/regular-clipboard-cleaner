module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.aprifield.regular-clipboard-cleaner',
        productName: 'Regular Clipboard Cleaner'
      },
      preload: 'src/preload.ts'
    }
  },
  transpileDependencies: ['vuetify']
};
