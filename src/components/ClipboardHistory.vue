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
      :headers="[
        { value: 'row' },
        { value: 'text' },
        { value: 'copy' },
        { value: 'delete' }
      ]"
      :items="computedHistoryItems"
      :items-per-page="9999"
      hide-default-header
      hide-default-footer
      :mobile-breakpoint="0"
      :search="search"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td class="pr-0">
            {{ item.row }}
          </td>
          <td>
            <div class="text-truncate clipboard-text">
              {{ item.text }}
            </div>
          </td>
          <td class="pa-0">
            <v-btn icon class="action-button" title="Copy to clipboard">
              <v-icon @click="$emit('clipboard-copy-click', item.text)">
                mdi-clipboard-outline
              </v-icon>
            </v-btn>
          </td>
          <td class="pa-0">
            <v-btn icon class="action-button" title="Delete">
              <v-icon @click="$emit('clipboard-delete-click', item.text)">
                mdi-trash-can-outline
              </v-icon>
            </v-btn>
          </td>
        </tr>
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
  width: calc(100vw - 150px);
}
.action-button {
  visibility: hidden;
}
.v-data-table tr:hover {
  .action-button {
    visibility: initial;
  }
}
</style>
