<template>
  <slot />
</template>

<script lang="ts" setup>
import { provide } from 'vue'
import useGraphQl, { GraphQlKey } from '../graphql'

const props = defineProps<{
  connectionId: String,
  roomToken: String,
  userToken: String,
}>()

provide(GraphQlKey, useGraphQl(
  props.connectionId || '',
  props.roomToken || '',
  props.userToken || ''
))
</script>
