import ChatInput, { componentInfo as ChatInputInfo } from './ChatInput.vue'
import ChatViewer, { componentInfo as ChatViewerInfo } from './ChatViewer.vue'

const group = 'チャット'

export default [
  {
    component: ChatInput,
    info     : ChatInputInfo,
    group    : group,
  }, {
    component: ChatViewer,
    info     : ChatViewerInfo,
    group    : group,
  },
]