<template>
  <template v-if="graphQlStore.state.userToken">
    <v-layout :class="rootClass">
      <v-app-bar prominent elevation='1' density='compact' :collapse='collapse'>
        <v-app-bar-nav-icon
          variant='text' @click.stop='drawerRail = !drawerRail'
          :icon='drawerRail ? "mdi-menu" : "mdi-backburger"'
        ></v-app-bar-nav-icon>
        <v-toolbar-title>
          <v-breadcrumbs :items='breadcrumbsItems' v-if='room'>
            <template #divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>
        </v-toolbar-title>
        <v-spacer v-if='collapse' />
        <v-tooltip class='room-main'>
          <template #activator='{ props }'>
            <v-btn
              variant='text'
              :icon='collapse ? "mdi-arrow-expand-right" : "mdi-arrow-collapse-left"'
              @click='collapse = !collapse'
              v-bind='props'
            ></v-btn>
          </template>
          メニューバーを{{ collapse ? "広げる" : "閉じる" }}
        </v-tooltip>
        <v-tooltip class='room-main'>
          <template #activator='{ props }'>
            <v-btn
              variant='text'
              class='split-edit-btn'
              style='box-sizing: border-box'
              :class='{ active: showBar}'
              v-bind='props'
              icon='mdi-pencil-ruler'
              @click='showBar = !showBar'
            ></v-btn>
          </template>
          ペインの編集
        </v-tooltip>
        <v-tooltip class='room-main'>
          <template #activator='{ props }'>
            <v-btn
              variant='text'
              icon='mdi-brightness-6'
              v-bind='props'
              v-if='!(drawerRail && collapse)'
            ></v-btn>
          </template>
          テーマの切り替え
        </v-tooltip>
      </v-app-bar>

      <v-navigation-drawer :rail='drawerRail' rail-width='70' :permanent='true' v-if="graphQlStore.state.ready">
        <v-list
          :nav='true'
          :mandatory='true'
        >
          <user-nav-item
            label='部屋'
            :show-label='!drawerRail'
            value='room-info'
            append-icon='home'
            tooltip-text='部屋'
            :big-icon='true'
          />
          <user-list-item :user='user' :hide-title='drawerRail' />
          <v-divider class='my-2' />

          <template v-for='user in users' :key='user.id'>
            <user-list-item
              :user='user'
              :hide-title='drawerRail'
              v-if='user.id !== user_uuid'
            />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-navigation-drawer
        :rail='drawerRail'
        rail-width='54'
        :permanent='true'
      >
        <v-list
          :nav='true'
          density='compact'
        >
          <user-nav-item
            label='基本情報'
            :show-label='!drawerRail'
            value='room-basic'
            prepend-icon='cog'
            tooltip-text='部屋の基本情報を表示・編集します。'
          />
          <user-nav-item
            label='プロフィール'
            :show-label='!drawerRail'
            value='profile'
            prepend-icon='badge-account'
            tooltip-text='プロフィールを表示・編集します。'
          />
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <split-panes-layer :layout="layout" :root-layout="layout" :show-bar="showBar" />
      </v-main>
    </v-layout>
  </template>
</template>

<script lang="ts" setup>
import {reactive, watch} from 'vue'
import { Layout } from '@/components/panes'
import 'splitpanes/dist/splitpanes.css'
import defaultLayout from '@/pages/PaneLayoutTemplate/DefaultLayout'
let layout = reactive<Layout>({ ...JSON.parse(JSON.stringify(defaultLayout)) })

console.log(JSON.stringify(layout, null, 2))

const props = defineProps<{
  rail: string
}>()

import {inject, ref, computed} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/views/graphql/graphql'
import SplitPanesLayer from "@/components/SplitPanesLayer.vue";
import UserNavItem from "@/pages/Room/Components/UserNavItem.vue";
import UserListItem from "@/pages/Room/Components/UserListItem.vue";
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const drawerRail = ref<boolean | null>(parseInt(props.rail || '0') > 0)

const collapse  = ref(false)
const showBar   = ref(false)
const rootClass = computed(() => {
  const result = ['room']
  if (collapse.value) {
    result.push('toolbar-collapse')
  }
  if (drawerRail.value) {
    result.push('drawer-rail')
  }
  return result
})

const users = computed(() => graphQlStore.state.users)
const user_uuid = computed(() => graphQlStore.state.userId)
const room = computed(() => graphQlStore.state.rooms.find(r => r.id === graphQlStore.state.roomId))
const user = computed(() => graphQlStore.state.users.find(u => u.id === graphQlStore.state.userId))

const breadcrumbsItems = computed(() => {
  return [
    [
      {
        title   : `#${room.value?.id} ${room.value?.name}`,
        disabled: false,
        href    : '',
      },
    ], user.value ? [
      {
        title   : user.value.name,
        disabled: false,
        href    : '',
      },
    ] : []
  ].flatMap(a => a)
})
</script>

<style lang="scss" deep>
.splitpanes--vertical > .splitpanes__splitter {
  min-width: 7px;
  background: linear-gradient(90deg, #cccccc, #111111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 7px;
  background: linear-gradient(#cccccc, #111111);
}

.toolbar-collapse .v-main {
  padding-top: 0 !important;
}
</style>
