import Sample, { componentInfo as SampleInfo } from './Sample.vue'
import Sample2, { componentInfo as Sample2Info } from './Sample2.vue'

const group = 'smpl1'

export default [
  {
    component: Sample,
    info     : SampleInfo,
    group    : group,
  }, {
    component: Sample2,
    info     : Sample2Info,
    group    : group,
  },
]