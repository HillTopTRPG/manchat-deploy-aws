<script setup lang='ts'>
import UserIcon from '@/pages/Room/Components/UserIcon.vue'
import {User, userTypeSelection} from "@/views/graphql/schema";

defineProps<{
  user: User
  hideTitle: boolean | null
}>()

const emits = defineEmits<{
  (e: 'select'): void
}>()
</script>

<template>
  <v-tooltip transition='scale-transition' v-if='user'>
    <template #activator='{ props }'>
      <v-list-item
        class='py-2 px-1'
        :value='user.id'
        color='primary'
        variant='elevated'
        v-bind='props'
        @click='emits("select")'
        @keydown.enter.stop='evt => evt.target.click()'
      >
        <template #prepend>
          <user-icon :user='user' />
        </template>
        <transition name='fade'>
          <v-list-item-title class='pl-7' v-if='!hideTitle'>{{ user.name }}</v-list-item-title>
        </transition>
      </v-list-item>
    </template>
    <v-card class='font-weight-bold' variant='flat'>
      <v-card-title>{{ user.name }}</v-card-title>
      <v-card-text>{{ userTypeSelection.find(s => s.value === user.type)?.title }}
      </v-card-text>
    </v-card>
  </v-tooltip>
</template>
