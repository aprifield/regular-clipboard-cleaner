<template>
  <v-tooltip bottom content-class="text-tooltip" transition="fade-transition">
    <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">{{ text }}</span>
    </template>
    <span class="tooltip-text">{{ text }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ClipboardHistoryItem',

  props: {
    text: { type: String, default: '' }
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
