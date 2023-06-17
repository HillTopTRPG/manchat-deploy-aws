<template>
  <template v-if="graphQlStore.state.userToken">
    <v-main>
      プレイ画面
    </v-main>
  </template>
</template>

<script lang="ts" setup>
import {inject} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/views/graphql/graphql'

const graphQlStore = inject<GraphQlStore>(GraphQlKey)
</script>

<style lang="scss" scoped>
</style>
