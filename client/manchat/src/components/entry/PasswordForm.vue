<template>
  <v-card variant="text" :title="title">
    <v-card-item>
      <slot/>
      <v-text-field
        :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
        label="パスワード"
        :type="passwordShow ? 'text' : 'password'"
        :autofocus="true"
        v-model="password"
        @click:append="passwordShow = !passwordShow"
      />
    </v-card-item>
    <v-card-actions color="primary">
      <v-btn
        :block="true"
        variant="text"
        class="text-h6 pa-6"
        style="background-color: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary));"
        @click="perform()"
      >{{button}}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import {ref} from 'vue'

defineProps<{
  title: String,
  button: String
}>()

const emit = defineEmits(['perform'])
const dialogFlg = ref(false)
const password = ref("")
const passwordShow = ref(false)

function perform() {
  emit('perform', password.value)
  dialogFlg.value = false
}
</script>
