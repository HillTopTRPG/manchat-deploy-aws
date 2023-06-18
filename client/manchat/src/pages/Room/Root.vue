<script setup lang='ts'>
import Main from '~/pages/Room/Main.vue'
import { Nav } from '~/pages/AccountHelper'

defineProps<{
  room_uuid: string
  user_uuid?: string
  user_name?: string
  user_password?: string
  nav1?: string | 'room-info' | undefined
  nav2?: Nav | undefined
  rail?: string
}>()
</script>

<template>
  <Main
    :room_uuid='room_uuid'
    :user_uuid='user_uuid'
    :user_name='user_name'
    :user_password='user_password'
    :nav1='nav1'
    :nav2='nav2'
    :rail='rail'
  />
</template>
