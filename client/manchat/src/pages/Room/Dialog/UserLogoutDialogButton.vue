<script setup lang='ts'>
import { ref, watch } from 'vue'

defineProps<{
  buttonClass?: string
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
  dialogFlg.value = false
  emits('execute')
}
</script>

<template>
  <v-dialog v-model='dialogFlg'>
    <template v-slot:activator='{ props }'>
      <v-btn v-bind='props' :class='buttonClass'>ログアウト</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class='text-h5'>ログアウトしますか？</span>
      </v-card-title>
      <v-card-text>
        ログイン画面に戻ります。
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color='blue-darken-1' @click='dialogFlg = false'>キャンセル</v-btn>
        <v-btn
          color='blue-darken-1'
          @click='execute()'
        >ログアウト
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
