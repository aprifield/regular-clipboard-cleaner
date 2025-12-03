<script setup lang="ts">
import type { Settings } from '@/types/settings';
import { computed } from 'vue';
import { loadDictionary, translate } from '@/util/i18n';
import defaultPreprocessing from '@/util/preprocessing';
import rules from '@/util/rules';

const props = defineProps<{
  locale: string;
  platform: string;
  settings: Settings;
}>();

const emit = defineEmits<{
  (e: 'change:clipboard-settings', value: Settings): void;
}>();

const __ = computed(() => {
  loadDictionary(props.locale);
  return translate;
});

const shortcut = computed(() => {
  return props.settings.shortcut || {};
});

const keys = computed(() => {
  const letters: string[] = [''];
  for (let i = 0; i < 26; i++) {
    letters.push(String.fromCodePoint(65 + i));
  }
  return letters;
});

function onClipboardSettingsChange(setting: Settings) {
  emit('change:clipboard-settings', { ...props.settings, ...setting });
}
</script>

<template>
  <v-container>
    <v-sheet rounded>
      <div class="pa-4">
        <v-row>
          <v-col>
            <v-checkbox
              density="compact"
              hide-details
              :label="__('settings.startAtLogin')"
              :model-value="props.settings.startAtLogin"
              @update:model-value="
                onClipboardSettingsChange({ startAtLogin: !!$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              density="compact"
              hide-details
              :label="__('settings.maintained')"
              :model-value="props.settings.maintained"
              @update:model-value="
                onClipboardSettingsChange({ maintained: !!$event })
              "
            />
          </v-col>
        </v-row>
      </div>
      <v-divider class="my-2" />
      <div class="pa-4">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.clearInterval')"
              :max="rules.clearInterval.max"
              :min="rules.clearInterval.min"
              :model-value="
                rules.clearInterval.value(props.settings.clearInterval)
              "
              :rules="[rules.clearInterval.rule]"
              :suffix="__('settings.seconds')"
              type="number"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({ clearInterval: +$event })
              "
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.monitorInterval')"
              :max="rules.monitorInterval.max"
              :min="rules.monitorInterval.min"
              :model-value="
                rules.monitorInterval.value(props.settings.monitorInterval)
              "
              :rules="[rules.monitorInterval.rule]"
              :suffix="__('settings.seconds')"
              type="number"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({ monitorInterval: +$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.maxHistoryCount')"
              :max="rules.maxHistoryCount.max"
              :min="rules.maxHistoryCount.min"
              :model-value="
                rules.maxHistoryCount.value(props.settings.maxHistoryCount)
              "
              :rules="[rules.maxHistoryCount.rule]"
              type="number"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({ maxHistoryCount: +$event })
              "
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.maxTextLength')"
              :max="rules.maxTextLength.max"
              :min="rules.maxTextLength.min"
              :model-value="
                rules.maxTextLength.value(props.settings.maxTextLength)
              "
              :rules="[rules.maxTextLength.rule]"
              type="number"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({ maxTextLength: +$event })
              "
            />
          </v-col>
        </v-row>
      </div>
      <v-divider class="my-2" />
      <div class="pa-4">
        <v-row>
          <v-col>{{ __('settings.shortcutComment') }}</v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="3">
            <v-checkbox
              density="compact"
              hide-details
              label="Command Or Control"
              :model-value="shortcut.commandOrControl"
              @update:model-value="
                onClipboardSettingsChange({
                  shortcut: { ...shortcut, commandOrControl: !!$event },
                })
              "
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-checkbox
              density="compact"
              hide-details
              label="Alt"
              :model-value="shortcut.alt"
              @update:model-value="
                onClipboardSettingsChange({
                  shortcut: { ...shortcut, alt: !!$event },
                })
              "
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-checkbox
              density="compact"
              hide-details
              label="Shift"
              :model-value="shortcut.shift"
              @update:model-value="
                onClipboardSettingsChange({
                  shortcut: { ...shortcut, shift: !!$event },
                })
              "
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              density="compact"
              hide-details
              :items="keys"
              :model-value="shortcut.key"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({
                  shortcut: { ...shortcut, key: $event },
                })
              "
            />
          </v-col>
        </v-row>
      </div>
      <v-divider class="my-2" />
      <div class="pa-4">
        <v-row>
          <v-col>
            <v-expansion-panels flat>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ __('settings.preprocessing') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-textarea
                    auto-grow
                    density="compact"
                    hide-details
                    :model-value="
                      props.settings.preprocessing || defaultPreprocessing
                    "
                    :placeholder="defaultPreprocessing"
                    variant="outlined"
                    @update:model-value="
                      onClipboardSettingsChange({ preprocessing: $event })
                    "
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              density="compact"
              hide-details
              :label="__('settings.closeAfterCopy')"
              :model-value="props.settings.closeAfterCopy"
              @update:model-value="
                onClipboardSettingsChange({ closeAfterCopy: !!$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-checkbox
              density="compact"
              :disabled="platform === 'darwin'"
              hide-details
              :label="__('settings.pasteAfterCopy')"
              :model-value="props.settings.pasteAfterCopy"
              @update:model-value="
                onClipboardSettingsChange({ pasteAfterCopy: !!$event })
              "
            />
            <span v-if="platform === 'darwin'" class="text-caption">
              ({{ __('settings.pasteAfterCopyComment') }})
            </span>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.pasteAfterCopyTimeout')"
              :max="rules.pasteAfterCopyTimeout.max"
              :min="rules.pasteAfterCopyTimeout.min"
              :model-value="
                rules.pasteAfterCopyTimeout.value(
                  props.settings.pasteAfterCopyTimeout
                )
              "
              :rules="[rules.pasteAfterCopyTimeout.rule]"
              :suffix="__('settings.milliseconds')"
              type="number"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({ pasteAfterCopyTimeout: +$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.commandAfterCopy')"
              :model-value="props.settings.commandAfterCopy"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({ commandAfterCopy: $event })
              "
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              density="compact"
              hide-details
              :label="__('settings.commandAfterCopyTimeout')"
              :max="rules.commandAfterCopyTimeout.max"
              :min="rules.commandAfterCopyTimeout.min"
              :model-value="
                rules.commandAfterCopyTimeout.value(
                  props.settings.commandAfterCopyTimeout
                )
              "
              :rules="[rules.commandAfterCopyTimeout.rule]"
              :suffix="__('settings.milliseconds')"
              type="number"
              variant="outlined"
              @update:model-value="
                onClipboardSettingsChange({
                  commandAfterCopyTimeout: +$event,
                })
              "
            />
          </v-col>
        </v-row>
      </div>
      <v-divider class="my-2" />
      <div class="pa-4">
        <v-row>
          <v-col>
            <v-checkbox
              density="compact"
              hide-details
              :label="__('settings.showNearCursor')"
              :model-value="props.settings.showNearCursor"
              @update:model-value="
                onClipboardSettingsChange({ showNearCursor: !!$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              density="compact"
              hide-details
              :label="__('settings.showFrame')"
              :model-value="props.settings.showFrame"
              @update:model-value="
                onClipboardSettingsChange({ showFrame: !!$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              v-if="platform === 'darwin'"
              density="compact"
              hide-details
              :label="__('settings.showDockIcon')"
              :model-value="props.settings.showDockIcon"
              @update:model-value="
                onClipboardSettingsChange({ showDockIcon: !!$event })
              "
            />
            <v-checkbox
              v-else
              density="compact"
              hide-details
              :label="__('settings.showTaskbarIcon')"
              :model-value="props.settings.showTaskbarIcon"
              @update:model-value="
                onClipboardSettingsChange({ showTaskbarIcon: !!$event })
              "
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-checkbox
              density="compact"
              hide-details
              :label="__('settings.darkTheme')"
              :model-value="props.settings.darkTheme"
              @update:model-value="
                onClipboardSettingsChange({ darkTheme: !!$event })
              "
            />
          </v-col>
        </v-row>
      </div>
      <v-divider class="my-2" />
      <div class="pa-4">
        <v-row>
          <v-col>
            <v-expansion-panels flat>
              <v-expansion-panel>
                <v-expansion-panel-title>
                  {{ __('settings.blockList') }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-combobox
                    density="compact"
                    hide-details
                    label="Block list"
                    :model-value="props.settings.blockList || []"
                    multiple
                    placeholder="123456, password, qwerty"
                    variant="outlined"
                    @update:model-value="
                      onClipboardSettingsChange({
                        blockList: $event,
                      })
                    "
                  >
                    <template #selection="{ item, index }">
                      <v-chip
                        closable
                        label
                        size="small"
                        :text="item.title"
                        variant="flat"
                        @click:close="
                          onClipboardSettingsChange({
                            blockList: (props.settings.blockList || []).filter(
                              (__, idx) => idx !== index
                            ),
                          })
                        "
                      />
                    </template>
                  </v-combobox>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </div>
    </v-sheet>
  </v-container>
</template>

<style scoped lang="scss">
.v-textarea {
  :deep(textarea) {
    font-family: Consolas, monospace;
  }
}
</style>
