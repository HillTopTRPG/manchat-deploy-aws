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
      <v-btn color='secondary' prepend-icon='mdi-logout-variant' v-bind='props' :class='buttonClass'>退室する</v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class='text-h5'>退室しますか？</span>
      </v-card-title>
      <v-card-text>
        おつかれさまでした。
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color='blue-darken-1' @click='dialogFlg = false'>キャンセル</v-btn>
        <v-btn
          color='blue-darken-1'
          @click='execute()'
        >退室
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
