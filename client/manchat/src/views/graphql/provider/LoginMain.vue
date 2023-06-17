<template>
  <template v-if="!graphQlStore.state.userToken">
    <v-main>
      <login-selection-component
        v-if="!graphQlStore.state.roomToken"
        property="rooms"
        name="部屋名"
        add-button="部屋を作る"
        add-type="add-room"
        :total-column="3"
        v-model="operation"
      >
        <template v-slot:header>
          <th class="text-left" style="width: 8em;">作成日</th>
        </template>
        <template v-slot:body="props">
          <td>{{ formatDate((props.data as any).createdAt) }}</td>
        </template>
      </login-selection-component>
      <login-selection-component
        v-else-if="!graphQlStore.state.userToken"
        property="users"
        name="ユーザー名"
        add-button="ユーザーを作る"
        add-type="sign-up"
        :total-column="3"
        v-model="operation"
      >
        <template v-slot:header>
          <th class="text-left" style="width: 8em;">最終ログイン</th>
        </template>
        <template v-slot:body="props">
          <td>{{ formatDate((props.data as any).lastLoggedIn) }}</td>
        </template>
      </login-selection-component>
    </v-main>

    <v-navigation-drawer
      :model-value="true"
      :temporary="true"
      :permanent="true"
      :floating="false"
      :scrim="false"
      :disable-resize-watcher="true"
      location="right"
      width="300"
    >
      <entry-component
        v-if="!graphQlStore.state.roomToken"
        name="部屋"
        entry-button="入室する"
        :selected-object="selectedRoom"
        :selectable="Boolean(graphQlStore.state.rooms.length)"
        add-type="add-room"
        v-model="operation"
        @add="graphQlStore.addRoom"
        @entry="graphQlStore.entryRoom"
      >
        <v-card-subtitle class="mb-2">ユーザー数：{{ (selectedRoom as Room)?.users.length }}人</v-card-subtitle>
      </entry-component>
      <entry-component
        v-else-if="!graphQlStore.state.userToken"
        name="ユーザー"
        entry-button="サインイン"
        :selected-object="selectedUser"
        :selectable="Boolean(graphQlStore.state.users.length)"
        add-type="sign-up"
        v-model="operation"
        @add="graphQlStore.signUp"
        @entry="graphQlStore.signIn"
      />
    </v-navigation-drawer>

    <v-app-bar :flat="true" :height="85">
      <v-app-bar-title class="mt-5">
        <v-timeline class="stepper" direction="horizontal" side="start" density="comfortable">
          <v-timeline-item
            icon-color="white"
            :dot-color="graphQlStore.state.roomToken ? 'grey-lighten-1' : 'primary'"
            :line-inset="graphQlStore.state.roomToken ? 0 : 5"
            :size="graphQlStore.state.roomToken ? 'default' : 40"
            :fill-dot="!graphQlStore.state.roomToken"
            :density="graphQlStore.state.roomToken ? 'compact' : 'default'"
          >
            <template v-slot:icon>1</template>
            <div class="text-h6">部屋に入る</div>
          </v-timeline-item>

          <v-timeline-item
            icon-color="white"
            :dot-color="graphQlStore.state.roomToken ? 'primary' : 'grey-lighten-1'"
            :line-inset="graphQlStore.state.roomToken ? 5 : 0"
            :size="graphQlStore.state.roomToken ? 40 : 'default'"
            :fill-dot="Boolean(graphQlStore.state.roomToken)"
            :density="graphQlStore.state.roomToken ? 'default' : 'compact'"
          >
            <template v-slot:icon>2</template>
            <div class="text-h6">ユーザーログイン</div>
          </v-timeline-item>
        </v-timeline>
      </v-app-bar-title>
    </v-app-bar>
  </template>
</template>

<script lang="ts" setup>
import {inject, ref, computed} from 'vue'
import { GraphQlKey, GraphQlStore } from '@/views/graphql/graphql'
import {format, isToday} from 'date-fns'
import LoginSelectionComponent from '@/components/entry/LoginSelectionComponent.vue'
import EntryComponent from '@/components/entry/EntryComponent.vue'
import {Room, User} from "@/views/graphql/schema";

const operation = ref<string | null>(null)

const graphQlStore = inject<GraphQlStore>(GraphQlKey)

const selectedRoom = computed<Room>(() => graphQlStore.state.rooms.find(r => r.id === operation.value))
const selectedUser = computed<User>(() => graphQlStore.state.users.find(u => u.id === operation.value))

function formatDate(unixTime: number) {
  const date = new Date(unixTime * 1000)
  let formatStr: string
  if (isToday(date)) {
    formatStr = 'HH:mm:ss'
  } else {
    formatStr = 'yyyy/MM/dd'
  }
  return format(date, formatStr)
}
</script>

<style lang="scss" scoped>
::v-deep(.v-timeline-item__body) {
  padding-block-end: 5px !important;
}
</style>
