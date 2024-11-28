// @ts-nocheck
import type { PropType } from 'vue'
import type { Store } from '../store'
import type {
  ColumnCls,
  ColumnStyle,
  DefaultRow,
  Table,
} from '../table/defaults'
import type { TableOverflowTooltipOptions } from '../util'

interface TableBodyProps<T> {
  store: Store<T>
  stripe?: boolean
  context: Table<T>
  rowClassName: ColumnCls<T>
  rowStyle: ColumnStyle<T>
  fixed: string
  highlight: boolean
  tooltipEffect?: string
  tooltipOptions?: TableOverflowTooltipOptions
  scrollBarRef: any
  rowHeight: number | string
  visibleCount: number | string
  buffer: number | string
}

const defaultProps = {
  store: {
    required: true,
    type: Object as PropType<TableBodyProps<DefaultRow>['store']>,
  },
  stripe: Boolean,
  tooltipEffect: String,
  tooltipOptions: {
    type: Object as PropType<TableBodyProps<DefaultRow>['tooltipOptions']>,
  },
  context: {
    default: () => ({}),
    type: Object as PropType<TableBodyProps<DefaultRow>['context']>,
  },
  rowClassName: [String, Function] as PropType<
    TableBodyProps<DefaultRow>['rowClassName']
  >,
  rowStyle: [Object, Function] as PropType<
    TableBodyProps<DefaultRow>['rowStyle']
  >,
  fixed: {
    type: String,
    default: '',
  },
  highlight: Boolean,
  scrollBarRef: Object,
  rowHeight: [Number, String],
  visibleCount: [Number, String],
  buffer: [Number, String],
}

export { TableBodyProps }
export default defaultProps
