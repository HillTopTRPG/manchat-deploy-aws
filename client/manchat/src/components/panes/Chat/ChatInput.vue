<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'ChatInput',
  label: 'チャット入力欄',
}
</script>

<script setup lang='ts'>
import { ref } from 'vue'
import { Layout } from '@/components/panes'
import {inject} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/views/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const raw      = ref('')
const sendChat = (e: { target: HTMLTextAreaElement, shiftKey: boolean }) => {
  if (e.shiftKey) {
    raw.value += '\n'
    return
  }
  if (!raw.value) {
    return e.target.blur()
  }

  graphQlStore.sendChat({raw: raw.value})
  raw.value = ''
}

const textarea      = ref<any>()
const focusTextArea = () => textarea.value.$el.getElementsByTagName('textarea')[0]?.focus()
defineExpose({
               globalKeyDown: (event: KeyboardEvent) => event.key === 'Enter' && setTimeout(focusTextArea),
             })
</script>

<template>
  <v-card class='chat-input-container w-100 h-100'>
    <v-textarea
      class='chat-input w-100 h-100'
      v-model='raw'
      @keydown.enter.prevent.stop='sendChat'
      @keydown.stop
      @keydown.esc.stop='evt => evt.target.blur()'
      :hide-details='true'
      label='チャット入力欄'
      :no-resize='true'
      ref='textarea'
    ></v-textarea>
  </v-card>
</template>

<!--suppress HtmlUnknownAttribute -->
<style deep lang='css'>
.v-card.chat-input-container {
  border-radius: 0;
  background: transparent !important;
}

.chat-input .v-input__control textarea,
.chat-input .v-input__control {
  height: 100%;
  width: 100%;
  position: absolute;
}
</style>
