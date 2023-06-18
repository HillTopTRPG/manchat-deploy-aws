import { uuid } from 'vue-uuid'
import { Layout } from '@/components/panes'

const object: Layout = {
  type   : 'vertical',
  uuid   : uuid.v4(),
  payload: null,
  panes  : [
    {
      type          : 'normal',
      uuid          : uuid.v4(),
      componentGroup: '',
      component     : '初期画面',
      payload       : null,
      panes         : [],
    },
  ],
}

export default object
