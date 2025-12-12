<script setup lang="ts">
import type {
  HistoryEvent,
  PreprocessingHistoryEvent,
} from '@/types/history-event';
import type { Settings } from '@/types/settings';
import { computed, ref, watch } from 'vue';
import defaultPreprocessing from '@/util/preprocessing';

const props = defineProps<{
  text: string;
  time: number;
  tooltip: boolean;
  tooltipLineCount: number;
  historyEvent: HistoryEvent;
  settings: Settings;
}>();

const space = ref('·');
const tab = ref('→   ');
const isTooltipVisible = ref(false);
const tooltipTimeoutId = ref(-1);

const tooltipText = computed(() => {
  const preprocessing = props.settings.preprocessing || defaultPreprocessing;

  (props.historyEvent as PreprocessingHistoryEvent).preventPaste = () =>
    undefined;
  try {
    return eval(`(${preprocessing})(props.text, props.historyEvent)`);
  } catch (error) {
    return error + '';
  }
});

const tooltipTexts = computed(() => {
  return tooltipText.value.split(/\r\n|\r|\n/, props.tooltipLineCount + 1);
});

watch(
  () => props.tooltip,
  () => {
    window.clearTimeout(tooltipTimeoutId.value);
    if (props.tooltip) {
      tooltipTimeoutId.value = window.setTimeout(() => {
        isTooltipVisible.value = props.tooltip;
      }, 600);
    } else {
      isTooltipVisible.value = false;
    }
  }
);
</script>

<template>
  <!-- To improve performance in v-virtual-scroll, delay tooltip element creation until actually displayed. -->
  <v-tooltip
    v-if="props.tooltip"
    content-class="tooltip-content elevation-4"
    location="bottom"
    :model-value="isTooltipVisible"
    transition="fade-transition"
  >
    <template #activator="{ props: activatorProps }">
      <span v-bind="activatorProps" class="history-text">{{ props.text }}</span>
    </template>
    <div class="tooltip-container">
      <div class="tooltip-caption">
        {{ new Date(time).toLocaleString() }}
        {{ historyEvent.events.map((e) => `[${e.code}]`).join('') }}
      </div>
      <v-divider class="my-1" />
      <div class="tooltip-text">
        <div
          v-for="(rowText, rowIndex) in tooltipTexts"
          :key="`row-${rowIndex}`"
          class="tooltip-line"
        >
          <template v-if="rowIndex < tooltipLineCount">
            <template v-for="(char, col) in rowText">
              <span
                v-if="char === ' ' || char === '\t'"
                :key="`row-${rowIndex}-col-${col}`"
                class="tooltip-white-space"
              >
                {{ char === ' ' ? space : tab }}
              </span>
              <template v-else>{{ char }}</template>
            </template>
            <v-icon
              v-if="rowIndex < tooltipTexts.length - 1"
              class="tooltip-icon-return"
            >
              mdi-keyboard-return
            </v-icon>
          </template>
          <v-icon v-else class="tooltip-icon-dots">mdi-dots-horizontal</v-icon>
        </div>
      </div>
    </div>
  </v-tooltip>
  <span v-else class="history-text">{{ props.text }}</span>
</template>

<style lang="scss">
.tooltip-content {
  left: 12px !important;
  color: rgba(
    var(--v-theme-on-background),
    var(--v-high-emphasis-opacity)
  ) !important;
  background: rgb(var(--v-theme-background)) !important;
}
</style>

<style scoped lang="scss">
.history-text {
  font-size: 10px;
}

.tooltip-container {
  max-height: calc(50vh);
  overflow: hidden;

  .tooltip-caption {
    font-size: 8px;
  }

  .tooltip-text {
    font-family: Consolas, 'Courier New', 'Roboto', sans-serif;
    font-size: 10px;

    .tooltip-line {
      line-height: 16px;
      overflow-wrap: break-word;
    }

    .tooltip-white-space {
      white-space: pre;
      opacity: 0.4;
    }

    .tooltip-icon-return {
      font-size: 8px;
      margin-top: -1px;
      margin-left: 1px;
      color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
      opacity: 0.8;
    }

    .tooltip-icon-dots {
      font-size: 10px;
      color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
      opacity: 0.8;
    }
  }
}
</style>
