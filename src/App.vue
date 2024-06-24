<script setup lang="ts">
import { ref } from 'vue'
import ElTable from '../packages/components/table/src/table.vue'
import ElTableColumn from '../packages/components/table/src/tableColumn.ts'

const tableData = [
]
for(let i = 0; i < 1000; i++) {
    tableData.push({
      order: i+1,
      date: '2016-05-03',
      name: 'Tom',
      address: 'Los Angeles',
      date1: '2016-05-03',
      name1: 'Tom',
      address1: 'Los Angeles',
      date2: '2016-05-03',
      name2: 'Tom',
      address2: 'Los Angeles',
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
    <button @click="search(500)">500条</button>
    <button @click="search(1000)">1000条</button>
    <el-table :data="data" style="width: 100%;" height="760">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="order" label="order" width="180" />
      <el-table-column prop="date" label="Date" width="180" />
      <el-table-column prop="name" label="Name" width="180" />
      <el-table-column prop="address" label="Address" />
      <el-table-column prop="date1" label="Date1" width="180" />
      <el-table-column prop="name1" label="Name1" width="180" />
      <el-table-column prop="address1" label="Address1" />
      <el-table-column prop="date2" label="Date2" width="180" />
      <el-table-column prop="name2" label="Name2" width="180" />
      <el-table-column prop="address2" label="Address2" />
    </el-table>
</template>

<style>

</style>