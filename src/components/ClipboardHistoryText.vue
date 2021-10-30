<template>
  <v-tooltip
    bottom
    content-class="text-tooltip"
    open-delay="300"
    transition="fade-transition"
    :value="isTooltipVisible"
  >
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">{{ text }}</span>
    </template>
    <span class="caption font-italic">
      {{ new Date(time).toLocaleString() }}
    </span>
    <v-divider class="my-2" />
    <span class="tooltip-text">{{ text }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ClipboardHistoryItem',

  props: {
    text: { type: String, default: '' },
    time: { type: Number, default: 0 },
    tooltip: { type: Boolean, default: false }
  },

  data() {
    return {
      isTooltipVisible: false,
      tooltipTimeoutId: -1
    };
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
.tooltip-text {
  white-space: pre-wrap;
}
.text-tooltip {
  max-width: calc(100vw - 24px);
  min-width: calc(100vw - 24px);
  max-height: calc(50vh);
  overflow: hidden;
}
</style>
