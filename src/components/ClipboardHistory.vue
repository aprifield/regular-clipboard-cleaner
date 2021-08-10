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
            @focus="isTextFieldFocused = true"
            @blur="isTextFieldFocused = false"
          ></v-text-field>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-virtual-scroll
            ref="historyList"
            bench="1"
            :items="currentHistoryItems"
            :height="historyContainerHeight"
            :item-height="historyItemHeight"
          >
            <template v-slot:default="{ item, index }">
              <v-list-item
                :key="`list-item-${index}`"
                :id="`clipboard-row-${index}`"
                class="v-list-item--link primary--text"
                :class="{ 'v-list-item--active': index === selectedIndex }"
                dense
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
          </v-virtual-scroll>
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
      isTextFieldFocused: false,
      selectedIndex: -1,
      findTargetTimeoutId: -1,
      historyItemHeight: 40,
      historyContainerHeight: 300
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
    async adjustScrollPositionAndFindTargetRow(targetIndex: number) {
      const maxVisibleItemCount = Math.floor(
        this.historyContainerHeight / this.historyItemHeight
      );

      const offset =
        this.historyItemHeight * (maxVisibleItemCount + 1) -
        this.historyContainerHeight;

      const visibleScrollRange = [
        targetIndex < maxVisibleItemCount
          ? 0
          : (targetIndex - maxVisibleItemCount) * this.historyItemHeight +
            offset,
        targetIndex * this.historyItemHeight
      ];

      const scrollTop = (this.$refs.historyList as Vue).$el.scrollTop;

      if (scrollTop < visibleScrollRange[0]) {
        (this.$refs.historyList as Vue).$el.scrollTop = visibleScrollRange[0];
      } else if (scrollTop > visibleScrollRange[1]) {
        (this.$refs.historyList as Vue).$el.scrollTop = visibleScrollRange[1];
      }

      return new Promise((resolve: (targetRow: Element) => void, reject) => {
        let retryCount = 0;
        this.findTargetTimeoutId = window.setInterval(() => {
          const targetRow = document.querySelector(
            `#clipboard-row-${targetIndex}`
          );
          if (targetRow) {
            clearInterval(this.findTargetTimeoutId);
            this.findTargetTimeoutId = -1;
            resolve(targetRow);
            return;
          }

          if (10 < retryCount) {
            clearInterval(this.findTargetTimeoutId);
            this.findTargetTimeoutId = -1;
            reject();
            return;
          }

          retryCount++;
          console.log('[ClipboardHistory] find target row failed.', retryCount);
        });
      });
    },
    async onWindowKeyDown(event: KeyboardEvent) {
      if (event.isComposing) {
        return;
      }

      if (event.code === 'Escape') {
        event.preventDefault();
        this.$emit('clipboard-escape-keydown');
        this.search = '';
      } else if (event.code === 'Slash') {
        if (!this.isTextFieldFocused) {
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
        if (this.findTargetTimeoutId !== -1) {
          return;
        }

        if (this.isTextFieldFocused) {
          (this.$refs.textField as Vue).$el.querySelector('input')?.blur();
        }

        const currentSelectedIndex = this.selectedIndex;
        const targetSelectedIndex =
          event.code === 'ArrowDown'
            ? this.selectedIndex + 1
            : this.selectedIndex - 1;

        if (this.currentHistoryItems[targetSelectedIndex]) {
          if (this.currentHistoryItems[currentSelectedIndex]) {
            const currentSelectedRow = document.querySelector(
              `#clipboard-row-${currentSelectedIndex}`
            );
            if (currentSelectedRow) {
              currentSelectedRow.classList.remove('v-list-item--active');
            }
          }

          try {
            const targetSelectedRow = await this.adjustScrollPositionAndFindTargetRow(
              targetSelectedIndex
            );
            targetSelectedRow.classList.add('v-list-item--active');
            this.selectedIndex = targetSelectedIndex;
          } catch {
            this.selectedIndex = -1;
          }
        }
      }
    },
    onWindowResize() {
      const historyContainer = (this.$refs.historyList as Vue).$el.closest(
        '.v-card__text'
      );
      this.historyContainerHeight = historyContainer
        ? historyContainer.clientHeight
        : 300;
    }
  },

  watch: {
    historyItems(
      newHistoryItems: HistoryItem[],
      oldHistoryItems: HistoryItem[]
    ) {
      if (oldHistoryItems.length <= newHistoryItems.length) {
        (this.$refs.historyList as Vue).$el.classList.add(
          'scroll-behavior-smooth'
        );
        (this.$refs.historyList as Vue).$el.scrollTop = 0;
        (this.$refs.historyList as Vue).$el.classList.remove(
          'scroll-behavior-smooth'
        );
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  },

  destroyed() {
    window.removeEventListener('keydown', this.onWindowKeyDown);
    window.removeEventListener('resize', this.onWindowResize);
  }
});
</script>

<style scoped lang="scss">
.v-card__text {
  height: calc(100vh - 62px);
}
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
.scroll-behavior-smooth {
  scroll-behavior: smooth;
}
</style>
