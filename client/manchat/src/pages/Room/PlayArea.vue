<script setup lang='ts'>
import { Nav } from '~/pages/AccountHelper'
import { User } from '~/data/user'
import SplitPanesLayer from '~/components/SplitPanesLayer.vue'
import { Room } from '~/data/room'
import defaultLayout from '~/pages/PaneLayoutTemplate/DefaultLayout'
import provideAll from '~/data/Play'
import ChatOverlay from '~/pages/Room/ChatOverlay.vue'
import { reactive, ref } from 'vue'
import { Layout } from '~/components/panes'
import { uuid } from 'vue-uuid'

const props = defineProps<{
  room_uuid: string
  user_uuid: string
  nav1?: string | 'room-info'
  nav2: Nav
  users: User[]
  room: Room | null
  showBar: boolean
}>()

let layout = reactive<Layout>({ ...JSON.parse(JSON.stringify(defaultLayout)) })

const changeLayout = (newLayout: Layout) => {
  // deep copy & change uuid
  const useLayout: Layout = JSON.parse(JSON.stringify(newLayout).replace(
    /"uuid": ?".+?"/g,
    () => `"uuid":"${uuid.v4()}"`,
  ));
  const keys              = Object.keys(useLayout) as (keyof typeof useLayout)[]
  keys.forEach(key => layout[key] = useLayout[key])
}

provideAll(props)

const splitPanesLayer = ref<typeof SplitPanesLayer>()

defineExpose({ globalKeyDown: (event: KeyboardEvent) => splitPanesLayer.value?.globalKeyDown(event) })
</script>

<template>
  <template v-if='nav2 !== "init"'>
    <split-panes-layer
      v-if='nav2 !== "entrance" && nav2 !== "init"'
      :layout='layout'
      :root-layout='layout'
      :show-bar='showBar'
      @change-layout='changeLayout'
      ref='splitPanesLayer'
    />
    <ChatOverlay />
  </template>
</template>
