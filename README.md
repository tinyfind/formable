<!--
 * @Author: dong 2710732812@qq.com
 * @Date: 2022-07-18 18:43:53
 * @LastEditors: dong 2710732812@qq.com
 * @LastEditTime: 2022-07-18 19:59:06
 * @FilePath: \formable\README.md
-->
# formable
快速创建响应式的表单数据

## 响应式
- 通过 **js** 的 **proxy** 代理静态数据
## 操作

- 操作符（operate)
    - $: 标识当前数据结构层级
    - watch : 监听数据并返回  （只读）
    ```js
    watch($=>`name:${$.name}-age:${$.age}`)
    // 表示返回当前对象内 name 和 age 返回组合值，并不实际在原数据上存在
    ```
    - compute : 依赖其它数据并返回 （只能依赖已存在的数据）
    ```js
    compute($=>$.name+$.age,['name','age'])
    //compute表示已经存在的数据随其依赖项发生更改，会更改原数据
    ```
- 约束（schema）
    - 约束用来规定数据的响应式
    - 对象约束
    ```javascript
    const targetObj = {
        name:'dong',
        age:'10'
    }
    const schemaObj = {intru:watch($=>$.name+$.age)}
    // dong10
    ```
    - 数组约束（表格结构）
    ```js
    const targetArr = [
        {
            price:10,
            nums:200,

        }
    ] 
    const schemaArr = [
        {
            totalPrice: compute($=>$price*$.nums)
        }
    ]
    ```
    - 组合约束
    ```js
    const tableForm = {
        tableData:[
            {name:'a',num:20,price:20},
            {name:'b',num:10,price:40}
            {name:'c',num:30,price:10}
            {name:'d',num:40,price:80}
        ],
    }

    const schemaTableForm = {
        totalPrice:watch($=>$.tableData.reduce((prev,next)=>prev + next.totalPrice,0)),
        tableData:[
            {
                totalPrice:watch($=>$.num*$.price)
            }
        ]
    }
    ```

- 构建响应表单
    ```js
    const formable, {watch,compute} fomr 'formable'
    const tableForm = {
        tableData:[
            {name:'a',num:20,price:20},
            {name:'b',num:10,price:40}
            {name:'c',num:30,price:10}
            {name:'d',num:40,price:80}
        ],
    }
    const schemaTableForm = {
        totalPrice:watch($=>$.tableData.reduce((prev,next)=>prev + next.totalPrice,0)),
        tableData:[
            {
                totalPrice:watch($=>$.num*$.price)
            }
        ]
    }

    const formaTableForm = formable(tableForm,schemaTableForm)
    console.log(formTableForm.totalPrice)
    // 4300
    ```



