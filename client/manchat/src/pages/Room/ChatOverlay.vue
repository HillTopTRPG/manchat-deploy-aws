<script setup lang='ts'>
import { inject, reactive, watch } from 'vue'
import { Chat } from '~/data/RoomCollections/Chat'
import { InjectionKeySymbol as roomCollectionsKey, StoreType as RoomCollectionStore } from '~/data/RoomCollections'

const store = inject(roomCollectionsKey) as RoomCollectionStore
type UnreadChatInfo = { chat: Chat, time: number, top: number, width: number, height: number }
const unreadChatList = reactive<UnreadChatInfo[]>([])

const calcSize = (text: string): { width: number, height: number } => {
  const span                       = document.createElement('span');
  span.style.position              = 'absolute'
  span.style.top                   = '-1000px'
  span.style.left                  = '-1000px'
  span.style.whiteSpace            = 'pre'
  span.innerHTML                   = text
  span.style.fontSize              = '40px'
  span.style.fontWeight            = 'bold'
  span.style.webkitTextStrokeWidth = '1px'
  document.body.appendChild(span)
  const width  = span.offsetWidth
  const height = span.offsetHeight
  span.parentElement!.removeChild(span)
  return {
    width,
    height,
  }
}

watch(() => store.chats.value.length, (after, before) => {
  if (before > 0 && before < after) {
    for (let i = before; i < after; i++) {
      const {
              width,
              height,
            } = calcSize(store.chats.value[i].raw)
      let top = 0
      unreadChatList.filter(c => (
                                   window.innerWidth + c.width - 50
                                 ) *
                                 (
                                   Date.now() - c.time
                                 ) /
                                 8000 <
                                 c.width)
                    .sort((c1, c2) => {
                      if (c1.top === c2.top) {
                        if (c1.height === c2.height) {
                          return 0
                        }
                        return c1.height < c2.height ? -1 : 1
                      } else {
                        return c1.top < c2.top ? -1 : 1
                      }
                    })
                    .reduce((p, c) => {
                      if (p || top + height + 5 < c.top) {
                        return true
                      }
                      top = c.top + c.height + 5
                      return false
                    }, false)

      const chat = store.chats.value[i]
      unreadChatList.push({
                            chat,
                            time: Date.now(),
                            top,
                            width,
                            height,
                          })
      setTimeout(() => {
        unreadChatList.splice(unreadChatList.findIndex(c => c.chat.uuid === chat.uuid), 1)
      }, 8200)
    }
  }
}, { immediate: false })
</script>

<template>
  <v-overlay class='chat-overlay' scroll-strategy='none' :model-value='true'>
    <div v-for='{ chat, top } in unreadChatList' :key='chat.uuid' :style='{ top: `${top}px` }'>{{ chat.raw }}</div>
  </v-overlay>
</template>

<!--suppress HtmlUnknownAttribute, CssUnusedSymbol, CssUnknownProperty -->

<style lang='css'>
.chat-overlay,
.chat-overlay * {
  pointer-events: none;
  background: transparent !important;
}

/*noinspection CssUnresolvedCustomProperty*/
.chat-overlay .v-overlay__content > * {
  pointer-events: none;
  animation: loop 8s 0s linear forwards;
  position: absolute;
  top: 20px;
  font-size: 40px;
  white-space: pre;
  font-weight: bold;
  color: rgb(var(--v-theme-surface-variant));
  text-stroke: 1px rgb(var(--v-theme-on-surface-variant));
  -webkit-text-stroke: 1px rgb(var(--v-theme-on-surface-variant));
}

@keyframes loop {
  0% {
    left: 100vw;
  }
  to {
    left: 0;
    transform: translateX(-100%);
  }
}
</style>
