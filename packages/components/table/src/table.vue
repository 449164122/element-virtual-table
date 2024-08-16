<template>
  <div
    ref="tableWrapper"
    :class="[
      'virtual-table',
      {
        [ns.m('fit')]: fit,
        [ns.m('striped')]: stripe,
        [ns.m('border')]: border || isGroup,
        [ns.m('hidden')]: isHidden,
        [ns.m('group')]: isGroup,
        [ns.m('fluid-height')]: maxHeight,
        [ns.m('scrollable-x')]: layout.scrollX.value,
        [ns.m('scrollable-y')]: layout.scrollY.value,
        [ns.m('enable-row-hover')]: !store.states.isComplex.value,
        [ns.m('enable-row-transition')]:
          (store.states.data.value || []).length !== 0 &&
          (store.states.data.value || []).length < 100,
        'has-footer': showSummary,
      },
      ns.m(tableSize),
      className,
      ns.b(),
      ns.m(`layout-${tableLayout}`),
    ]"
    :style="style"
    :data-prefix="ns.namespace.value"
    @mouseleave="handleMouseLeave"
  >
    <div :class="ns.e('inner-wrapper')" :style="tableInnerStyle">
      <div ref="hiddenColumns" class="hidden-columns">
        <slot />
      </div>
      <div
        v-if="showHeader && tableLayout === 'fixed'"
        ref="headerWrapper"
        v-mousewheel="handleHeaderFooterMousewheel"
        :class="ns.e('header-wrapper')"
      >
        <table
          ref="tableHeader"
          :class="ns.e('header')"
          :style="tableBodyStyles"
          border="0"
          cellpadding="0"
          cellspacing="0"
        >
          <hColgroup
            :columns="store.states.columns.value"
            :table-layout="tableLayout"
          />
          <table-header
            ref="tableHeaderRef"
            :border="border"
            :default-sort="defaultSort"
            :store="store"
            @set-drag-visible="setDragVisible"
          />
        </table>
      </div>
      <div ref="bodyWrapper" :class="ns.e('body-wrapper')">
        <div ref="phantomRef" :style="{height: store.states.data.value.length * itemSize + 'px'}"></div>
        <table
          ref="tableBody"
          :class="ns.e('body')"
          cellspacing="0"
          cellpadding="0"
          border="0"
          :style="{
            width: bodyWidth,
            tableLayout,
          }"
        >
          <hColgroup
            :columns="store.states.columns.value"
            :table-layout="tableLayout"
          />
          <table-header
            v-if="showHeader && tableLayout === 'auto'"
            ref="tableHeaderRef"
            :class="ns.e('body-header')"
            :border="border"
            :default-sort="defaultSort"
            :store="store"
            @set-drag-visible="setDragVisible"
          />
          <table-body
            :context="context"
            :highlight="highlightCurrentRow"
            :row-class-name="rowClassName"
            :tooltip-effect="tooltipEffect"
            :tooltip-options="tooltipOptions"
            :row-style="rowStyle"
            :store="store"
            :stripe="stripe"
            :virtualType="virtualType"
            :buffer="buffer"
            :itemSize="itemSize"
            :estimatedItemSize="estimatedItemSize"
          />
          <table-footer
            v-if="showSummary && tableLayout === 'auto'"
            :class="ns.e('body-footer')"
            :border="border"
            :default-sort="defaultSort"
            :store="store"
            :sum-text="computedSumText"
            :summary-method="summaryMethod"
          />
        </table>
        <div
          v-if="isEmpty"
          ref="emptyBlock"
          :style="emptyBlockStyle"
          :class="ns.e('empty-block')"
        >
          <span :class="ns.e('empty-text')">
            <slot name="empty">{{ computedEmptyText }}</slot>
          </span>
        </div>
        <div
          v-if="$slots.append"
          ref="appendWrapper"
          :class="ns.e('append-wrapper')"
        >
          <slot name="append" />
        </div>
      </div>
      <div
        v-if="showSummary && tableLayout === 'fixed'"
        v-show="!isEmpty"
        ref="footerWrapper"
        v-mousewheel="handleHeaderFooterMousewheel"
        :class="ns.e('footer-wrapper')"
      >
        <table
          :class="ns.e('footer')"
          cellspacing="0"
          cellpadding="0"
          border="0"
          :style="tableBodyStyles"
        >
          <hColgroup
            :columns="store.states.columns.value"
            :table-layout="tableLayout"
          />
          <table-footer
            :border="border"
            :default-sort="defaultSort"
            :store="store"
            :sum-text="computedSumText"
            :summary-method="summaryMethod"
          />
        </table>
      </div>
      <div v-if="border || isGroup" :class="ns.e('border-left-patch')" />
    </div>
    <div
      v-show="resizeProxyVisible"
      ref="resizeProxy"
      :class="ns.e('column-resize-proxy')"
    />
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { computed, defineComponent, getCurrentInstance, provide, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { debounce } from 'lodash-unified'
import { Mousewheel } from '@element-plus/directives'
import { useLocale, useNamespace } from '@element-plus/hooks'
import { createStore } from './store/helper'
import TableLayout from './table-layout'
import TableHeader from './table-header'
import TableBody from './table-body'
import TableFooter from './table-footer'
import useUtils from './table/utils-helper'
import useStyle from './table/style-helper'
import useKeyRender from './table/key-render-helper'
import defaultProps from './table/defaults'
import { TABLE_INJECTION_KEY } from './tokens'
import { hColgroup } from './h-helper'
import { useScrollbar } from './composables/use-scrollbar'

import type { Table } from './table/defaults'

let tableIdSeed = 1
export default defineComponent({
  name: 'ElTable',
  directives: {
    Mousewheel,
  },
  components: {
    TableHeader,
    TableBody,
    TableFooter,
    hColgroup,
  },
  props: defaultProps,
  emits: [
    'select',
    'select-all',
    'selection-change',
    'cell-mouse-enter',
    'cell-mouse-leave',
    'cell-contextmenu',
    'cell-click',
    'cell-dblclick',
    'row-click',
    'row-contextmenu',
    'row-dblclick',
    'header-click',
    'header-contextmenu',
    'sort-change',
    'filter-change',
    'current-change',
    'header-dragend',
    'expand-change',
  ],
  setup(props) {
    type Row = typeof props.data[number]
    const { t } = useLocale()
    const ns = useNamespace('table')
    const table = getCurrentInstance() as Table<Row>
    provide(TABLE_INJECTION_KEY, table)
    const store = createStore<Row>(table, props)
    table.store = store
    const layout = new TableLayout<Row>({
      store: table.store,
      table,
      fit: props.fit,
      showHeader: props.showHeader,
    })
    table.layout = layout

    const isEmpty = computed(() => (store.states.data.value || []).length === 0)

    /**
     * open functions
     */
    const {
      setCurrentRow,
      getSelectionRows,
      toggleRowSelection,
      clearSelection,
      clearFilter,
      toggleAllSelection,
      toggleRowExpansion,
      clearSort,
      sort,
    } = useUtils<Row>(store)
    const {
      isHidden,
      renderExpanded,
      setDragVisible,
      isGroup,
      handleMouseLeave,
      handleHeaderFooterMousewheel,
      tableSize,
      emptyBlockStyle,
      handleFixedMousewheel,
      resizeProxyVisible,
      bodyWidth,
      resizeState,
      doLayout,
      tableBodyStyles,
      tableLayout,
      scrollbarViewStyle,
      tableInnerStyle,
      scrollbarStyle,
    } = useStyle<Row>(props, layout, store, table)

    const { scrollBarRef, scrollTo, setScrollLeft, setScrollTop } =
      useScrollbar()

    const debouncedUpdateLayout = debounce(doLayout, 50)
    watch(bodyWidth, (val: string) => {
      if (val) {
        const bodyWrapper = table.refs?.bodyWrapper as HTMLElement;
        const bodyWidth =+val.slice(0, -2);
        if (bodyWrapper.offsetWidth !== bodyWidth) {
          bodyWrapper.style.overflowX = 'auto';
        } else {
          bodyWrapper.style.overflowX = 'hidden';
        }
      }
    })
    watch(() => props.data, () => {
      nextTick(() => {
        const tableWrapper = table.refs?.tableWrapper as HTMLElement;
        const bodyWrapper = table.refs?.bodyWrapper as HTMLElement;
        if (tableWrapper && bodyWrapper) {
          tableWrapper.style.setProperty('--scroller-width', `${bodyWrapper.offsetWidth - bodyWrapper.clientWidth}px`);
        }
      })
    })
    function handleScroll(event) {
      const headerWrapper = table.refs?.headerWrapper as HTMLElement;
      const target = event.target as HTMLElement;
      headerWrapper.scrollLeft = target.scrollLeft;
    }
    onMounted(()=>{
      const bodyWrapper = table.refs?.bodyWrapper as HTMLElement;
      bodyWrapper.addEventListener('scroll', handleScroll)
    })
    onBeforeUnmount(()=>{
      const bodyWrapper = table.refs?.bodyWrapper as HTMLElement;
      bodyWrapper.removeEventListener('scroll', handleScroll)
    })
    
    const tableId = `${ns.namespace.value}-table_${tableIdSeed++}`
    table.tableId = tableId
    table.state = {
      isGroup,
      resizeState,
      doLayout,
      debouncedUpdateLayout,
    }
    const computedSumText = computed(
      () => props.sumText || t('el.table.sumText')
    )
    const computedEmptyText = computed(() => {
      return props.emptyText || t('el.table.emptyText')
    })

    useKeyRender(table)

    return {
      ns,
      layout,
      store,
      handleHeaderFooterMousewheel,
      handleMouseLeave,
      tableId,
      tableSize,
      isHidden,
      isEmpty,
      renderExpanded,
      resizeProxyVisible,
      resizeState,
      isGroup,
      bodyWidth,
      tableBodyStyles,
      emptyBlockStyle,
      debouncedUpdateLayout,
      handleFixedMousewheel,
      setCurrentRow,
      getSelectionRows,
      toggleRowSelection,
      clearSelection,
      clearFilter,
      toggleAllSelection,
      toggleRowExpansion,
      clearSort,
      doLayout,
      sort,
      t,
      setDragVisible,
      context: table,
      computedSumText,
      computedEmptyText,
      tableLayout,
      scrollbarViewStyle,
      tableInnerStyle,
      scrollbarStyle,
      scrollBarRef,
      scrollTo,
      setScrollLeft,
      setScrollTop,
    }
  },
})
</script>
