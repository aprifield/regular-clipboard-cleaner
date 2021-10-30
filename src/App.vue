<template>
  <v-app>
    <v-main>
      <ClipboardSettings
        v-if="mode === 'settings'"
        :locale="locale"
        :platform="platform"
        :settings="settings"
        @clipboard-settings-change="onClipboardSettingsChange"
      />
      <ClipboardHistory
        v-else
        :historyItems="historyItems"
        @clipboard-list-item-click="onClipboardListItemClick"
        @clipboard-delete-click="onClipboardDeleteClick"
        @clipboard-enter-keydown="onClipboardEnterKeyDown"
        @clipboard-escape-keydown="onClipboardEscapeKeyDown"
      />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { HistoryItem } from '@/types/history-item';
import { Settings } from '@/types/settings';
import ClipboardHistory from '@/components/ClipboardHistory.vue';
import ClipboardSettings from '@/components/ClipboardSettings.vue';

export default Vue.extend({
  name: 'App',

  components: { ClipboardHistory, ClipboardSettings },

  data() {
    return {
      mode: 'history',
      locale: 'en',
      platform: 'win32',
      historyItems: [] as HistoryItem[],
      settings: {} as Settings
    };
  },

  computed: {
    ipcBridge() {
      const ipcBridge = ((window as unknown) as {
        ipcBridge: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          send(channel: string, data?: any): void;
          on(
            channel: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            listener: (event: any, ...args: any[]) => void
          ): void;
        };
      }).ipcBridge;
      return ipcBridge;
    }
  },

  methods: {
    onClipboardListItemClick(text: string, event: MouseEvent) {
      if (event.ctrlKey) {
        this.ipcBridge.send('web-list-item-ctrl-click', text);
      } else {
        this.ipcBridge.send('web-list-item-click', text);
      }
    },
    onClipboardDeleteClick(text: string) {
      this.ipcBridge.send('web-delete-click', text);
    },
    onClipboardEnterKeyDown(text: string) {
      this.ipcBridge.send('web-enter-keydown', text);
    },
    onClipboardEscapeKeyDown() {
      this.ipcBridge.send('web-escape-keydown');
    },
    onClipboardSettingsChange(settings: Settings) {
      this.ipcBridge.send('web-settings-change', settings);
    }
  },

  created() {
    const searchParams = new URL(window.location.href).searchParams;
    const mode = searchParams.get('mode') || 'history';
    const locale = searchParams.get('locale') || 'en';
    const platform = searchParams.get('platform') || 'win32';

    this.mode = mode;
    this.locale = locale;
    this.platform = platform;

    this.ipcBridge.send('web-app-created');
    this.ipcBridge.on('init-history', (event, args) => {
      this.historyItems = args;
    });
    this.ipcBridge.on('init-settings', (event, args) => {
      this.settings = args;
      this.$vuetify.theme.dark = !!this.settings.darkTheme;
      if (platform === 'win32') {
        const html = document.querySelector('html') as HTMLHtmlElement;
        if (this.settings.darkTheme) {
          html.classList.remove('webkit-scrollbar--light');
          html.classList.add('webkit-scrollbar--dark');
        } else {
          html.classList.remove('webkit-scrollbar--dark');
          html.classList.add('webkit-scrollbar--light');
        }
      }
    });
  },

  mounted() {
    this.ipcBridge.send('web-app-mounted', {
      mode: this.mode
    });
  }
});
</script>

<style lang="scss">
html {
  overflow: auto;
}

.webkit-scrollbar {
  &--dark {
    ::-webkit-scrollbar {
      width: 12px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: rgb(30, 30, 30);
    }
    ::-webkit-scrollbar-thumb {
      background: rgb(66, 66, 66);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(79, 79, 79);
    }
  }
  &--light {
    ::-webkit-scrollbar {
      width: 12px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: rgb(241, 241, 241);
    }
    ::-webkit-scrollbar-thumb {
      background: rgb(192, 192, 192);
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(168, 168, 168);
    }
  }
}
</style>
