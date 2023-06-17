<template>
  <logo-component color="#333333" height="50vh" class="mt-8" />
  <p class="text-h2 text-center my-5">Waddlefy</p>
  <p class="text-h5 text-center">オンラインセッション補助ツール</p>
  <v-sheet class="align-center ma-4 text-center">
    <v-chip
      class="text-h5 pa-8 ma-4 btn-chip"
      color="primary"
      variant="outlined"
      @click="toCreateRoom()"
    >始める</v-chip>
  </v-sheet>
</template>

<script lang="ts" setup>
import LogoComponent from '@/components/LogoComponent.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function toCreateRoom() {
  router.push({ name: 'Use' })
}
</script>
