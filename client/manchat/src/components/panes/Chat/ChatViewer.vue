<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'ChatViewer',
  label: 'チャットビューアー',
}
</script>

<script setup lang='ts'>
import { computed, reactive, ref, watch } from 'vue'
import { Layout } from '@/components/panes'
import ChatViewerItem from '@/components/panes/Chat/ChatViewerItem.vue'

import {inject} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/views/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()
const chats = computed(() => graphQlStore.state.chats)

const unreadChatList     = reactive<string[]>([])
const unreadChatListLate = reactive<string[]>([])

const list = ref()
watch(() => chats.value.length, (after, before) => {
  if (before < after) {
    const elm = list.value.$el
    setTimeout(() => elm.scrollTo(0, elm.scrollHeight))
  }
})
watch(() => chats.value.length, (after, before) => {
  if (before > 0 && before < after) {
    unreadChatList.splice(-1, 0, chats.value[chats.value.length - 1].id)
    unreadChatListLate.splice(-1, 0, chats.value[chats.value.length - 1].id)
  }
})

const isScrolling                     = ref(false)
let isScrollingTimeout: number | null = null

const onScroll = (evt: { target: HTMLElement }) => {
  isScrolling.value = true
  if (isScrollingTimeout !== null) {
    clearTimeout(isScrollingTimeout)
  }
  isScrollingTimeout = window.setTimeout(() => {
    isScrolling.value = false
  }, 100)

  evt.target.dispatchEvent(new MouseEvent('move', {
    screenX: 0,
    screenY: 0,
    bubbles: false,
  }))
}

const viewedChatItem = (uuid: string) => {
  const idx = unreadChatList.indexOf(uuid)
  if (idx < 0) {
    return
  }
  unreadChatList.splice(idx, 1)
  setTimeout(() => unreadChatListLate.splice(unreadChatListLate.indexOf(uuid), 1), 3000)
}
</script>

<template>
  <v-list class='chat-viewer scroll h-100' :class='{ isScrolling }' ref='list' @scroll='onScroll'>
    <DynamicScroller :items='chats' key-field='uuid' :min-item-size='57' :page-mode='true'>
      <template v-slot='{ item, index, active }'>
        <ChatViewerItem
          :item='item'
          :index='index'
          :active='active'
          @viewed='viewedChatItem'
          :is-new-read='unreadChatListLate.some(uc => uc === item.uuid)'
        />
      </template>
    </DynamicScroller>
  </v-list>
</template>

<!--suppress HtmlUnknownAttribute -->
<style lang='css' deep>
.chat-viewer .v-list-item__prepend,
.chat-viewer .v-list-item__append {
  align-self: flex-start;
}

.chat-viewer .v-list-item.hover {
  background: rgb(var(--v-theme-on-surface-variant));
}

.chat-viewer-menu .v-overlay__content {
  pointer-events: none !important;
}

.chat-viewer-menu .v-overlay__content > * {
  align-self: flex-end;
  pointer-events: auto !important;
  height: 30px !important;
  transform: translateY(50%);
}

.chat-viewer-menu .v-overlay__content .v-btn {
  background: rgb(var(--v-theme-on-surface-variant)) !important;
}

.chat-viewer-menu .v-overlay__content .v-btn--icon {
  width: calc(var(--v-btn-height) + 4px) !important;
  height: calc(var(--v-btn-height) + 4px) !important;;
}

.v-tab {
  min-width: 65px !important;
  color: rgb(var(--v-theme-on-surface));
}
</style>
