<template>
  <v-container fluid class="pa-0">
    <v-card flat>
      <v-card-title>
        <v-text-field
          ref="textField"
          append-icon="mdi-magnify"
          autofocus
          dense
          hide-details
          label="Search"
          single-line
          :value="search"
          @input="onSearchInput"
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
            <!--
              Don't use mouseenter or mouseover.
              Scrolling with the arrow keys returns the focus to the line where the cursor was placed.
              The same problem occurs when closing the screen by clicking on a line.
            -->
            <v-list-item
              :key="`list-item-${index}`"
              :id="`clipboard-row-${index}`"
              class="v-list-item--link primary--text"
              :class="{ 'v-list-item--active': index === selectedIndex }"
              dense
              @click="onListItemClick(item.text)"
              @mousemove="selectedIndex = index"
            >
              <v-list-item-icon class="history-row">
                <span
                  class="text-right secondary--text"
                  :style="{ 'min-width': '16px' }"
                >
                  {{ item.row }}
                </span>
              </v-list-item-icon>
              <v-list-item-content class="history-text">
                <v-list-item-title>
                  <ClipboardHistoryText
                    :text="item.text"
                    :time="item.time"
                    :tooltip="index === selectedIndex"
                    :historyEvent="tooltipHistoryEvent"
                    :settings="settings"
                  />
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon class="history-action" title="Delete">
                <v-btn
                  icon
                  x-small
                  @click.stop="onDeleteClick(item.text)"
                  @mousedown.stop
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
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { HistoryItem } from '@/types/history-item';
import { HistoryEvent } from '@/types/history-event';
import { Settings } from '@/types/settings';
import ClipboardHistoryText from '@/components/ClipboardHistoryText.vue';

interface TableHistoryItems extends HistoryItem {
  index: number;
  row: number;
}

interface CopyEventParams {
  eventName: string;
  text: string;
  historyEvent: HistoryEvent;
}

export default Vue.extend({
  name: 'ClipboardHistory',

  components: { ClipboardHistoryText },

  props: {
    historyItems: { type: Array as PropType<HistoryItem[]>, required: true },
    settings: { type: Object as PropType<Settings>, required: true }
  },

  data() {
    return {
      search: '',
      isTextFieldFocused: false,
      selectedIndex: -1,
      searchTimeoutId: -1,
      findTargetTimeoutId: -1,
      historyItemHeight: 32,
      historyContainerHeight: 300,
      keyboardEvents: [] as KeyboardEvent[],
      copyEventParams: undefined as CopyEventParams | undefined
    };
  },

  computed: {
    maxVisibleItemCount(): number {
      return Math.floor(this.historyContainerHeight / this.historyItemHeight);
    },
    tableHistoryItems(): TableHistoryItems[] {
      return this.historyItems.map((item, index) => {
        return { ...item, index, row: index + 1 };
      });
    },
    currentHistoryItems(): TableHistoryItems[] {
      if (this.search) {
        const wordRegExps = this.search
          .split(' ')
          .filter(word => word)
          .map(word => word.replace(/[.*+?^=!:${}()|[\]/\\]/g, '\\$&'))
          .map(word => new RegExp(word, 'i'));
        if (wordRegExps.length) {
          return this.tableHistoryItems.filter(item =>
            wordRegExps.every(re => re.test(item.text))
          );
        } else {
          return this.tableHistoryItems;
        }
      } else {
        return this.tableHistoryItems;
      }
    },
    tooltipHistoryEvent(): HistoryEvent {
      return this.createHistoryEvent();
    }
  },

  methods: {
    initStatus() {
      this.search = '';
      this.selectedIndex = -1;
      this.keyboardEvents = [];
      this.copyEventParams = undefined;
    },
    createHistoryEvent(): HistoryEvent {
      const event = this.keyboardEvents[this.keyboardEvents.length - 1];
      if (event) {
        return {
          altKey: event.altKey,
          code: event.code,
          ctrlKey: event.ctrlKey,
          key: event.key,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          events: this.keyboardEvents.map(e => ({
            altKey: e.altKey,
            code: e.code,
            ctrlKey: e.ctrlKey,
            key: e.key,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey
          }))
        };
      } else {
        return {
          altKey: false,
          code: undefined,
          ctrlKey: false,
          key: undefined,
          metaKey: false,
          shiftKey: false,
          events: []
        };
      }
    },
    tryEmitCopyEvent(copyEventParams: CopyEventParams): void {
      if (this.keyboardEvents.length) {
        this.copyEventParams = copyEventParams;
      } else {
        this.emitCopyEvent(copyEventParams);
      }
    },
    emitCopyEvent(copyEventParams: CopyEventParams): void {
      this.$emit(
        copyEventParams.eventName,
        copyEventParams.text,
        copyEventParams.historyEvent
      );
      this.initStatus();
    },
    async adjustScrollPositionAndFindTargetRow(targetIndex: number) {
      const offset =
        this.historyItemHeight * (this.maxVisibleItemCount + 1) -
        this.historyContainerHeight;

      const visibleScrollRange = [
        targetIndex < this.maxVisibleItemCount
          ? 0
          : (targetIndex - this.maxVisibleItemCount) * this.historyItemHeight +
            offset,
        targetIndex * this.historyItemHeight
      ];

      const scrollTop = (this.$refs.historyList as Vue).$el.scrollTop;

      if (scrollTop < visibleScrollRange[0]) {
        (this.$refs.historyList as Vue).$el.scrollTop = visibleScrollRange[0];
      } else if (scrollTop > visibleScrollRange[1]) {
        (this.$refs.historyList as Vue).$el.scrollTop = visibleScrollRange[1];
      }

      return new Promise((resolve: (targetRow: Element | null) => void) => {
        let retryCount = 0;
        this.findTargetTimeoutId = window.setInterval(() => {
          const targetRow = document.querySelector(
            `#clipboard-row-${targetIndex}`
          );
          if (targetRow || 10 < retryCount) {
            resolve(targetRow);
            window.clearInterval(this.findTargetTimeoutId);
            setTimeout(() => {
              this.findTargetTimeoutId = -1;
            });
            return;
          }

          retryCount++;
          console.log('[ClipboardHistory] find target row failed.', retryCount);
        });
      });
    },
    onSearchInput(search: string) {
      window.clearTimeout(this.searchTimeoutId);
      this.searchTimeoutId = window.setTimeout(() => {
        this.search = search;
        this.selectedIndex = -1;
      }, 300);
    },
    onListItemClick(text: string) {
      this.tryEmitCopyEvent({
        eventName: 'clipboard-list-item-click',
        text,
        historyEvent: this.createHistoryEvent()
      });
    },
    onDeleteClick(text: string) {
      this.$emit('clipboard-delete-click', text);
      this.selectedIndex = -1;
    },
    async onWindowKeyDown(event: KeyboardEvent) {
      if (event.isComposing) {
        return;
      }

      if (event.code === 'Escape') {
        event.preventDefault();
        this.$emit('clipboard-escape-keydown');
        this.initStatus();
      } else if (event.code === 'Enter') {
        event.preventDefault();
        if (this.currentHistoryItems[this.selectedIndex]) {
          this.tryEmitCopyEvent({
            eventName: 'clipboard-enter-keydown',
            text: this.currentHistoryItems[this.selectedIndex].text,
            historyEvent: this.createHistoryEvent()
          });
        }
      } else if (event.code === 'KeyF' && (event.ctrlKey || event.metaKey)) {
        if (!this.isTextFieldFocused) {
          event.preventDefault();
          ((this.$refs.textField as Vue).$el.querySelector(
            'input'
          ) as HTMLInputElement).focus();
        }
      } else if (
        event.code === 'Home' ||
        event.code === 'End' ||
        event.code === 'PageUp' ||
        event.code === 'PageDown' ||
        event.code === 'ArrowUp' ||
        event.code === 'ArrowDown' ||
        event.code === 'Tab'
      ) {
        event.preventDefault();
        if (this.findTargetTimeoutId !== -1) {
          return;
        }

        let targetSelectedIndex = -1;
        if (event.code === 'Home' || event.code === 'End') {
          targetSelectedIndex =
            event.code === 'Home' ? 0 : this.currentHistoryItems.length - 1;
        } else if (event.code === 'PageUp' || event.code === 'PageDown') {
          targetSelectedIndex =
            (this.selectedIndex === -1 ? 0 : this.selectedIndex) +
            (event.code === 'PageUp'
              ? -this.maxVisibleItemCount
              : this.maxVisibleItemCount);
          if (!this.currentHistoryItems[targetSelectedIndex]) {
            targetSelectedIndex =
              event.code === 'PageUp' ? 0 : this.currentHistoryItems.length - 1;
          }
        } else {
          targetSelectedIndex =
            event.code === 'ArrowUp' || (event.code === 'Tab' && event.shiftKey)
              ? this.selectedIndex - 1
              : this.selectedIndex + 1;
          if (targetSelectedIndex === -1) {
            this.selectedIndex = -1;
          }
        }
        if (this.currentHistoryItems[targetSelectedIndex]) {
          const targetSelectedRow = await this.adjustScrollPositionAndFindTargetRow(
            targetSelectedIndex
          );
          if (targetSelectedRow) {
            this.selectedIndex = targetSelectedIndex;
          } else {
            this.selectedIndex = -1;
          }
        }
      } else {
        if (!this.keyboardEvents.some(e => e.code == event.code)) {
          this.keyboardEvents.push(event);
        }
      }
    },
    onWindowKeyUp(event: KeyboardEvent) {
      this.keyboardEvents = this.keyboardEvents.filter(
        e => e.code !== event.code
      );
      if (!this.keyboardEvents.length && this.copyEventParams) {
        this.emitCopyEvent(this.copyEventParams);
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
    },
    selectedIndex() {
      if (this.selectedIndex === -1) {
        if (!this.isTextFieldFocused) {
          ((this.$refs.textField as Vue).$el.querySelector(
            'input'
          ) as HTMLInputElement).focus();
        }
      } else {
        if (this.isTextFieldFocused) {
          ((this.$refs.textField as Vue).$el.querySelector(
            'input'
          ) as HTMLInputElement).blur();
        }
      }
    }
  },

  mounted() {
    window.addEventListener('keydown', this.onWindowKeyDown);
    window.addEventListener('keyup', this.onWindowKeyUp);
    window.addEventListener('resize', this.onWindowResize);
    this.onWindowResize();
  },

  destroyed() {
    window.removeEventListener('keydown', this.onWindowKeyDown);
    window.removeEventListener('keyup', this.onWindowKeyUp);
    window.removeEventListener('resize', this.onWindowResize);
  }
});
</script>

<style scoped lang="scss">
.v-card__title {
  padding-top: 8px;
  padding-bottom: 8px;
}
.v-card__text {
  height: calc(100vh - 46px);
}
.v-list-item {
  min-height: 32px;
  .history-text {
    padding-top: 4px;
    padding-bottom: 4px;
  }
  .history-row {
    margin-top: 5px !important;
    margin-bottom: 3px !important;
    margin-right: 8px !important;
  }
  .history-action {
    display: none;
    margin-top: 5px !important;
    margin-bottom: 3px !important;
  }
  &:hover {
    .history-action {
      display: inline-flex;
    }
  }
}
.scroll-behavior-smooth {
  scroll-behavior: smooth;
}
</style>
