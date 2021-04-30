<template>
  <v-layout fill-height>
    <v-container>
      <v-card flat>
        <v-card-text class="subtitle-2 text--primary">
          <v-list>
            <v-list-item>
              <v-switch
                label="Starting the application at login"
                :input-value="settings.startAtLogin"
                @change="onClipboardSettingsChange({ startAtLogin: $event })"
              >
              </v-switch>
            </v-list-item>
            <v-list-item>
              <v-switch
                label="Maintain the history even after restarting the application"
                :input-value="settings.maintained"
                @change="onClipboardSettingsChange({ maintained: $event })"
              >
              </v-switch>
            </v-list-item>
            <v-divider class="pa-2"></v-divider>
            <v-list-item>
              <v-text-field
                label="Interval to monitor the clipboard"
                min="1"
                type="number"
                suffix="Seconds"
                :value="settings.monitorInterval || 2"
                @change="onClipboardSettingsChange({ monitorInterval: $event })"
              >
              </v-text-field>
            </v-list-item>
            <v-list-item>
              <v-text-field
                label="Interval to clear the clipboard"
                min="10"
                type="number"
                suffix="Seconds"
                :value="settings.clearInterval || 60"
                @change="onClipboardSettingsChange({ clearInterval: $event })"
              >
              </v-text-field>
            </v-list-item>
            <v-divider class="pa-2"></v-divider>
            <v-list-item>
              <v-container>
                <v-row>
                  <v-col>Shortcut for displaying the clipboard history</v-col>
                </v-row>
                <v-row>
                  <v-col>
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
                  <v-col>
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
                  <v-col>
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
                  <v-col>
                    <v-select
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
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card> </v-container
  ></v-layout>
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

<style scoped lang="scss"></style>
