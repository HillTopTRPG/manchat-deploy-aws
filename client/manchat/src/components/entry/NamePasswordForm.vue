<template>
  <v-card variant="text" title="新規作成">
    <v-card-item>
      <v-text-field
        type="text"
        :label="`${label}【必須】`"
        placeholder="必須項目"
        :autofocus="true"
        hint="Enterで次の項目に遷移します"
        :rules="[value => Boolean(value) || '必ず入力してください']"
        @keydown.enter="passwordRef.focus()"
        v-model="name"
      />
      <v-text-field
        ref="passwordRef"
        :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
        label="パスワード"
        :type="passwordShow ? 'text' : 'password'"
        :hint="name ? 'Enterで部屋を作ります' : ''"
        v-model="password"
        @keydown.enter="perform"
        @click:append="passwordShow = !passwordShow"
      />
    </v-card-item>
    <v-card-actions color="primary">
      <v-btn
        :block="true"
        :disabled="!name"
        variant="text"
        class="text-h6 pa-6"
        style="background-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary));"
        @click="perform"
      >{{button}}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineProps<{
  label: string,
  button: string
}>()

const emit = defineEmits(['perform'])
const passwordRef = ref()
const dialogFlg = ref(false)
const name = ref("")
const password = ref("")
const passwordShow = ref(false)

function perform() {
  emit('perform', name.value, password.value)
  dialogFlg.value = false
}
</script>
