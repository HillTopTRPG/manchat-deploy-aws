<script setup lang='ts'>
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { ref } from 'vue'
import { uuid } from 'vue-uuid'
import { componentMap, Layout } from './panes'

interface Props {
  layout: Layout
  rootLayout: Layout
  isNest?: boolean
  showBar?: boolean
  componentTarget?: string
}

const emits = defineEmits<{
  (e: 'change-component', componentGroup: string, component: string): void
  (e: 'change-layout', newLayout: Layout): void
}>()

const props = withDefaults(defineProps<Props>(), {
  isNest         : false,
  showBar        : true,
  componentTarget: '',
})

const cLayout = ref(props.layout)

const addChildPane = (idx: number, direction: string | undefined = '') => {
  if (!cLayout.value.panes) {
    return
  }
  const newObj = {
    type          : 'normal',
    uuid          : uuid.v4(),
    panes         : [],
    componentGroup: '',
    component     : '初期画面',
    payload       : null,
    size          : 50,
  }
  const oldObj = {
    type          : cLayout.value.panes[idx].type,
    uuid          : cLayout.value.panes[idx].uuid,
    panes         : [...cLayout.value.panes[idx].panes],
    componentGroup: cLayout.value.panes[idx].componentGroup,
    component     : cLayout.value.panes[idx].component,
    payload       : cLayout.value.panes[idx].payload,
    size          : 50,
  }

  cLayout.value.panes[idx].type = ['up', 'down'].includes(direction) ? 'horizontal' : 'vertical'
  cLayout.value.panes[idx].uuid = uuid.v4()
  cLayout.value.panes[idx].panes.splice(
    0,
    cLayout.value.panes[idx].panes.length,
    ...(
      ['right', 'down'].includes(direction) ? [oldObj, newObj] : [newObj, oldObj]
    ),
  )
  delete cLayout.value.panes[idx].componentGroup
  delete cLayout.value.panes[idx].component
  cLayout.value.panes[idx].payload = null
}

const addBrotherPane = (idx: number, direction: string | undefined = '', toParent: boolean) => {
  const addIdx         = ['right', 'down'].includes(direction) ? 1 : 0
  const addObj: Layout = {
    type          : 'normal',
    uuid          : uuid.v4(),
    panes         : [],
    componentGroup: '',
    component     : '初期画面',
    payload       : null,
  }
  if (toParent) {
    cLayout.value.panes.splice(idx + addIdx, 0, addObj)
    cLayout.value.panes.forEach(p => p.size = 100 / cLayout.value.panes.length)
  } else {
    cLayout.value.panes[idx].panes.splice(addIdx ? cLayout.value.panes[idx].panes.length : 0, 0, addObj)
    cLayout.value.panes[idx].panes.forEach(p => p.size = 100 / cLayout.value.panes[idx].panes.length)
  }
}

const addPane = (event: { target: HTMLElement }) => {
  const btnElm: HTMLElement = event.target.tagName === 'button' ? event.target : event.target.closest('button')!
  const idx                 = parseInt(btnElm.dataset.idx || '0')
  const direction           = btnElm.dataset.direction || ''
  Array.from(document.getElementsByClassName('split-panes-layer'))
    .find((elm: Element) => (
      elm as HTMLElement
    ).dataset.uuid === cLayout.value.panes[idx].uuid)
    ?.classList.remove(`on-hold-${direction}`)

  const sameType   = ['up', 'down'].includes(direction) ? 'horizontal' : 'vertical'
  const isRootPane = cLayout.value.uuid === props.rootLayout.uuid

  if (!isRootPane && cLayout.value.type === sameType) {
    addBrotherPane(idx, direction, true)
  } else {
    if (cLayout.value.panes[idx].type === sameType) {
      addBrotherPane(idx, direction, false)
    } else {
      addChildPane(idx, direction)
    }
  }
}

const showBorderSelf = (event: { target: HTMLElement }) => {
  const btnElm: HTMLElement = event.target.tagName === 'button' ? event.target : event.target.closest('button')!
  const idx                 = parseInt(btnElm.dataset.idx || '0')
  const direction           = btnElm.dataset.direction
  Array.from(document.getElementsByClassName('splitpanes__pane'))
    .find((elm: Element) => (
      elm as HTMLElement
    ).dataset.uuid === cLayout.value.panes[idx].uuid)
    ?.classList.add(direction ? `on-hold-${direction}` : 'on-hold')
}

const hideBorderSelf = (event: { target: HTMLElement }) => {
  const btnElm: HTMLElement = event.target.tagName === 'button' ? event.target : event.target.closest('button')!
  const idx                 = parseInt(btnElm.dataset.idx || '0')
  const direction           = btnElm.dataset.direction
  Array.from(document.getElementsByClassName('splitpanes__pane'))
    .find((elm: Element) => (
      elm as HTMLElement
    ).dataset.uuid === cLayout.value.panes[idx].uuid)
    ?.classList.remove(direction ? `on-hold-${direction}` : 'on-hold')
}

const showBorderChildren = (event: { target: HTMLElement }) => {
  const btnElm: HTMLElement = event.target.tagName === 'button' ? event.target : event.target.closest('button')!
  const idx                 = parseInt(btnElm.dataset.idx || '0')
  Array.from(document.getElementsByClassName('splitpanes__pane'))
    .filter((elm: Element) => cLayout.value.panes[idx].panes.map(p => p.uuid).some(uuid => uuid ===
      (
        elm as HTMLElement
      ).dataset.uuid))
    .forEach(elm => elm.classList.add('on-hold'))
}

const hideBorderChildren = (event: { target: HTMLElement }) => {
  const btnElm: HTMLElement = event.target.tagName === 'button' ? event.target : event.target.closest('button')!
  const idx                 = parseInt(btnElm.dataset.idx || '0')
  Array.from(document.getElementsByClassName('splitpanes__pane'))
    .filter((elm: Element) => cLayout.value.panes[idx].panes.map(p => p.uuid).some(uuid => uuid ===
      (
        elm as HTMLElement
      ).dataset.uuid))
    .forEach(elm => elm.classList.remove('on-hold'))
}

const removePane = (event: { target: HTMLElement }) => {
  hideBorderSelf(event)
  const btnElm: HTMLElement = event.target.tagName === 'button' ? event.target : event.target.closest('button')!
  const idx                 = parseInt(btnElm.dataset.idx || '0')
  if (!cLayout.value.panes) {
    return
  }
  if (cLayout.value.panes.length === 2 && cLayout.value.uuid !== props.rootLayout.uuid) {
    const remain                 = cLayout.value.panes[idx === 0 ? 1 : 0]
    cLayout.value.panes          = remain.panes
    cLayout.value.uuid           = remain.uuid
    cLayout.value.type           = remain.type
    cLayout.value.component      = remain.component
    cLayout.value.componentGroup = remain.componentGroup
  } else {
    cLayout.value.panes.splice(idx, 1)
  }
}

const onResizedPanes = (event: { size: number }[]) => event.forEach(({ size }, idx) => cLayout.value.panes[idx].size
  = size)

const childLayer = ref<any>()
const component  = ref<any>()

defineExpose({
  globalKeyDown: (event: KeyboardEvent) => {
    childLayer.value?.forEach((layer: any) => layer.globalKeyDown(event))
    component.value?.globalKeyDown?.call(null, event)
  },
})
</script>

<template>
  <splitpanes
    class='flex-fill'
    :class="isNest ? null : 'root'"
    :horizontal="cLayout.type === 'horizontal' || undefined"
    :key='cLayout.uuid'
    v-if="cLayout.type === 'horizontal' || cLayout.type === 'vertical'"
    @resized='onResizedPanes'
    :dbl-click-splitter='false'
  >
    <pane
      v-for='(pane, idx) in cLayout.panes'
      :key='idx'
      class='d-flex justify-start align-start'
      :class="(pane.type !== 'horizontal' && pane.type !== 'vertical') ? 'last-generation' : null"
      :style="{ 'overflow': (pane.type === 'horizontal' || pane.type === 'vertical') ? 'hidden' : 'auto' }"
      :size='pane.size === undefined ? 100 - (cLayout.panes.reduce((p, c) => (c.size || 0) + p, 0)) : pane.size'
      :data-uuid='pane.uuid'
      min-size='5'
    >
      <div
        class='split-panes-layer d-flex w-100 h-100'
        :data-uuid='pane.uuid'
        :class="[
          pane.panes.length <= 1 ? 'flex-column' : pane.type === 'vertical' ? 'flex-column' : 'flex-row',
          isNest ? 'flex-fill' : 'root'
        ]"
      >
        <v-sheet
          class='d-flex px-1 py-1'
          style='box-sizing: border-box; background-color: rgba(255, 255, 255, 0.1);'
          :class="pane.panes.length <= 1 ? 'flex-column' : pane.type === 'vertical' ? 'flex-column' : 'flex-row'"
          v-if='showBar'
        >
          <div
            class='position-sticky d-flex'
            :class="pane.panes.length <= 1 ? 'flex-row w-100 px-5' : pane.type === 'vertical' ? 'flex-row w-100' : 'flex-column h-100'"
            style='gap: 1em; top: 0; left: 0;'
          >
            <template v-if="pane.type === 'horizontal' || pane.type === 'vertical'">
              <v-defaults-provider :defaults='{ VBtn: { size: "x-small" } }'>
                <v-tooltip>
                  <template #activator='{ props }'>
                    <v-btn
                      icon='mdi-view-split-vertical'
                      :data-idx='idx'
                      v-bind='props'
                      v-if="pane.type !== 'horizontal'"
                      @click="pane.type = 'horizontal'"
                      @mouseenter='showBorderChildren'
                      @mouseleave='hideBorderChildren'
                    ></v-btn>
                    <v-btn
                      icon='mdi-view-split-horizontal'
                      :data-idx='idx'
                      v-bind='props'
                      v-if="pane.type !== 'vertical'"
                      @click="pane.type = 'vertical'"
                      @mouseenter='showBorderChildren'
                      @mouseleave='hideBorderChildren'
                    ></v-btn>
                  </template>
                  分割の向きの変更
                </v-tooltip>
              </v-defaults-provider>
            </template>
            <v-menu location='center'>
              <template #activator='{ props: menu }'>
                <v-tooltip>
                  <template #activator='{ props }'>
                    <v-btn size='x-small' color='primary' v-bind='{...menu, ...props}' icon='mdi-plus' />
                  </template>
                  ペイン追加
                </v-tooltip>
              </template>
              <v-container class='text-center'>
                <v-defaults-provider :defaults='{ VBtn: { rounded: 0, variant: "text" } }'>
                  <v-row>
                    <v-col class='pa-0'>
                      <v-btn
                        icon='mdi-chevron-up'
                        class='bg-white'
                        :data-idx='idx'
                        data-direction='up'
                        @click='addPane'
                        @mouseenter='showBorderSelf'
                        @mouseleave='hideBorderSelf'
                      />
                    </v-col>
                  </v-row>
                  <v-row class='my-3'>
                    <v-col class='pa-0'>
                      <v-btn
                        icon='mdi-chevron-left'
                        class='bg-white'
                        :data-idx='idx'
                        data-direction='left'
                        @click='addPane'
                        @mouseenter='showBorderSelf'
                        @mouseleave='hideBorderSelf'
                      ></v-btn>
                    </v-col>
                    <v-col class='pa-0'>
                      <v-btn
                        icon=''
                        v-ripple='false'
                        variant='plain'
                      ></v-btn>
                    </v-col>
                    <v-col class='pa-0'>
                      <v-btn
                        icon='mdi-chevron-right'
                        class='bg-white'
                        :data-idx='idx'
                        data-direction='right'
                        @click='addPane'
                        @mouseenter='showBorderSelf'
                        @mouseleave='hideBorderSelf'
                      ></v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class='pa-0'>
                      <v-btn
                        icon='mdi-chevron-down'
                        :rounded='0'
                        variant='text'
                        class='bg-white'
                        :data-idx='idx'
                        data-direction='down'
                        @click='addPane'
                        @mouseenter='showBorderSelf'
                        @mouseleave='hideBorderSelf'
                      ></v-btn>
                    </v-col>
                  </v-row>
                </v-defaults-provider>
              </v-container>
            </v-menu>
            <v-menu
              v-if="pane.type !== 'horizontal' && pane.type !== 'vertical' && pane.component"
              :close-on-content-click='false'
            >
              <template #activator='{ props: menu }'>
                <v-tooltip>
                  <template #activator='{ props }'>
                    <v-btn
                      size='x-small'
                      color='secondary'
                      v-bind='{ ...menu, ...props }'
                      icon='mdi-package-variant-closed'
                    />
                  </template>
                  表示内容の選択
                </v-tooltip>

              </template>
              <v-list density='compact'>
                <template v-for='g in componentMap' :key='g.group'>
                  <v-list-group v-if='g.group'>
                    <template #activator='{ props }'>
                      <v-list-item v-bind='props' :title='g.group' />
                    </template>

                    <v-list-item
                      v-for='n in Object.keys(g.items)'
                      :title='n'
                      :value='n'
                      :active='n === pane.component && g.group === pane.componentGroup'
                      @click='pane.component = n; pane.componentGroup = g.group'
                    />
                  </v-list-group>
                  <template v-else>
                    <v-list-item
                      v-for='n in Object.keys(g.items)'
                      :title='n'
                      :value='n'
                      :active='n === pane.component && g.group === pane.componentGroup'
                      @click='pane.component = n; pane.componentGroup = g.group'
                    />
                  </template>
                </template>
              </v-list>
            </v-menu>
            <template v-if='(cLayout.panes?.length || 0) > 1'>
              <v-spacer />
              <v-tooltip>
                <template #activator='{ props }'>
                  <v-btn
                    size='x-small'
                    icon='mdi-close'
                    :data-idx='idx'
                    v-bind='props'
                    @click='removePane'
                    @mouseenter='showBorderSelf'
                    @mouseleave='hideBorderSelf'
                  />
                </template>
                このペインを削除
              </v-tooltip>
            </template>
          </div>
        </v-sheet>
        <!--suppress HtmlUnknownTag -->
        <SplitPanesLayer
          :key='pane.uuid'
          :layout='pane'
          :root-layout='rootLayout'
          :is-nest='true'
          :show-bar='showBar'
          :component-target='pane.component'
          @change-component='(componentGroup, component) => {cLayout.componentGroup = componentGroup; cLayout.component = component}'
          @change-layout='newLayout => emits("change-layout", newLayout)'
          ref='childLayer'
        />
      </div>
    </pane>
  </splitpanes>
  <keep-alive v-else-if='cLayout.component'>
    <component
      v-if='cLayout.componentGroup'
      :is='componentMap.find(p => p.group === cLayout.componentGroup)?.items[cLayout.component]'
      :layout='cLayout'
      :root-layout='rootLayout'
      ref='component'
    />
    <component
      v-else
      :is='componentMap.find(p => p.group === cLayout.componentGroup)?.items[cLayout.component]'
      :layout='cLayout'
      :root-layout='rootLayout'
      @change-component='(componentGroup, component) => {cLayout.componentGroup = componentGroup; cLayout.component = component}'
      @change-layout='newLayout => emits("change-layout", newLayout)'
      ref='component'
    />
  </keep-alive>
</template>

<!--suppress HtmlUnknownAttribute, CssUnusedSymbol -->
<style deep lang='css'>
.splitpanes.root {
  height: 100%;
  background: rgb(var(--v-theme-surface));
}

.splitpanes {
  overflow: auto;
  height: auto;
}

.splitpanes__pane {
  box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;
  justify-content: center;
  align-items: center;
  display: flex;
}

.splitpanes__pane.last-generation {
  background-color: rgba(255, 255, 255, 0.3);
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 7px;
  background: linear-gradient(90deg, #cccccc, #111111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 7px;
  background: linear-gradient(#cccccc, #111111);
}

.splitpanes__pane.on-hold,
.split-panes-layer.on-hold {
  outline: 6px solid red;
  outline-offset: -6px;
}

.splitpanes__pane.on-hold-up,
.split-panes-layer.on-hold-up {
  border-top: 6px solid red;
}

.splitpanes__pane.on-hold-down,
.split-panes-layer.on-hold-down {
  border-bottom: 6px solid red;
}

.splitpanes__pane.on-hold-left,
.split-panes-layer.on-hold-left {
  border-left: 6px solid red;
}

.splitpanes__pane.on-hold-right,
.split-panes-layer.on-hold-right {
  border-right: 6px solid red;
}

.v-select__selection-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
}
</style>
