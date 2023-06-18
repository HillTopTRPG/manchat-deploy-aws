<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { Nav } from '~/pages/AccountHelper'
import { User } from '~/data/user'

const props = defineProps<{
  room_uuid: string
  user_uuid?: string
  user_name?: string
  user_password?: string
  nav1?: string | 'room-info'
  nav2: Nav
  users: User[]
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

const notificationEnabled = async () => {
  if (!window.Notification) {
    return false
  }
  if (Notification.permission === 'granted') {
    return true
  }
  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission()
    return result === 'granted'
  }
  return false
}

const banNotifyDesktop  = ref(false)
const banNotifyAllSound = ref(false)
const notifyChatSound   = ref(false)
watch(banNotifyDesktop, (value) => {
  !value && notificationEnabled()
})

const testDesktopNotify = async () => {
  if (banNotifyDesktop.value || !await notificationEnabled()) {
    return
  }
  const time = Date.now().toLocaleString()
  const n    = new Notification('Hello World' + time, {
    icon: 'https://quoridorn.com/img/mascot/normal/mascot_normal.png',
    body: 'ここはぼでぃ',
  })
  n.addEventListener('click', () => {
    console.log('クリックされたぜ！！！！！')
  })
}

const testAudio = () => {
  const audio = new Audio('/button45.mp3')
  audio.play()
}

const testAudio2 = () => {
  const audio = new Audio('/button58.mp3')
  audio.play()
}

const defaults = {
  VSwitch  : {
    class      : 'mouse-event-none',
    readonly   : true,
    hideDetails: true,
    inset      : true,
    color      : 'primary',
    trueIcon   : 'mdi-check',
    falseIcon  : 'mdi-close',
  },
  VBtn     : {
    class  : 'ml-2',
    size   : 'x-small',
    variant: 'text',
  },
  VListItem: {
    variant: 'text',
  },
}
</script>

<template>
  <v-overlay
    class='nav-contents overflow-auto'
    :contained='true'
    :model-value='nav2 === "notification"'
  >
    <v-list :nav='true' bg-color='transparent'>
      <v-defaults-provider :defaults='defaults'>
        <v-list-subheader>デスクトップ通知</v-list-subheader>
        <v-list-item @click='banNotifyDesktop = !banNotifyDesktop'>
          <template #append>
            <v-switch :model-value='banNotifyDesktop' @click.self.prevent />
          </template>
          <v-list-item-title>デスクトップ通知をすべて無効にする
            <v-btn icon='mdi-bell' v-show='!banNotifyDesktop' @click.stop='testDesktopNotify()' />
          </v-list-item-title>
        </v-list-item>

        <v-list-subheader>サウンド</v-list-subheader>
        <v-list-item @click='banNotifyAllSound = !banNotifyAllSound'>
          <template #append>
            <v-switch :model-value='banNotifyAllSound' @click.self.prevent />
          </template>
          <v-list-item-title>通知音をすべて無効にする</v-list-item-title>
        </v-list-item>
        <v-list-item @click='notifyChatSound = !notifyChatSound'>
          <template #append>
            <v-switch :model-value='notifyChatSound' @click.self.prevent />
          </template>
          チャット
          <v-btn @click='testAudio()' icon='mdi-volume-source' @click.stop />
        </v-list-item>
        <v-list-item @click='notifyChatSound = !notifyChatSound'>
          <template #append>
            <v-switch :model-value='notifyChatSound' @click.self.prevent />
          </template>
          チャット2
          <v-btn @click='testAudio2()' icon='mdi-volume-source' @click.stop />
        </v-list-item>
      </v-defaults-provider>
    </v-list>
    <v-container class='d-flex align-center justify-center'>
      <v-btn icon='mdi-close' size='small' variant='tonal' @click='emits("close")'></v-btn>
    </v-container>
  </v-overlay>
</template>

<!--suppress CssUnusedSymbol, HtmlUnknownAttribute -->
<style deep lang='css'>
.v-switch.mouse-event-none {
  pointer-events: none;
}
</style>
