<script setup lang='ts'>
import { ref, watch } from 'vue'

defineProps<{
  buttonClass?: string
  buttonText: string
  dialogTitle: string
}>()

const emits = defineEmits<{
  (e: 'execute'): void
}>()

const dialogFlg         = ref(false)
const deleteConfirmText = ref('')
watch(dialogFlg, (v) => {
  if (v) {
    deleteConfirmText.value = ''
  }
})
const execute = () => {
  if (deleteConfirmText.value !== 'delete') {
    return
  }
  dialogFlg.value = false
  emits('execute')
}
</script>

<template>
  <v-dialog v-model='dialogFlg'>
    <template v-slot:activator='{ props }'>
      <v-btn color='error' prepend-icon='mdi-delete' v-bind='props' :class='buttonClass'>{{ buttonText }}</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class='text-h5'>{{ dialogTitle }}</span>
      </v-card-title>
      <v-card-text>
        この操作は取り消せません。
        <v-text-field
          v-model='deleteConfirmText'
          hint='削除するにはここに delete と入力してください'
          :persistent-hint='true'
          label='入力欄'
          :autofocus='true'
          @keydown.enter='execute()'
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color='blue-darken-1' @click='dialogFlg = false'>キャンセル</v-btn>
        <v-btn
          color='blue-darken-1'
          :disabled='deleteConfirmText !== "delete"'
          @click='execute()'
        >削除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
