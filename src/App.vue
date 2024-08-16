<script setup lang="ts">
import { ref , onMounted} from 'vue'
import ElTable from '../packages/components/table/src/table.vue'
import ElTableColumn from '../packages/components/table/src/tableColumn.ts'
onMounted(() => {
  window.addEventListener('resize', () => {
    console.log(111)
  })
})
const tableData = [
]
for(let i = 0; i < 1000; i++) {
    tableData.push({
      order: i+1,
      date: i+'2016-05-03'+i,
      name: i+'Tom'+i,
      address: i+'Los Angeles'+i,
      date1: i+'2016-05-03'+i,
      name1: i+'Tom'+i,
      address1: i+'Los Angeles'+i,
      date2: i+'2016-05-03'+i,
      name2: i+'Tom'+i,
      address2: i+'Los Angeles'+i,
    })
  }
const data = ref([])
function search(value) {
  data.value = [];
  setTimeout(() => {
    data.value = tableData.slice(0, value)
  });
}
</script>

<template>
  <!-- <div class="a"><div class="b"><div class="c">c</div></div></div> -->
    <button @click="search(500)">500条</button>
    <button @click="search(1000)">1000条</button>
    <el-table border stripe :data="data" style="width: 100%;" virtualType="fixed" height="760">
      <el-table-column type="selection" width="55" fixed="left"/>
      <el-table-column prop="order" label="order" />
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="address" label="Address" />
      <el-table-column prop="date1" label="Date1" width="180" />
      <el-table-column prop="name1" label="Name1" width="80" fixed="right"/>
      <el-table-column prop="address1" label="Address1" fixed="right">
        <el-button type="primary" link>1</el-button>
        <el-button type="primary" link>2</el-button>
        <el-button type="primary" link>3</el-button>
      </el-table-column>
    </el-table>
</template>

<style>
.el-table__body-wrapper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}
.el-table__body {
  position: absolute;
  top: 0;
  left: 0;
}
tr {
  height: 40px;
}
tr td{
  font-size: 12px !important;
  height: 40px;
  padding: 0 !important;
}
.a {
  width: 500px;
  height: 500px;
  border: 1px solid red;
  overflow: auto;
}
.b {
  width: 500px;
  height: 800px;
  border: 1px solid blue;
}
.c {
  width: 50px;
  height: 80px;
  border: 1px solid rgb(7, 95, 29);
  position: sticky;
  right: 0;
}
.el-table__header-wrapper {
  width: calc(100% - var(--scroller-width));
}
</style>