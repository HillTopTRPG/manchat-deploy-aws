<template>
  <name-password-form v-if="modelValue === addType" :label="`${name}名`" :button="`${name}を作る`" @perform="add" />
  <password-form
    v-else-if="selectedObject"
    :title="selectedObject?.name || ''"
    :key="selectedObject?.id"
    :button="entryButton || ''"
    @perform="password => entry(selectedObject?.id, password)"
  >
    <slot />
  </password-form>
  <v-card class="align-center text-center pa-5" variant="flat" v-else>
    <v-btn @click="update(addType)" variant="outlined" color="primary" :text="`${name}を作る`" />
    <template v-if="selectable">
      <p class="ma-5">または</p>
      <p>{{ name }}を選んでください</p>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
import NamePasswordForm from '@/components/entry/NamePasswordForm.vue'
import PasswordForm from '@/components/entry/PasswordForm.vue'

defineProps<{
  name: string,
  entryButton: string,
  modelValue: string,
  selectable: boolean,
  selectedObject: {
    id: string,
    name: string
  },
  addType: 'add-room' | 'sign-up'
}>()

const emit = defineEmits(['add', 'entry', 'update:modelValue'])

function update(value: string) {
  emit('update:modelValue', value)
}

function add(name: string, password: string) {
  emit('add', name, password)
}

function entry(id: string, password: string) {
  emit('entry', id, password)
}
</script>
