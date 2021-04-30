<template>
  <v-layout fill-height>
    <v-container fluid class="pa-0">
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
        <v-card-text>
          <v-data-table
            ref="dataTable"
            :headers="[{ value: 'row' }, { value: 'text' }]"
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
                <td :style="{ 'white-space': 'nowrap' }">
                  <div class="text-truncate clipboard-text">
                    {{ item.text }}
                  </div>
                  <v-btn icon class="action-button" title="Copy to clipboard">
                    <v-icon @click="$emit('clipboard-copy-click', item.text)">
                      mdi-clipboard-outline
                    </v-icon>
                  </v-btn>
                  <v-btn icon class="action-button" title="Delete">
                    <v-icon @click="$emit('clipboard-delete-click', item.text)">
                      mdi-trash-can-outline
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>
  </v-layout>
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
.v-data-table tr {
  .clipboard-text {
    display: inline-block;
    vertical-align: middle;
    width: calc(100vw - 90px);
  }
  .action-button {
    display: none;
  }
  &:hover {
    .clipboard-text {
      padding-right: 10px;
      width: calc(100vw - 160px);
    }
    .action-button {
      display: inline-flex;
    }
  }
}
</style>
