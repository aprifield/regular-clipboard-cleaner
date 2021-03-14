<template>
  <v-app>
    <v-main>
      <ClipboardHistory
        :historyItems="historyItems"
        @clipboard-trash-click="onClipboardTrashClick"
      />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { HistoryItem } from '@/types/history-item';
import ClipboardHistory from '@/components/ClipboardHistory.vue';

export default Vue.extend({
  name: 'App',

  components: { ClipboardHistory },

  data(): { historyItems: HistoryItem[] } {
    return { historyItems: [] };
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
    onClipboardTrashClick(text: string) {
      this.ipcBridge.send('app-clipboard-trash-clicked', text);
    }
  },

  created() {
    this.ipcBridge.send('app-created');
    this.ipcBridge.on('init-history', (event, args) => {
      this.historyItems = args;
    });
  }
});
</script>
