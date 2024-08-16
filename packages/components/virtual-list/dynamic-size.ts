import { ref, computed, h, defineComponent, getCurrentInstance, onMounted, onBeforeUnmount, onUpdated, nextTick, watch } from 'vue';
import type { Ref } from 'vue';
import { throttle } from 'throttle-debounce';
import type { VNode } from 'vue';

interface Position {
  index: number;
  height: number;
  top: number;
  bottom: number;
}

export default defineComponent({
  name: 'VirtualList',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    wrappedRowRender: {
      type: Function,
      required: true,
    },
    estimatedItemSize: {
      type: Number,
      default: 40,
      required: true,
    },
    buffer: {
      type: Number,
      default: 5, // 上下缓冲区的元素数量
    },
  },
  setup(props) {
    const startIndex = ref(0);
    const screenHeight = ref(0);
    const visibleCount = computed(() => Math.ceil(screenHeight.value / props.estimatedItemSize));
    const endIndex = computed(() => Math.min(startIndex.value + visibleCount.value + props.buffer, props.data.length));
    const visibleStartIndex = computed(() => Math.max(0, startIndex.value - props.buffer));
    const visibleData = computed(() => props.data.slice(visibleStartIndex.value, endIndex.value));

    function binarySearch(list: Position[], value: number): number | null {
      let start = 0;
      let end = list.length - 1;
      let tempIndex: number | null = null;

      while (start <= end) {
        const midIndex = Math.floor((start + end) / 2);
        const midValue = list[midIndex].bottom;
        if (midValue === value) {
          return midIndex + 1;
        } else if (midValue < value) {
          start = midIndex + 1;
        } else {
          if (tempIndex === null || tempIndex > midIndex) {
            tempIndex = midIndex;
          }
          end = midIndex - 1;
        }
      }
      return tempIndex;
    }

    function getStartIndex(scrollTop: number = 0): number | null {
      return binarySearch(positions.value, scrollTop);
    }

    const handleScroll = throttle(20, (event: Event) => {
      const target = event.target as HTMLElement;
      const scrollTop = target.scrollTop;
      startIndex.value = getStartIndex(scrollTop) || 0;
      setStartOffset();
      const headerWrapper = (instance?.proxy?.$parent?.$parent as any)?.$refs?.headerWrapper as HTMLElement;
      headerWrapper.scrollLeft = target.scrollLeft;
    });

    const instance = getCurrentInstance();
    const positions: Ref<Position[]> = ref([]);

    function initPositions() {
      positions.value = props.data.map((_, index) => ({
        index,
        height: props.estimatedItemSize,
        top: index * props.estimatedItemSize,
        bottom: (index + 1) * props.estimatedItemSize,
      }));
    }

    watch(() => props.data, (value) => {
      if (value.length) {
        initPositions();
      }
    });

    onMounted(() => {
      const bodyWrapper = (instance?.proxy?.$parent?.$parent as any)?.$refs?.bodyWrapper as HTMLElement;
      if (bodyWrapper) {
        bodyWrapper.addEventListener('scroll', handleScroll);
        screenHeight.value = bodyWrapper.clientHeight;
      }
    });

    onBeforeUnmount(() => {
      const bodyWrapper = (instance?.proxy?.$parent?.$parent as any)?.$refs?.bodyWrapper as HTMLElement;
      if (bodyWrapper) {
        bodyWrapper.removeEventListener('scroll', handleScroll);
      }
    });

    function updateItemsSize() {
      const tbodyRef = instance?.proxy?.$refs?.tbodyRef as HTMLElement;
      tbodyRef.childNodes.forEach((node: ChildNode) => {
        const element = node as HTMLElement;
        const rect = element.getBoundingClientRect();
        const height = rect.height;
        const index = +element.id;
        const oldHeight = positions.value[index].height;
        const dValue = oldHeight - height;
        if (dValue) {
          positions.value[index].bottom -= dValue;
          positions.value[index].height = height;
          for (let k = index + 1; k < positions.value.length; k++) {
            positions.value[k].top = positions.value[k - 1].bottom;
            positions.value[k].bottom -= dValue;
          }
        }
      });
    }

    const startOffset = ref(0);

    function setStartOffset() {
      if (startIndex.value >= 1) {
        const size = positions.value[startIndex.value].top - (positions.value[startIndex.value - props.buffer]?.top || 0);
        startOffset.value = positions.value[startIndex.value - 1].bottom - size;
      } else {
        startOffset.value = 0;
      }
    }

    onUpdated(() => {
      nextTick(() => {
        const tbodyRef = instance?.proxy?.$refs?.tbodyRef as HTMLElement;
        if (tbodyRef.childNodes.length) {
          updateItemsSize();
          const height = positions.value[positions.value.length - 1].bottom;
          const phantomRef = (instance?.proxy?.$parent?.$parent as any)?.$refs?.phantomRef as HTMLElement;
          phantomRef.style.height = `${height}px`;
          setStartOffset();
        }
      });
    });

    return {
      startIndex,
      endIndex,
      visibleData,
      startOffset,
      handleScroll,
    };
  },
  render() {
    return h("tbody", { tabIndex: -1, ref: 'tbodyRef', style: { transform: `translate3d(0,${this.startOffset}px, 0)` } }, [
      ...this.visibleData.reduce((acc: VNode[], row) => {
        return acc.concat(this.wrappedRowRender(row, acc.length));
      }, []),
    ]);
  }
});
