<template>
  <v-layout fill-height>
    <v-container fluid class="pa-0">
      <v-card flat>
        <v-card-title>
          <v-text-field
            ref="textField"
            v-model="search"
            append-icon="mdi-magnify"
            dense
            hide-details
            label="Search (press /)"
            single-line
            @focus="isFocused = true"
            @blur="isFocused = false"
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-list ref="historyList" dense>
            <template v-for="(item, index) in currentHistoryItems">
              <v-list-item
                :key="`list-item-${index}`"
                :id="`clipboard-row-${index}`"
                class="v-list-item--link primary--text"
              >
                <v-list-item-icon class="mr-0">
                  {{ item.row }}
                </v-list-item-icon>
                <v-list-item-title>
                  {{ item.text }}
                </v-list-item-title>
                <v-list-item-icon
                  class="action-button"
                  title="Copy to clipboard"
                >
                  <v-btn
                    icon
                    small
                    @click="
                      () => {
                        $emit('clipboard-copy-click', item.text);
                        initStatus();
                      }
                    "
                  >
                    <v-icon>mdi-clipboard-outline</v-icon>
                  </v-btn>
                </v-list-item-icon>
                <v-list-item-icon class="action-button" title="Delete">
                  <v-btn
                    icon
                    small
                    @click="$emit('clipboard-delete-click', item.text)"
                  >
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </v-list-item-icon>
              </v-list-item>
              <v-divider
                v-if="index !== currentHistoryItems.length - 1"
                :key="`divider-${index}`"
              />
            </template>
          </v-list>
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
      isFocused: false,
      selectedIndex: -1
    };
  },

  computed: {
    tableHistoryItems(): TableHistoryItems[] {
      return this.historyItems.map((item, index) => {
        return { ...item, index, row: index + 1 };
      });
    },
    currentHistoryItems(): TableHistoryItems[] {
      return this.tableHistoryItems.filter(item => {
        return this.search
          ? item.row + '' === this.search ||
              item.text
                .toLocaleLowerCase()
                .includes(this.search.toLocaleLowerCase())
          : true;
      });
    }
  },

  methods: {
    initStatus() {
      if (this.selectedIndex !== -1) {
        const selectedRow = document.querySelector(
          `#clipboard-row-${this.selectedIndex}`
        );
        if (selectedRow) {
          selectedRow.classList.remove('v-list-item--active');
        }
      }
      this.search = '';
      this.selectedIndex = -1;
    },
    onWindowKeyDown(event: KeyboardEvent) {
      if (event.isComposing) {
        return;
      }

      if (event.code === 'Escape') {
        event.preventDefault();
        this.$emit('clipboard-escape-keydown');
        this.search = '';
      } else if (event.code === 'Slash') {
        if (!this.isFocused) {
          event.preventDefault();
          (this.$refs.textField as Vue).$el.querySelector('input')?.focus();
        }
      } else if (event.code === 'Enter') {
        event.preventDefault();
        if (this.currentHistoryItems[this.selectedIndex]) {
          this.$emit(
            'clipboard-enter-keydown',
            this.currentHistoryItems[this.selectedIndex].text
          );
          this.initStatus();
        }
      } else if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
        event.preventDefault();
        if (this.isFocused) {
          (this.$refs.textField as Vue).$el.querySelector('input')?.blur();
        }
        const prevIndex = this.selectedIndex;
        const nextIndex =
          event.code === 'ArrowDown'
            ? this.selectedIndex + 1
            : this.selectedIndex - 1;
        if (this.currentHistoryItems[nextIndex]) {
          if (this.currentHistoryItems[prevIndex]) {
            const prevRow = document.querySelector(
              `#clipboard-row-${prevIndex}`
            );
            if (prevRow) {
              prevRow.classList.remove('v-list-item--active');
            }
          }
          const nextRow = document.querySelector(`#clipboard-row-${nextIndex}`);
          if (nextRow) {
            nextRow.classList.add('v-list-item--active');
            this.selectedIndex = nextIndex;
          }
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
        this.$vuetify.goTo(this.$refs.historyList as Vue);
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
.v-list-item--link {
  cursor: auto;
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
  .action-button {
    display: none;
  }
  &:hover {
    .action-button {
      display: inline-flex;
    }
  }
}
</style>
