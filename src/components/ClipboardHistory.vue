<template>
  <v-card flat>
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      ref="dataTable"
      :headers="[{ value: 'row' }, { value: 'text' }, { value: 'trash' }]"
      :items="computedHistoryItems"
      :items-per-page="9999"
      hide-default-header
      hide-default-footer
      :mobile-breakpoint="0"
      :search="search"
    >
      <template v-slot:[`item.text`]="{ item }">
        <div class="text-truncate clipboard-text">
          {{ item.text }}
        </div>
      </template>
      <template v-slot:[`item.trash`]="{ item }">
        <v-btn icon class="trash-button">
          <v-icon @click="$emit('clipboard-trash-click', item.text)">
            mdi-trash-can-outline
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { HistoryItem } from '@/types/history-item';

export default Vue.extend({
  name: 'ClipboardHistory',

  props: {
    historyItems: { type: Array, default: () => [] }
  },

  data() {
    return { search: '' };
  },

  computed: {
    computedHistoryItems(): Array<HistoryItem & { row: number }> {
      return this.historyItems.map((item, index) => {
        return { ...(item as HistoryItem), row: index + 1 };
      });
    }
  },

  watch: {
    historyItems(
      newHistoryItems: HistoryItem[],
      oldHistoryItems: HistoryItem[]
    ) {
      if (newHistoryItems.length < oldHistoryItems.length) {
        return;
      }
      this.$vuetify.goTo(this.$refs.dataTable as Vue);
    }
  }
});
</script>

<style scoped lang="scss">
.clipboard-text {
  width: calc(100vw - 180px);
}
.trash-button {
  visibility: hidden;
}
.v-data-table tr:hover {
  .trash-button {
    visibility: initial;
  }
}
</style>
