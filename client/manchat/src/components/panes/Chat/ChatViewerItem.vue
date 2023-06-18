<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
</script>

<script setup lang='ts'>
import UserAvatar from '@/components/UserAvatar.vue'
import { onMounted, ref, watch } from 'vue'
import {Chat} from "@/views/graphql/schema";

import {inject} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/views/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)


const props = defineProps<{
  item: Chat, index: number, active: boolean, isNewRead: boolean
}>()

const emits = defineEmits<{
  (e: 'viewed', uuid: string): void
}>()

const elm = ref<HTMLElement>()
watch(() => props.item.id, () => {
  emits('viewed', props.item.id)
})
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    const firstEntry = entries[0]
    if (firstEntry.isIntersecting) {
      emits('viewed', props.item.id)
    }
  }, {
                                              root      : document,
                                              threshold : 1,
                                              rootMargin: '0px',
                                            })
  setTimeout(() => observer.observe(elm.value!))
});

const getUser      = (chat: Chat) => graphQlStore.state.users.find(u => u.id === chat.owner)
const isToday      = (date: Date) => {
  const today = new Date()
  return date.getDate() ==
         today.getDate() &&
         date.getMonth() ==
         today.getMonth() &&
         date.getFullYear() ==
         today.getFullYear()
}
const reactionChat = (chat_uuid: string) => {

}
const editChat     = (chat_uuid: string) => {

}
const deleteChat   = (chat_uuid: string) => {
}
</script>

<template>
  <DynamicScrollerItem
    :item='item'
    :active='active'
    :size-dependencies='[ item.raw, ]'
    :data-index='index'
  >
    <v-hover v-slot='{ isHovering, props: hoverProps }'>
      <v-menu
        open-on-hover
        location='top right'
        :transition='false'
        class='chat-viewer-menu'
        open-delay='0'
        close-delay='0'
        v-bind='hoverProps'
      >
        <template v-slot:activator='{ props }'>
          <div v-bind='hoverProps' class='chat-item' :class='{isNewRead}'>
            <v-list-item class='px-1' :class='{ hover: isHovering }' v-bind='props'>
              <template #prepend>
                <user-avatar
                  v-if='getUser(item)'
                  :user='getUser(item)'
                ></user-avatar>
                <v-icon v-else icon='mdi-desktop-classic' class='mx-2 mt-2'></v-icon>
              </template>
              <v-list-item-title class='ml-3'>
                <span class='font-weight-bold mr-2' v-if='getUser(item)?.name'>{{ getUser(item)?.name }}</span>
                <span style='font-size: 70%'>{{
                    isToday(item.createdAt) ? $d(item.createdAt, 'time') : $d(item.createdAt, 'short')
                  }}</span>
              </v-list-item-title>
              <div class='ml-3' style='white-space: pre' ref='elm'>
                {{ item.raw }}
              </div>
            </v-list-item>
          </div>
        </template>

        <div v-bind='hoverProps'>
          <v-defaults-provider :defaults='{ VBtn: { size: "small", variant: "text", rounded: 0 }, VTooltip: { location: "top", origin: "center", transition: "none" } }'>
            <v-tooltip>
              <template #activator='{ props }'>
                <v-btn v-bind='props' @click='reactionChat(item.id)' icon='mdi-heart-plus' />
              </template>
              リアクション
            </v-tooltip>
            <v-tooltip>
              <template #activator='{ props }'>
                <v-btn v-bind='props' @click='editChat(item.id)' icon='mdi-pen' />
              </template>
              編集
            </v-tooltip>
            <v-tooltip>
              <template #activator='{ props }'>
                <v-btn v-bind='props' @click='deleteChat(item.id)' icon='mdi-delete' />
              </template>
              削除
            </v-tooltip>
          </v-defaults-provider>
        </div>
      </v-menu>
    </v-hover>
  </DynamicScrollerItem>
</template>

<!--suppress HtmlUnknownAttribute -->
<style lang='css'>
.chat-item.isNewRead {
  animation: flash 1s linear infinite;
}

@keyframes flash {
  0%,
  100% {
    background: transparent;
  }

  50% {
    background: #0091ea;
  }
}
</style>
