<template>
  <v-container>
    <v-btn @click="change(addType)" variant="outlined" color="primary" :text="addButton"></v-btn>
    <v-table :fixed-header="true">
      <thead>
      <tr>
        <th class="text-left" style="width: 5em;"></th>
        <th class="text-left">{{ name }}</th>
        <slot name="header"/>
      </tr>
      </thead>
      <tbody>
      <template v-if="graphQlStore?.state.ready">
        <template v-if="!graphQlStore?.state[property].length">
          <tr>
            <td :colspan="totalColumn" class="text-center">
              空
            </td>
          </tr>
        </template>
        <template v-else>
          <template v-for="data in graphQlStore?.state[property]" :key="data.id">
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <tr
                  v-bind="props"
                  :class="{'hover': isHovering, 'selected': modelValue === data.id}"
                  @click="change(data.id)"
                >
                  <td>
                    <v-radio :readonly="true" :model-value="modelValue === data.id"/>
                  </td>
                  <td>{{ data.name }}</td>
                  <slot name="body" :data="data" />
                </tr>
              </template>
            </v-hover>
          </template>
        </template>
      </template>
      <template v-else>
        <tr>
          <td :colspan="totalColumn" class="text-center">
            <v-progress-circular color="primary" :indeterminate="true" />
          </td>
        </tr>
      </template>
      </tbody>
      <tfoot class="border-t"></tfoot>
    </v-table>
  </v-container>
</template>

<script lang="ts" setup>
import {inject} from 'vue'
import {GraphQlKey, GraphQlStore} from '@/views/graphql/graphql'
const graphQlStore = inject<GraphQlStore>(GraphQlKey)

defineProps<{
  modelValue: string,
  name: string,
  addType: 'add-room' | 'sign-up',
  addButton: string,
  property: string,
  totalColumn: number
}>()

const emit = defineEmits(['update:modelValue'])

function change(value: string) {
  emit('update:modelValue', value)
}
</script>

<style lang="scss" scoped>
tr.hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

tr.selected {
  box-shadow: inset 1px 1px rgba(var(--v-theme-primary), 0.5), inset -1px -1px rgba(var(--v-theme-primary), 0.5);
  background-color: rgba(var(--v-theme-primary), 0.2);
}
</style>
