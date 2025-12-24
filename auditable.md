
执行审计
------------
```typescript
interface Auditable {
    id: string
    // 创建时间
    createTime: Date
    // 创建者id
    creatorId: string
    // 创建者信息
    creator: string
    // 更新时间
    updateTime: Date
    // 更新者id
    modifierId: string
    // 更新者信息
    modifier: string
}

```
```typescript
interface OperationAuditRecord {
    id: string
    // 操作名称
    opName: string
    // 操作开始时间
    startTime: Date
    // 操作结束时间
    endTime: Date
    // 开始状态
    beginStatus: string 
    // 结束状态
    endStatus: string
    // 操作者id
    operatorId: string
    // 操作者信息
    operator: string
    // 输入 
    input?: string 
    // 开始时内部状态
    beginState: string
    // 结束时内部状态
    endState: string
    // 输出
    output?: string
    // 结果
    result?: string
    // 错误
    error?: string
}
```
