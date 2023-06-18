<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'Sample2',
  label: 'サンプルペイン2',
}
</script>

<script setup lang='ts'>
import { ref } from 'vue'

const textValue = ref('')
</script>

<template>
  <v-card
    width='375'
    class='mx-auto'
    height='400'
    min-height='400'
  >
    <v-text-field v-model='textValue' placeholder='sample' />
  </v-card>
</template>
