# el-virtual-table
基于element-plus中el-table的虚拟表格组件，功能和el-table一致，但是性能更好，支持大数据量渲染，暂时只支持纵向虚拟表格，且行高固定
## 安装
```bash
npm install el-virtual-table
```
## 使用
```javascript
import elVirtualTable from 'el-virtual-table'

除组件名同el-table不一致外，其他使用方式完全一致
```
## API

```
| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| data | 表数据 | Array | [] |
| rowHeight | 行高（一定要传） | Number | 40 |
| visibleCount | 要显示的数据（初始会自动根据容器高度计算） | Number | 10  |
| buffer | 缓冲数量 | Number | 5 |
```

