import ChatLayout from '@/pages/PaneLayoutTemplate/ChatLayout'
import DefaultLayout from '@/pages/PaneLayoutTemplate/DefaultLayout'

export default [
  {
    layout: DefaultLayout,
    title : '空のペインのみ',
  }, {
    layout: ChatLayout,
    title : 'チャット＋空のペイン',
  },
]
