<template>
  <v-container>
    <v-card flat>
      <v-card-text>
        <v-container>
          <v-row>
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
          <v-row>
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
          <v-row>
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
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                label="Interval to monitor the clipboard"
                min="1"
                type="number"
                suffix="Seconds"
                :value="settings.monitorInterval || 2"
                @change="onClipboardSettingsChange({ monitorInterval: $event })"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                label="Interval to clear the clipboard"
                min="10"
                type="number"
                suffix="Seconds"
                :value="settings.clearInterval || 60"
                @change="onClipboardSettingsChange({ clearInterval: $event })"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-divider class="my-2"></v-divider>
        <v-container>
          <v-row>
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
          <v-row>
            <v-col cols="12">
              <v-text-field
                hide-details
                label="Command after copying"
                placeholder=""
                :value="settings.command"
                @change="onClipboardSettingsChange({ command: $event })"
              >
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                hide-details
                label="Wait time before executing the command"
                min="0"
                max="10000"
                type="number"
                suffix="Milliseconds"
                :value="settings.commandTimeout || 200"
                @change="onClipboardSettingsChange({ commandTimeout: $event })"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Settings } from '@/types/settings';
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'ClipboardSettings',

  props: {
    settings: { type: Object as PropType<Settings>, required: true }
  },

  computed: {
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
