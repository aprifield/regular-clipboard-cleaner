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
    <div class="tooltip-caption">
      {{ new Date(time).toLocaleString() }}
      {{ historyEvent.events.map(e => `[${e.code}]`).join('') }}
    </div>
    <v-divider class="my-1" />
    <div class="tooltip-text">
      <div
        v-for="(text, row) in tooltipTexts"
        :key="`row-${row}`"
        class="tooltip-line"
      >
        <template v-if="row < tooltipLineCount">
          <template v-for="(char, col) in text">
            <span
              v-if="char === ' ' || char === '\t'"
              :key="`row-${row}-col-${col}`"
              class="tooltip-white-space"
              >{{ char === ' ' ? space : tab }}</span
            >
            <template v-else>{{ char }}</template>
          </template>
          <v-icon
            v-if="row < tooltipTexts.length - 1"
            class="tooltip-icon-return"
          >
            mdi-keyboard-return
          </v-icon>
        </template>
        <v-icon v-else class="tooltip-icon-dots">
          mdi-dots-horizontal
        </v-icon>
      </div>
    </div>
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
    tooltipLineCount: { type: Number, required: true },
    historyEvent: { type: Object as PropType<HistoryEvent>, required: true },
    settings: { type: Object as PropType<Settings>, required: true }
  },

  data() {
    return {
      space: '·',
      tab: '→   ',
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
    },
    tooltipTexts(): string[] {
      return this.tooltipText.split(/\r\n|\r|\n/, this.tooltipLineCount + 1);
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
  font-size: 12px;
}
.tooltip-text {
  font-family: Consolas, 'Courier New', 'Roboto', sans-serif;
  font-size: 12px;
  .tooltip-line {
    line-height: 18px;
    overflow-wrap: break-word;
  }
  .tooltip-white-space {
    opacity: 0.4;
    white-space: pre;
  }
  .tooltip-icon-return {
    color: #fff;
    font-size: 10px;
    margin-top: -1px;
    margin-left: 1px;
    opacity: 0.8;
  }
  .tooltip-icon-dots {
    color: #fff;
    font-size: 14px;
    opacity: 0.8;
  }
}
</style>
