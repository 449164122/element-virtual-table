<script lang="ts">
import { ref, watch, nextTick, h, defineComponent, type PropType, onBeforeUnmount } from 'vue';
import ResizeObserver from 'resize-observer-polyfill'

interface RowData {
  [key: string]: any; // 可以扩展字段的类型，例如可以是字符串、数字等
}

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<RowData[]>,
      required: true,
    },
    rowHeight: {
      type: [Number, String] as PropType<number | string>,
      default: 40,
    },
    visibleCount: {
      type: Number,
      default: 10,
    },
    buffer: {
      type: Number,
      default: 5,
    },
    wrappedRowRender: Function,
    scrollBarRef: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const visibleData = ref<RowData[]>([]); // 当前可见的数据
    const startIndex = ref(0); // 可见数据的开始索引
    const endIndex = ref(props.visibleCount - 1); // 可见数据的结束索引

    // 更新可见数据的方法
    const updateVisibleData = () => {
      const scrollContainer = props.scrollBarRef.wrapRef;
      const containerHeight = scrollContainer ? scrollContainer.offsetHeight : 0;

      // 计算可见区域内的项数
      const visibleItemCount = Math.ceil(containerHeight / (typeof props.rowHeight === 'number' ? props.rowHeight : parseInt(props.rowHeight)));

      // 在可见项数基础上加上缓冲区
      const newStartIndex = Math.max(0, startIndex.value - props.buffer);
      const newEndIndex = Math.min(props.data.length - 1, startIndex.value + visibleItemCount + props.buffer - 1);

      // 根据起始和结束索引计算可见数据
      visibleData.value = props.data.slice(newStartIndex, newEndIndex + 1);
      const table = scrollContainer?.querySelector('.virtual-list table');
      if (table) {
        table.style.transform = `translateY(${newStartIndex * (typeof props.rowHeight === 'number' ? props.rowHeight : parseInt(props.rowHeight))}px)`;
      }

      // 更新结束索引
      endIndex.value = newEndIndex;
    };

    // 滚动事件处理
    const onScroll = (e: Event) => {
      const scrollTop = (e.target as HTMLElement).scrollTop;
      const newStartIndex = Math.max(0, Math.floor(scrollTop / (typeof props.rowHeight === 'number' ? props.rowHeight : parseInt(props.rowHeight))));

      // 如果起始索引发生变化，更新可见数据
      if (newStartIndex !== startIndex.value) {
        startIndex.value = newStartIndex;
        updateVisibleData();
      }
    };

    // 监听数据变化并更新可见数据
    watch(() => props.data, () => {
      updateVisibleData();
    });

    let observer: ResizeObserver | null = null;
    let wrapRef: HTMLElement | null = null;
    // 监听 scrollBarRef 变化并绑定滚动事件
    watch(
      () => props.scrollBarRef,
      (val) => {
        if (val.wrapRef) {
          wrapRef = val.wrapRef;
          wrapRef?.removeEventListener('scroll', onScroll);
          wrapRef?.addEventListener('scroll', onScroll);
          observer = new ResizeObserver(() => {
            nextTick(() => {
              updateVisibleData();
            });
          });
          observer?.observe(val.wrapRef);
        }
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      wrapRef?.removeEventListener('scroll', onScroll);
      if (observer) {
        observer.disconnect();
      }
    });

    return {
      visibleData,
    };
  },
  render() {
    return h(
      'tbody',
      { tabIndex: -1 },
      this.visibleData.reduce((acc, row, index) => {
        return acc.concat(this.wrappedRowRender?.(row, index, this.rowHeight));
      }, []),
    );
  },
});
</script>
