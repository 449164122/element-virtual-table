<template>
  <el-button @click="handleClick(500)">500条</el-button>
  <el-button @click="handleClick(1000)">1000条</el-button>
  <el-table :data="tableData" border stripe style="width: 100%;" height="800">
    <el-table-column fixed prop="index" label="Index" width="150" />
    <el-table-column fixed prop="date" label="Date" width="150" />
    <el-table-column prop="name" label="Name" width="120" />
    <el-table-column prop="state" label="State" width="120" />
    <el-table-column prop="city" label="City" width="120" />
    <el-table-column prop="address" label="Address" width="600" />
    <el-table-column prop="zip" label="Zip" width="120" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">
          Detail
        </el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
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
