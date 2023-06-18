<template>
  <graph-ql-provider
    :connectionId="connectionId"
    :roomToken="roomToken"
    :userToken="userToken"
  >
    <login-main />
    <play-main rail="1" />
  </graph-ql-provider>
</template>

<script lang="ts" setup>
import GraphQlProvider from '@/views/graphql/provider/index.vue'
import LoginMain from '@/views/graphql/provider/LoginMain.vue'
import PlayMain from "@/views/graphql/provider/PlayMain.vue";

defineProps<{
  connectionId?: String,
  roomToken?: String,
  userToken?: String,
}>()
</script>
