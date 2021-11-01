<template>
  <v-container>
    <v-card flat>
      <v-card-text>
        <v-container>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                :label="__('settings.startAtLogin')"
                :input-value="settings.startAtLogin"
                @change="onClipboardSettingsChange({ startAtLogin: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                :label="__('settings.maintained')"
                :input-value="settings.maintained"
                @change="onClipboardSettingsChange({ maintained: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                :label="__('settings.clearInterval')"
                :min="rules.clearInterval.min"
                :max="rules.clearInterval.max"
                :rules="[rules.clearInterval.rule]"
                :suffix="__('settings.seconds')"
                type="number"
                :value="rules.clearInterval.value(settings.clearInterval)"
                @change="onClipboardSettingsChange({ clearInterval: +$event })"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                :disabled="+settings.maxHistoryCount === 0"
                hide-details
                :label="__('settings.monitorInterval')"
                :min="rules.monitorInterval.min"
                :max="rules.monitorInterval.max"
                :rules="[rules.monitorInterval.rule]"
                :suffix="__('settings.seconds')"
                type="number"
                :value="rules.monitorInterval.value(settings.monitorInterval)"
                @change="
                  onClipboardSettingsChange({ monitorInterval: +$event })
                "
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                :label="__('settings.maxHistoryCount')"
                :min="rules.maxHistoryCount.min"
                :max="rules.maxHistoryCount.max"
                :rules="[rules.maxHistoryCount.rule]"
                type="number"
                :value="rules.maxHistoryCount.value(settings.maxHistoryCount)"
                @change="
                  onClipboardSettingsChange({ maxHistoryCount: +$event })
                "
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                :label="__('settings.maxTextLength')"
                :min="rules.maxTextLength.min"
                :max="rules.maxTextLength.max"
                :rules="[rules.maxTextLength.rule]"
                type="number"
                :value="rules.maxTextLength.value(settings.maxTextLength)"
                @change="onClipboardSettingsChange({ maxTextLength: +$event })"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col>{{ __('settings.shortcutComment') }}</v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="12" sm="3">
              <v-checkbox
                hide-details
                label="Command Or Control"
                :input-value="shortcut.commandOrControl"
                @change="
                  onClipboardSettingsChange({
                    shortcut: { ...shortcut, commandOrControl: $event }
                  })
                "
              >
              </v-checkbox>
            </v-col>
            <v-col cols="12" sm="3">
              <v-checkbox
                hide-details
                label="Alt"
                :input-value="shortcut.alt"
                @change="
                  onClipboardSettingsChange({
                    shortcut: { ...shortcut, alt: $event }
                  })
                "
              >
              </v-checkbox>
            </v-col>
            <v-col cols="12" sm="3">
              <v-checkbox
                hide-details
                label="Shift"
                :input-value="shortcut.shift"
                @change="
                  onClipboardSettingsChange({
                    shortcut: { ...shortcut, shift: $event }
                  })
                "
              >
              </v-checkbox>
            </v-col>
            <v-col cols="12" sm="3">
              <v-select
                dense
                hide-details
                :items="keys"
                :value="shortcut.key"
                @change="
                  onClipboardSettingsChange({
                    shortcut: { ...shortcut, key: $event }
                  })
                "
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-switch
                hide-details
                :label="__('settings.pasteAfterCopy')"
                :input-value="settings.pasteAfterCopy"
                @change="onClipboardSettingsChange({ pasteAfterCopy: $event })"
              >
              </v-switch>
              <span v-if="platform === 'darwin'" class="text-caption">
                ({{ __('settings.pasteAfterCopyComment') }})
              </span>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                :label="__('settings.pasteAfterCopyTimeout')"
                :min="rules.pasteAfterCopyTimeout.min"
                :max="rules.pasteAfterCopyTimeout.max"
                :rules="[rules.pasteAfterCopyTimeout.rule]"
                :suffix="__('settings.milliseconds')"
                type="number"
                :value="
                  rules.pasteAfterCopyTimeout.value(
                    settings.pasteAfterCopyTimeout
                  )
                "
                @change="
                  onClipboardSettingsChange({ pasteAfterCopyTimeout: +$event })
                "
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                :label="__('settings.commandAfterCopy')"
                :value="settings.commandAfterCopy"
                @change="
                  onClipboardSettingsChange({ commandAfterCopy: $event })
                "
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                :label="__('settings.commandAfterCopyTimeout')"
                :min="rules.commandAfterCopyTimeout.min"
                :max="rules.commandAfterCopyTimeout.max"
                :rules="[rules.commandAfterCopyTimeout.rule]"
                :suffix="__('settings.milliseconds')"
                type="number"
                :value="
                  rules.commandAfterCopyTimeout.value(
                    settings.commandAfterCopyTimeout
                  )
                "
                @change="
                  onClipboardSettingsChange({
                    commandAfterCopyTimeout: +$event
                  })
                "
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                :label="__('settings.closeAfterCopy')"
                :input-value="settings.closeAfterCopy"
                @change="onClipboardSettingsChange({ closeAfterCopy: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                :label="__('settings.showNearCursor')"
                :input-value="settings.showNearCursor"
                @change="onClipboardSettingsChange({ showNearCursor: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                :label="__('settings.showFrame')"
                :input-value="settings.showFrame"
                @change="onClipboardSettingsChange({ showFrame: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                v-if="platform === 'darwin'"
                hide-details
                :label="__('settings.showDockIcon')"
                :input-value="settings.showDockIcon"
                @change="onClipboardSettingsChange({ showDockIcon: $event })"
              >
              </v-switch>
              <v-switch
                v-else
                hide-details
                :label="__('settings.showTaskbarIcon')"
                :input-value="settings.showTaskbarIcon"
                @change="onClipboardSettingsChange({ showTaskbarIcon: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                :label="__('settings.darkTheme')"
                :input-value="settings.darkTheme"
                @change="onClipboardSettingsChange({ darkTheme: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col>
              <v-expansion-panels flat>
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    {{ __('settings.blockList') }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-combobox
                      :value="settings.blockList || []"
                      :append-icon="null"
                      hide-details
                      label="Block list"
                      multiple
                      outlined
                      @input="onClipboardSettingsChange({ blockList: $event })"
                    >
                      <template
                        v-slot:selection="{ attrs, item, parent, selected }"
                      >
                        <v-chip
                          v-bind="attrs"
                          color="secondary"
                          :input-value="selected"
                          label
                          small
                        >
                          <span class="pr-2">
                            {{ item }}
                          </span>
                          <v-icon small @click="parent.selectItem(item)">
                            $delete
                          </v-icon>
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Settings } from '@/types/settings';
import { loadDictionary, translate as __ } from '@/util/i18n';
import rules from '@/util/rules';
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'ClipboardSettings',

  props: {
    locale: { type: String, required: true },
    platform: { type: String, required: true },
    settings: { type: Object as PropType<Settings>, required: true }
  },

  computed: {
    __() {
      loadDictionary(this.locale);
      return __;
    },
    rules() {
      return rules;
    },
    shortcut() {
      return this.settings.shortcut || {};
    },
    keys() {
      const letters: string[] = [''];
      for (let i = 0; i < 26; i++) {
        letters.push(String.fromCharCode(65 + i));
      }
      return letters;
    }
  },

  methods: {
    onClipboardSettingsChange(setting: Settings) {
      this.$emit('clipboard-settings-change', { ...this.settings, ...setting });
    }
  }
});
</script>

<style scoped lang="scss">
.container {
  max-width: 900px;
}
.v-input--selection-controls {
  margin-top: 0;
}
.v-expansion-panel-header {
  padding: 0;
}
.v-expansion-panel-content {
  ::v-deep .v-expansion-panel-content__wrap {
    padding: 0;
  }
}
.theme--light.v-expansion-panels .v-expansion-panel {
  color: rgba(0, 0, 0, 0.6);
}
.theme--dark.v-expansion-panels .v-expansion-panel {
  color: rgba(255, 255, 255, 0.7);
}
</style>
