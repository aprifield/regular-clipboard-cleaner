<script setup lang="ts">
import type { HistoryEvent } from '@/types/history-event';
import type { HistoryItem } from '@/types/history-item';
import type { Settings } from '@/types/settings';
import { onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import ClipboardHistory from '@/components/ClipboardHistory.vue';
import ClipboardSettings from '@/components/ClipboardSettings.vue';

const theme = useTheme();
const mode = ref('history');
const locale = ref('en');
const platform = ref('win32');
const historyItems = ref<HistoryItem[]>([]);
const settings = ref<Settings>({});

function cloneDeep(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

function onClipboardListItemClick(value: {
  text: string;
  historyEvent: HistoryEvent;
}) {
  window.ipcBridge.send('web:click:list-item', cloneDeep(value));
}

function onClipboardPinClick(text: string) {
  window.ipcBridge.send('web:click:pin', { text });
}

function onClipboardDeleteClick(text: string) {
  window.ipcBridge.send('web:click:delete', { text });
}

function onClipboardEnterKeyDown(value: {
  text: string;
  historyEvent: HistoryEvent;
}) {
  window.ipcBridge.send('web:keydown:enter', cloneDeep(value));
}

function onClipboardEscapeKeyDown() {
  window.ipcBridge.send('web:keydown:escape');
}

function onClipboardSettingsChange(settings: Settings) {
  window.ipcBridge.send('web:change:settings', cloneDeep({ settings }));
}

onMounted(() => {
  window.ipcBridge.send('web:mounted', {
    mode: mode.value,
  });
});

(() => {
  const searchParams = new URL(window.location.href).searchParams;
  mode.value = searchParams.get('mode') || 'history';
  locale.value = searchParams.get('locale') || 'en';
  platform.value = searchParams.get('platform') || 'win32';

  window.ipcBridge.send('web:created');
  window.ipcBridge.on('native:init:history', (event, args) => {
    historyItems.value = args;
  });
  window.ipcBridge.on('native:init:settings', (event, args) => {
    settings.value = args;
    theme.change(settings.value.darkTheme ? 'dark' : 'light');
    const html = document.querySelector('html') as HTMLHtmlElement;
    if (mode.value === 'history') {
      html.classList.add('overflow-hidden');
    }
    if (platform.value === 'win32') {
      if (settings.value.darkTheme) {
        html.classList.remove('webkit-scrollbar--light');
        html.classList.add('webkit-scrollbar--dark');
      } else {
        html.classList.remove('webkit-scrollbar--dark');
        html.classList.add('webkit-scrollbar--light');
      }
    }
  });
})();
</script>

<template>
  <v-app>
    <v-main>
      <ClipboardSettings
        v-if="mode === 'settings'"
        :locale="locale"
        :platform="platform"
        :settings="settings"
        @change:clipboard-settings="onClipboardSettingsChange"
      />
      <ClipboardHistory
        v-else
        :history-items="historyItems"
        :settings="settings"
        @click:clipboard-delete="onClipboardDeleteClick"
        @click:clipboard-list-item="onClipboardListItemClick"
        @click:clipboard-pin="onClipboardPinClick"
        @keydown:clipboard-enter="onClipboardEnterKeyDown"
        @keydown:clipboard-escape="onClipboardEscapeKeyDown"
      />
    </v-main>
  </v-app>
</template>

<style lang="scss">
* {
  user-select: none;
}

html {
  overflow: auto;
}

.overflow-hidden {
  overflow: hidden;
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
