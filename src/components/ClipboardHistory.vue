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
            :items="tableHistoryItems"
            :custom-filter="customFilter"
            disable-pagination
            dense
            hide-default-header
            hide-default-footer
            :mobile-breakpoint="0"
            :search="search"
            @current-items="onCurrentItemsChange"
          >
            <template v-slot:item="{ item }">
              <tr :class="{ active: item.index === selectedIndex }">
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
import Vue, { PropType } from 'vue';
import { HistoryItem } from '@/types/history-item';

interface TableHistoryItems extends HistoryItem {
  index: number;
  row: number;
}

export default Vue.extend({
  name: 'ClipboardHistory',

  props: {
    historyItems: { type: Array as PropType<HistoryItem[]>, default: () => [] }
  },

  data() {
    return {
      search: '',
      selectedIndex: -1,
      currentHistoryItems: [] as TableHistoryItems[]
    };
  },

  computed: {
    tableHistoryItems(): TableHistoryItems[] {
      return this.historyItems.map((item, index) => {
        return { ...item, index, row: index + 1 };
      });
    }
  },

  methods: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFilter(value: any, search: string | null, item: TableHistoryItems) {
      return search
        ? item.row + '' === search ||
            item.text.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        : true;
    },
    onCurrentItemsChange(historyItems: TableHistoryItems[]) {
      this.currentHistoryItems = historyItems;
      this.selectedIndex = this.currentHistoryItems[0]
        ? this.currentHistoryItems[0].index
        : -1;
    },
    onWindowKeyDown(event: KeyboardEvent) {
      if (event.isComposing) {
        return;
      }

      if (event.code === 'Enter') {
        event.preventDefault();
        if (this.tableHistoryItems[this.selectedIndex]) {
          this.$emit(
            'clipboard-enter-keydown',
            this.tableHistoryItems[this.selectedIndex].text
          );
        }
      } else if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
        event.preventDefault();
        const selectedItem = this.tableHistoryItems[this.selectedIndex];
        const currentIndex = this.currentHistoryItems.indexOf(selectedItem);
        const nextIndex =
          event.code === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
        if (this.currentHistoryItems[nextIndex]) {
          this.selectedIndex = this.currentHistoryItems[nextIndex].index;
        }
      }
    }
  },

  watch: {
    historyItems(
      newHistoryItems: HistoryItem[],
      oldHistoryItems: HistoryItem[]
    ) {
      if (oldHistoryItems.length < newHistoryItems.length) {
        this.$vuetify.goTo(this.$refs.dataTable as Vue);
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onWindowKeyDown);
  },

  destroyed() {
    window.removeEventListener('keydown', this.onWindowKeyDown);
  }
});
</script>

<style scoped lang="scss">
.v-data-table {
  ::v-deep .v-data-table__wrapper {
    overflow-x: hidden;
  }
  tr {
    .clipboard-text {
      display: inline-block;
      vertical-align: middle;
      width: calc(100vw - 110px);
    }
    .action-button {
      visibility: hidden;
    }
    &:hover {
      .clipboard-text {
        padding-right: 10px;
        width: calc(100vw - 180px);
      }
      .action-button {
        visibility: visible;
      }
    }
  }
}
</style>
