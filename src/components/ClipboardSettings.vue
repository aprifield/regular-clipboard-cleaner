<template>
  <v-container>
    <v-card flat>
      <v-card-text>
        <v-container>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                label="Start the application at login"
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
                label="Maintain the history even after restarting the application"
                :input-value="settings.maintained"
                @change="onClipboardSettingsChange({ maintained: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-switch
                hide-details
                label="Close the history window after copying"
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
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                label="Interval to clear the clipboard"
                :min="rules.clearInterval.min"
                :max="rules.clearInterval.max"
                :rules="[rules.clearInterval.rule]"
                suffix="Seconds"
                type="number"
                :value="settings.clearInterval || rules.clearInterval.init"
                @change="onClipboardSettingsChange({ clearInterval: +$event })"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                :disabled="+settings.maxHistoryCount === 0"
                hide-details
                label="Interval to monitor the clipboard"
                :min="rules.monitorInterval.min"
                :max="rules.monitorInterval.max"
                :rules="[rules.monitorInterval.rule]"
                suffix="Seconds"
                type="number"
                :value="settings.monitorInterval || rules.monitorInterval.init"
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
                label="Number of history to be saved"
                :min="rules.maxHistoryCount.min"
                :max="rules.maxHistoryCount.max"
                :rules="[rules.maxHistoryCount.rule]"
                type="number"
                :value="settings.maxHistoryCount || rules.maxHistoryCount.init"
                @change="
                  onClipboardSettingsChange({ maxHistoryCount: +$event })
                "
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col>Shortcut for displaying the clipboard history</v-col>
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
                label="Paste after copying"
                :input-value="settings.pasteAfterCopy"
                @change="onClipboardSettingsChange({ pasteAfterCopy: $event })"
              >
              </v-switch>
              <span class="text-caption">(Does not work on mac)</span>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                label="Wait time before pasting"
                :min="rules.pasteAfterCopyTimeout.min"
                :max="rules.pasteAfterCopyTimeout.max"
                :rules="[rules.pasteAfterCopyTimeout.rule]"
                suffix="Milliseconds"
                type="number"
                :value="
                  settings.pasteAfterCopyTimeout ||
                    rules.pasteAfterCopyTimeout.init
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
                label="Command after copying"
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
                label="Wait time before executing the command"
                :min="rules.commandAfterCopyTimeout.min"
                :max="rules.commandAfterCopyTimeout.max"
                :rules="[rules.commandAfterCopyTimeout.rule]"
                suffix="Milliseconds"
                type="number"
                :value="
                  settings.commandAfterCopyTimeout ||
                    rules.commandAfterCopyTimeout.init
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
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row align="center">
            <v-col>
              <v-switch
                v-if="platform == 'darwin'"
                hide-details
                label="Hide the icon from the Dock"
                :input-value="settings.hideDockIcon"
                @change="onClipboardSettingsChange({ hideDockIcon: $event })"
              >
              </v-switch>
              <v-switch
                v-else
                hide-details
                label="Hide the icon from the taskbar"
                :input-value="settings.hideTaskbarIcon"
                @change="onClipboardSettingsChange({ hideTaskbarIcon: $event })"
              >
              </v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Settings } from '@/types/settings';
import rules from '@/util/rules';
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'ClipboardSettings',

  props: {
    settings: { type: Object as PropType<Settings>, required: true },
    platform: { type: String, required: true }
  },

  computed: {
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
</style>
