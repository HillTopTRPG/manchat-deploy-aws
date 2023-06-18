<script lang='ts'>
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({})
//noinspection JSUnusedGlobalSymbols
export const componentInfo = {
  name : 'DefaultPane',
  label: '初期画面',
}
</script>

<script setup lang='ts'>
import { Layout } from '@/components/panes'
import { componentMap } from '../index'
import layouts from '@/pages/PaneLayoutTemplate'

const props = defineProps<{
  layout: Layout
  rootLayout: Layout
}>()

const isEqualLayout = (layout: Layout): boolean => {
  const replaceFunc = (str: string) => str
    .replace(/"uuid": ?".+?"/g, '')
    .replace(/"payload": ?[^,}]+/g, '')
    .replace(/"size": ?[^,}]+/g, '')
  return replaceFunc(JSON.stringify(layout)) === replaceFunc(JSON.stringify(props.rootLayout))
}

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()
</script>

<template>
  <div class='root bg-grey-darken-2 fill-height'>
    <h3 class='mx-5 mt-5'>空のペイン</h3>
    <p class='mx-5'>
      ペインはツールを１つ選んで表示できます。<br>
      メニューバーの
      <v-icon icon='mdi-pencil-ruler' />
      でペイン編集モードを切り替えることでペインを追加したり、後から表示するツールを変更できます。
    </p>
    <p class='mx-5 mt-5'>表示するツールを選ぶ</p>
    <v-list density='compact' class='mx-5 mb-5' open-strategy='multiple'>
      <template
        v-for='g in componentMap'
        :key='g.group'
      >
        <v-list-group v-if='g.group'>
          <template #activator='{ props }'>
            <v-list-item v-bind='props' :title='g.group' @keydown.enter.stop='evt => evt.target.click()' />
          </template>

          <v-list-item
            v-for='n in Object.keys(g.items)'
            :title='n'
            :value='n'
            @click='emits("change-component", g.group, n)'
            @keydown.enter.stop='evt => evt.target.click()'
          />
        </v-list-group>
        <template v-else>
          <v-list-item
            v-for='n in Object.keys(g.items).filter(m => m !== "初期画面")'
            :title='n'
            :value='n'
            @click='emits("change-component", g.group, n)'
            @keydown.enter.stop='evt => evt.target.click()'
          />
        </template>
      </template>
    </v-list>
    <p class='mx-5 mt-5'>または...</p>
    <p class='mx-5 mt-5'>構成済みレイアウトのプリセットを選ぶ</p>
    <v-list density='compact' class='mx-5 mb-5' open-strategy='multiple'>
      <template v-for='l in layouts' :key='l.title'>
        <v-list-item
          @click='emits("change-layout", l.layout)'
          v-if='!isEqualLayout(l.layout)'
          @keydown.enter.stop='evt => evt.target.click()'
        >{{ l.title }}
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<!--suppress HtmlUnknownAttribute -->
<style deep lang='css'>
.v-card.chat-input-container {
  border-radius: 0;
  background: transparent !important;
}

.chat-input .v-input__control textarea,
.chat-input .v-input__control {
  height: 100%;
  width: 100%;
  position: absolute;
}
</style>
