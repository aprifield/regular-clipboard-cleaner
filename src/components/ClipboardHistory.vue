<script setup lang="ts">
import type { HistoryEvent } from '@/types/history-event';
import type { HistoryItem } from '@/types/history-item';
import type { Settings } from '@/types/settings';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ClipboardHistoryText from '@/components/ClipboardHistoryText.vue';

interface TableHistoryItem extends HistoryItem {
  index: number;
  row: number;
}

interface CopyEventParams {
  eventName: 'click:clipboard-list-item' | 'keydown:clipboard-enter';
  text: string;
  historyEvent: HistoryEvent;
}

const props = defineProps<{
  historyItems: HistoryItem[];
  settings: Settings;
}>();

const emit = defineEmits<{
  (
    e: 'click:clipboard-list-item' | 'keydown:clipboard-enter',
    value: { text: string; historyEvent: HistoryEvent }
  ): void;
  (e: 'click:clipboard-pin' | 'click:clipboard-delete', value: string): void;
  (e: 'keydown:clipboard-escape'): void;
}>();

const search = ref('');
const isTextFieldFocused = ref(false);
const selectedIndex = ref(-1);
const searchTimeoutId = ref(-1);
const findTargetTimeoutId = ref(-1);
const textContainerHeight = ref(40);
const historyItemHeight = ref(32);
const historyContainerHeight = ref(300);
const keyboardEvents = ref<KeyboardEvent[]>([]);
const copyEventParams = ref<CopyEventParams>();
const textContainer = ref<HTMLDivElement | null>(null);
const historyContainer = ref<HTMLDivElement | null>(null);
const textField = ref<{ $el: HTMLDivElement } | null>(null);
const historyList = ref<{ $el: HTMLDivElement } | null>(null);

const maxVisibleItemCount = computed(() => {
  return Math.floor(historyContainerHeight.value / historyItemHeight.value);
});

const tableHistoryItems = computed<TableHistoryItem[]>(() => {
  return props.historyItems.map((item, index) => {
    return { ...item, index, row: index + 1 };
  });
});

const currentHistoryItems = computed<TableHistoryItem[]>(() => {
  if (search.value) {
    if (search.value === '/pin') {
      return tableHistoryItems.value.filter(
        (item) => item.pinned || item.text.includes('/pin')
      );
    } else {
      const wordRegExps = search.value
        .split(' ')
        .filter(Boolean)
        .map((word) => word.replace(/[.*+?^=!:${}()|[\]/\\]/g, String.raw`\$&`))
        .map((word) => new RegExp(word, 'i'));
      return wordRegExps.length > 0
        ? tableHistoryItems.value.filter((item) =>
            wordRegExps.every((re) => re.test(item.text))
          )
        : tableHistoryItems.value;
    }
  } else {
    return tableHistoryItems.value;
  }
});

const tooltipHistoryEvent = computed<HistoryEvent>(() => {
  return createHistoryEvent();
});

function initStatus() {
  search.value = '';
  selectedIndex.value = -1;
  keyboardEvents.value = [];
  copyEventParams.value = undefined;
  historyList.value!.$el.scrollTop = 0;
}

function createHistoryEvent(): HistoryEvent {
  const event = keyboardEvents.value.at(-1);
  return event
    ? {
        altKey: event.altKey,
        code: event.code,
        ctrlKey: event.ctrlKey,
        key: event.key,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        events: keyboardEvents.value.map((e) => ({
          altKey: e.altKey,
          code: e.code,
          ctrlKey: e.ctrlKey,
          key: e.key,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
        })),
      }
    : {
        altKey: false,
        code: undefined,
        ctrlKey: false,
        key: undefined,
        metaKey: false,
        shiftKey: false,
        events: [],
      };
}
function focusInTextField() {
  if (!isTextFieldFocused.value) {
    textField.value?.$el.querySelector<HTMLInputElement>('input')?.focus();
  }
}

function focusOutTextField() {
  if (isTextFieldFocused.value) {
    textField.value?.$el.querySelector<HTMLInputElement>('input')?.blur();
  }
}

function tryEmitCopyEvent(params: CopyEventParams) {
  if (keyboardEvents.value.length > 0) {
    copyEventParams.value = params;
  } else {
    emitCopyEvent(params);
  }
}

function emitCopyEvent(params: CopyEventParams) {
  emit(params.eventName, {
    text: params.text,
    historyEvent: params.historyEvent,
  });
  initStatus();
}

async function adjustScrollPositionAndFindTargetRow(targetIndex: number) {
  const offset =
    historyItemHeight.value * (maxVisibleItemCount.value + 1) -
    historyContainerHeight.value;

  const visibleScrollRange = [
    targetIndex < maxVisibleItemCount.value
      ? 0
      : (targetIndex - maxVisibleItemCount.value) * historyItemHeight.value +
        offset,
    targetIndex * historyItemHeight.value,
  ];

  const scrollTop = historyList.value!.$el.scrollTop;

  if (scrollTop < visibleScrollRange[0]) {
    historyList.value!.$el.scrollTop = visibleScrollRange[0];
  } else if (scrollTop > visibleScrollRange[1]) {
    historyList.value!.$el.scrollTop = visibleScrollRange[1];
  }

  return new Promise((resolve: (targetRow: Element | null) => void) => {
    let retryCount = 0;
    findTargetTimeoutId.value = window.setInterval(() => {
      const targetRow = document.querySelector(`#clipboard-row-${targetIndex}`);
      if (targetRow || 10 < retryCount) {
        resolve(targetRow);
        window.clearInterval(findTargetTimeoutId.value);
        setTimeout(() => {
          findTargetTimeoutId.value = -1;
        });
        return;
      }

      retryCount++;
      console.log('[ClipboardHistory] find target row failed.', retryCount);
    });
  });
}

function onSearchInput(str: string) {
  window.clearTimeout(searchTimeoutId.value);
  searchTimeoutId.value = window.setTimeout(() => {
    search.value = str;
    selectedIndex.value = -1;
  }, 300);
}

function onListItemClick(text: string) {
  tryEmitCopyEvent({
    eventName: 'click:clipboard-list-item',
    text,
    historyEvent: createHistoryEvent(),
  });
}

function onPinClick(text: string) {
  emit('click:clipboard-pin', text);
}

function onDeleteClick(text: string) {
  emit('click:clipboard-delete', text);
  selectedIndex.value = -1;
}

async function onWindowKeyDown(event: KeyboardEvent) {
  if (event.isComposing) {
    return;
  }

  if (event.code === 'Escape') {
    event.preventDefault();
    emit('keydown:clipboard-escape');
    initStatus();
  } else if (event.code === 'Enter') {
    event.preventDefault();
    if (currentHistoryItems.value[selectedIndex.value]) {
      tryEmitCopyEvent({
        eventName: 'keydown:clipboard-enter',
        text: currentHistoryItems.value[selectedIndex.value].text,
        historyEvent: createHistoryEvent(),
      });
    }
  } else if (event.code === 'KeyF' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    focusInTextField();
    selectedIndex.value = -1;
  } else if (
    event.code === 'Home' ||
    event.code === 'End' ||
    event.code === 'PageUp' ||
    event.code === 'PageDown' ||
    event.code === 'ArrowUp' ||
    event.code === 'ArrowDown' ||
    event.code === 'Tab'
  ) {
    if (
      (event.code === 'Home' || event.code === 'End') &&
      isTextFieldFocused.value
    ) {
      return;
    }

    event.preventDefault();
    if (findTargetTimeoutId.value !== -1) {
      return;
    }

    let targetSelectedIndex = -1;
    if (event.code === 'Home' || event.code === 'End') {
      targetSelectedIndex =
        event.code === 'Home' ? 0 : currentHistoryItems.value.length - 1;
    } else if (event.code === 'PageUp' || event.code === 'PageDown') {
      targetSelectedIndex =
        (selectedIndex.value === -1 ? 0 : selectedIndex.value) +
        (event.code === 'PageUp'
          ? -maxVisibleItemCount.value
          : maxVisibleItemCount.value);
      if (!currentHistoryItems.value[targetSelectedIndex]) {
        targetSelectedIndex =
          event.code === 'PageUp' ? 0 : currentHistoryItems.value.length - 1;
      }
    } else {
      targetSelectedIndex =
        event.code === 'ArrowUp' || (event.code === 'Tab' && event.shiftKey)
          ? selectedIndex.value - 1
          : selectedIndex.value + 1;
      if (selectedIndex.value === -1 || targetSelectedIndex === -1) {
        focusInTextField();
        selectedIndex.value = -1;
      }
    }
    if (currentHistoryItems.value[targetSelectedIndex]) {
      const targetSelectedRow = await adjustScrollPositionAndFindTargetRow(
        targetSelectedIndex
      );
      selectedIndex.value = targetSelectedRow ? targetSelectedIndex : -1;
    }
  } else {
    if (!keyboardEvents.value.some((e) => e.code == event.code)) {
      keyboardEvents.value.push(event);
    }
  }
}

function onWindowKeyUp(event: KeyboardEvent) {
  keyboardEvents.value = keyboardEvents.value.filter(
    (e) => e.code !== event.code
  );
  if (keyboardEvents.value.length === 0 && copyEventParams.value) {
    emitCopyEvent(copyEventParams.value);
  }
}

function onWindowResize() {
  if (textContainer.value) {
    textContainerHeight.value = textContainer.value.clientHeight;
  }
  if (historyContainer.value) {
    historyContainerHeight.value = historyContainer.value.clientHeight;
  }
}

function onWindowBlur() {
  keyboardEvents.value = [];
}

watch(
  () => props.historyItems,
  (newHistoryItems: HistoryItem[], oldHistoryItems: HistoryItem[]) => {
    if (oldHistoryItems[0]?.text !== newHistoryItems[0]?.text) {
      historyList.value!.$el.classList.add('scroll-behavior-smooth');
      historyList.value!.$el.scrollTop = 0;
      historyList.value!.$el.classList.remove('scroll-behavior-smooth');
    }
  }
);

watch(selectedIndex, () => {
  if (selectedIndex.value !== -1) {
    focusOutTextField();
  }
});

onMounted(() => {
  window.addEventListener('keydown', onWindowKeyDown);
  window.addEventListener('keyup', onWindowKeyUp);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('blur', onWindowBlur);
  onWindowResize();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeyDown);
  window.removeEventListener('keyup', onWindowKeyUp);
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('blur', onWindowBlur);
});
</script>

<template>
  <v-sheet>
    <div class="px-2">
      <v-text-field
        ref="textField"
        density="comfortable"
        hide-details
        :model-value="search"
        :placeholder="`Search${props.settings.maintained ? ' (/pin)' : ''}`"
        variant="underlined"
        @blur="isTextFieldFocused = false"
        @focus="isTextFieldFocused = true"
        @update:model-value="onSearchInput"
      >
        <template #prepend-inner>
          <v-icon class="mt-1" size="20">mdi-magnify</v-icon>
        </template>
      </v-text-field>
    </div>
    <div
      ref="historyContainer"
      class="history-container"
      :style="{ '--text-container-height': `${textContainerHeight}px` }"
    >
      <v-virtual-scroll
        ref="historyList"
        :height="historyContainerHeight"
        :item-height="historyItemHeight"
        :items="currentHistoryItems"
      >
        <template #default="{ item, index }">
          <!--
            Don't use mouseenter or mouseover.
            Scrolling with the arrow keys returns the focus to the line where the cursor was placed.
            The same problem occurs when closing the screen by clicking on a line.
          -->
          <v-list-item
            :id="`clipboard-row-${index}`"
            :key="`list-item-${index}`"
            :active="index === selectedIndex"
            density="compact"
            @click="onListItemClick(item.text)"
            @mousemove="selectedIndex = index"
          >
            <template #prepend>
              <div class="history-prepend">
                <template v-if="props.settings.maintained">
                  <v-hover>
                    <template #default="{ isHovering, props: defaultProps }">
                      <v-btn
                        v-bind="defaultProps"
                        :class="{ 'd-block': item.pinned }"
                        :color="item.pinned ? 'primary' : undefined"
                        density="compact"
                        :icon="
                          item.pinned && isHovering ? 'mdi-pin-off' : 'mdi-pin'
                        "
                        size="x-small"
                        :title="
                          item.pinned
                            ? 'Unpin to allow deletion'
                            : 'Pin to keep from deletion'
                        "
                        variant="plain"
                        @click.stop="onPinClick(item.text)"
                        @mousedown.stop.prevent
                      />
                    </template>
                  </v-hover>
                  <div v-if="!item.pinned" class="history-no">
                    {{ item.row }}
                  </div>
                </template>
                <template v-else>
                  <div class="history-no d-block">{{ item.row }}</div>
                </template>
              </div>
            </template>
            <v-list-item-title>
              <ClipboardHistoryText
                :history-event="tooltipHistoryEvent"
                :settings="props.settings"
                :text="item.text"
                :time="item.time"
                :tooltip="index === selectedIndex && !isTextFieldFocused"
                :tooltip-line-count="Math.floor((maxVisibleItemCount * 2) / 3)"
              />
            </v-list-item-title>
            <template #append>
              <div class="history-append">
                <v-btn
                  density="compact"
                  icon="mdi-trash-can-outline"
                  size="x-small"
                  title="Delete"
                  variant="plain"
                  @click.stop="onDeleteClick(item.text)"
                  @mousedown.stop
                />
              </div>
            </template>
          </v-list-item>
          <v-divider
            v-if="index !== currentHistoryItems.length - 1"
            :key="`divider-${index}`"
          />
        </template>
      </v-virtual-scroll>
    </div>
  </v-sheet>
</template>

<style scoped lang="scss">
.history-container {
  height: calc(100vh - var(--text-container-height));

  .v-list-item {
    min-height: 32px;

    .history-prepend {
      margin-right: 8px;
      min-width: 22px;

      .history-no {
        text-align: right;
        font-size: 12px;
        opacity: 0.6;
      }

      .v-btn {
        display: none;
      }
    }

    .history-append {
      .v-btn {
        display: none;
      }
    }

    &:hover {
      .history-prepend {
        .history-no {
          display: none;
        }

        .v-btn {
          display: block;
        }
      }

      .history-append {
        .v-btn {
          display: block;
        }
      }
    }

    :deep(.v-list-item__overlay) {
      transition: none;
    }
  }

  .v-divider {
    position: absolute;
    width: 100%;
  }

  .scroll-behavior-smooth {
    scroll-behavior: smooth;
  }
}
</style>
