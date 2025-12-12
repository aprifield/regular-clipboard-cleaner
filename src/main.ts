import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import App from '@/App.vue';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#008080',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#008080',
        },
      },
    },
  },
});

createApp(App).use(vuetify).mount('#app');
