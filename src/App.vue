<template>
  <v-app>
    <v-main>
      <ClipboardSettings
        v-if="mode === 'settings'"
        :settings="settings"
        @clipboard-settings-change="onClipboardSettingsChange"
      />
      <ClipboardHistory
        v-else
        :historyItems="historyItems"
        @clipboard-copy-click="onClipboardCopyClick"
        @clipboard-delete-click="onClipboardDeleteClick"
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
      maximized: false,
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
    onClipboardCopyClick(text: string) {
      this.ipcBridge.send('web-copy-click', text);
    },
    onClipboardDeleteClick(text: string) {
      this.ipcBridge.send('web-delete-click', text);
    },
    onClipboardSettingsChange(settings: Settings) {
      this.ipcBridge.send('web-settings-change', settings);
    }
  },

  created() {
    const searchParams = new URL(window.location.href).searchParams;
    const mode = searchParams.get('mode') || 'history';
    const maximized = searchParams.get('maximized') === 'true';
    const shouldUseDarkColors =
      searchParams.get('shouldUseDarkColors') === 'true';

    this.$vuetify.theme.dark = shouldUseDarkColors;
    this.mode = mode;
    this.maximized = maximized;

    this.ipcBridge.send('web-app-created');
    this.ipcBridge.on('init-history', (event, args) => {
      this.historyItems = args;
    });
    this.ipcBridge.on('init-settings', (event, args) => {
      this.settings = args;
    });
  },

  mounted() {
    this.ipcBridge.send('web-app-mounted', {
      mode: this.mode,
      maximized: this.maximized
    });
  }
});
</script>

<style lang="scss">
html {
  overflow: auto;
}
</style>
