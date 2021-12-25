<template>
  <v-tooltip
    bottom
    content-class="tooltip-content"
    open-delay="300"
    transition="fade-transition"
    :value="isTooltipVisible"
  >
    <template v-slot:activator="{ attrs }">
      <span v-bind="attrs">{{ text }}</span>
    </template>
    <span class="tooltip-caption">
      {{ new Date(time).toLocaleString() }}
      {{ historyEvent.events.map(e => `[${e.code}]`).join('') }}
    </span>
    <v-divider class="my-2" />
    <span class="tooltip-text">{{ tooltipText }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { HistoryEvent, PreprocessingHistoryEvent } from '@/types/history-event';
import { Settings } from '@/types/settings';
import defaultPreprocessing from '@/util/preprocessing';

export default Vue.extend({
  name: 'ClipboardHistoryText',

  props: {
    text: { type: String, required: true },
    time: { type: Number, required: true },
    tooltip: { type: Boolean, required: true },
    historyEvent: { type: Object as PropType<HistoryEvent>, required: true },
    settings: { type: Object as PropType<Settings>, required: true }
  },

  data() {
    return {
      isTooltipVisible: false,
      tooltipTimeoutId: -1
    };
  },

  computed: {
    tooltipText(): string {
      const preprocessing = this.settings.preprocessing
        ? this.settings.preprocessing
        : defaultPreprocessing;

      (this.historyEvent as PreprocessingHistoryEvent).preventPaste = () =>
        undefined;
      try {
        return eval(`(${preprocessing})(this.text, this.historyEvent)`);
      } catch (e) {
        return e + '';
      }
    }
  },

  watch: {
    tooltip() {
      window.clearTimeout(this.tooltipTimeoutId);
      if (this.tooltip) {
        this.tooltipTimeoutId = window.setTimeout(() => {
          this.isTooltipVisible = this.tooltip;
        }, 600);
      } else {
        this.isTooltipVisible = false;
      }
    }
  }
});
</script>

<style scoped lang="scss">
.tooltip-content {
  max-width: calc(100vw - 24px);
  min-width: calc(100vw - 24px);
  max-height: calc(50vh);
  overflow: hidden;
}
.tooltip-caption {
  zoom: 0.8;
}
.tooltip-text {
  white-space: pre-wrap;
}
</style>
