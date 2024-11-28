<script setup lang="ts">
import { ref } from 'vue'
import ElTable from '../packages/components/table/src/table.vue'
import ElTableColumn from '../packages/components/table/src/tableColumn.ts'

const data = ref([]);
const tableData = ref<any>([]);
const handleClick = (length: number) => {
  tableData.value = Array.from({ length }, (_, i) => ({
  index: i + 1,
  date: '2016-05-02',
  name: 'Tom',
  state: 'California',
  city: 'Los Angeles',
  address: 'No. 189, Grove St, Los Angeles',
  zip: 'CA 90036',
}))
}
</script>

<template>
  <!-- <div class="a"><div class="b"><div class="c">c</div></div></div> -->
    <button @click="handleClick(500)">500条</button>
    <button @click="handleClick(1000)">1000条</button>
    <el-table border stripe :data="tableData" style="width: 100%;" height="760">
      <el-table-column type="selection" width="55" fixed="left"/>
      <el-table-column prop="index" label="index" width="60" fixed="left"/>
      <el-table-column prop="order" label="order" />
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="address" label="Address" />
      <el-table-column prop="date1" label="Date1" width="180" />
      <el-table-column prop="name1" label="Name1"  fixed="right"/>
      <el-table-column prop="address1" label="Address1" fixed="right">
        <el-button type="primary" link>1</el-button>
        <el-button type="primary" link>2</el-button>
        <el-button type="primary" link>3</el-button>
      </el-table-column>
    </el-table>
</template>
