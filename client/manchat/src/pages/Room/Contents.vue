<script setup lang='ts'>
import { Nav } from '~/pages/AccountHelper'
import { User } from '~/data/user'
import NavRoomInfo from '~/pages/Room/NavContents/NavRoomInfo.vue'
import NavProfile from '~/pages/Room/NavContents/NavProfile.vue'
import NavNotification from '~/pages/Room/NavContents/NavNotification.vue'
import { Room } from '~/data/room'
import PlayArea from '~/pages/Room/PlayArea.vue'
import { ref } from 'vue'

const props = defineProps<{
  room_uuid: string
  user_uuid?: string
  nav1?: string | 'room-info'
  nav2: Nav
  users: User[]
  room: Room | null
  showBar: boolean
}>()
const emits = defineEmits<{
  (e: 'requireUserLogin'): void
  (e: 'logoutUser'): void
  (e: 'close-overlay'): void
}>()

const playArea = ref<typeof PlayArea>()
defineExpose({ globalKeyDown: (event: KeyboardEvent) => playArea.value?.globalKeyDown(event) })
</script>

<template>
  <template v-if='nav2 !== "init"'>
    <nav-room-info v-bind='$props' @logout-user='emits("logoutUser")' @close='emits("close-overlay")' />
    <nav-profile v-bind='$props' @require-user-login='emits("requireUserLogin")' @close='emits("close-overlay")' />
    <nav-notification v-bind='$props' @close='emits("close-overlay")' />

    <play-area v-bind='props' v-if='props.user_uuid' ref='playArea' />
  </template>
</template>

<!--suppress HtmlUnknownAttribute -->
<style deep lang='css'>
.v-overlay {
  margin-top: 1px;
}

.v-overlay__scrim {
  background: rgb(var(--v-theme-surface));
  opacity: 94%;
}

.v-overlay.nav-contents .v-overlay__content {
  width: 100%;
  height: 100%;
}
</style>
