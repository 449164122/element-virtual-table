import { ref, computed, h, defineComponent, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue';
import { throttle } from 'throttle-debounce';
import type { VNode } from 'vue';

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
    itemSize: {
      type: Number,
      default: 40,
    },
    buffer: {
      type: Number,
      default: 5, // 上下缓冲区的元素数量
    }
  },
  setup(props) {
    const startIndex = ref(0);
    const screenHeight = ref(0);
    const visibleCount = computed(() => Math.ceil(screenHeight.value / props.itemSize));
    const endIndex = computed(() => Math.min(startIndex.value + visibleCount.value + props.buffer, props.data.length));
    const visibleStartIndex = computed(() => Math.max(0, startIndex.value - props.buffer));
    const visibleData = computed(() => props.data.slice(visibleStartIndex.value, endIndex.value));
    const startOffset= ref(0);

    const handleScroll = throttle(20, (event: Event) => {
      const target = event.target as HTMLElement;
      const scrollTop = target.scrollTop;
      startIndex.value = Math.floor(scrollTop / props.itemSize);
      startOffset.value = Math.max(0, (startIndex.value - props.buffer) * props.itemSize)
    });
    const instance = getCurrentInstance();
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

    return {
      startIndex,
      endIndex,
      visibleData,
      startOffset,
      handleScroll,
    };
  },
  render() {
    return h("tbody", { tabIndex: -1, style: { transform: `translate3d(0,${this.startOffset}px, 0)` } }, [
      ...this.visibleData.reduce((acc: VNode[], row) => {
        return acc.concat(this.wrappedRowRender(row, acc.length));
      }, []),
    ]);
  }
});
