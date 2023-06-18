<script setup lang='ts'>
import { computed, ref } from 'vue'
import Avatar from 'vue-boring-avatars'
import {User} from "@/views/graphql/schema"

const props = defineProps<{
  user?: User
}>()

const avatar = ref<any>()

const icon = computed(() => {
  switch (props.user?.type) {
    case 'master':
      return 'mdi-crown'
    case 'visitor':
      return 'mdi-eye'
    default:
      return 'empty'
  }
})

const colors = ['#92a1c6', '#146a7c', '#f0ab3d', '#c271b4', '#c20d90']
</script>

<template>
  <v-badge
    class='absolute-color'
    :class='user?.type'
    location='right top'
    :icon='icon'
    color='white'
  >
    <Avatar variant='beam' :size='40' :name='user?.id' :colors='colors' ref='avatar' />
  </v-badge>
</template>

<!--suppress CssUnusedSymbol, HtmlUnknownAttribute, CssUnresolvedCustomProperty -->
<style deep lang='css'>
.v-badge__badge {
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-badge__badge::after {
  transform: none !important;
}

.v-badge.player > .v-badge__wrapper > .v-badge__badge {
  visibility: hidden;
}

.v-badge.absolute-color > .v-badge__wrapper > .v-badge__badge {
  background: rgb(var(--v-code-background-color)) !important;
  box-sizing: border-box;
}

.v-badge.absolute-color > .v-badge__wrapper > .v-badge__badge::after {
  color: rgb(var(--v-theme-surface)) !important;
}
</style>
