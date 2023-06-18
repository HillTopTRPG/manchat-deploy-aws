<script setup lang='ts'>
import { computed } from 'vue'

const props = defineProps<{
  label: string
  tooltipText: string
  appendIcon?: string
  prependIcon?: string
  value: string
  showLabel: boolean
  listItemStyle?: string
  bigIcon?: boolean
}>()

const emits = defineEmits<{
  (e: 'select'): void
}>()

const iconSize  = computed(() => props.bigIcon ? 'default' : 'small')
const iconClass = computed(() => props.bigIcon ? 'ma-2' : 'mr-2')
</script>

<template>
  <v-tooltip transition='scale-transition'>
    <template #activator='{ props }'>
      <v-list-item
        :class='{ "hide-contents": !showLabel }'
        variant='elevated'
        color='primary'
        :value='value'
        v-bind='props'
        @click='emits("select")'
        @keydown.enter.stop='evt => evt.target.click()'
        :style='listItemStyle'
      >
        <template #append>
          <v-icon :size='iconSize' :class='iconClass' v-if='appendIcon'>mdi-{{ appendIcon }}</v-icon>
        </template>
        <template #prepend>
          <v-icon :size='iconSize' :class='iconClass' v-if='prependIcon'>mdi-{{ prependIcon }}</v-icon>
        </template>
        <transition name='fade'>
          <v-list-item-title class='pl-7' v-if='showLabel'>{{ label }}</v-list-item-title>
        </transition>
      </v-list-item>
    </template>
    <span class='font-weight-bold'>{{ tooltipText }}</span>
  </v-tooltip>
</template>

<!--suppress CssUnusedSymbol, HtmlUnknownAttribute -->
<style deep lang='css'>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hide-contents .v-list-item__content {
  display: none;
}
</style>
