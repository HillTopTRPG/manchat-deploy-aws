<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'Sample4',
  label: 'サンプルペイン4',
}
</script>

<script setup lang='ts'>
import { ref } from 'vue'

const textValue = ref('')
</script>

<template>
  <v-text-field v-model='textValue' placeholder='sample4' />
</template>
