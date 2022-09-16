// 用antd写一个显示用户信息，带查询，带多选勾选反馈已选择的页面
// 先写死数据，再写从接口调数据（用axios）
// 用function组件而不是class组件
// 需要加flex布局吗？？？
import userdata from "../assets/arr.json"
import {Button, Table} from 'antd';

const USER_TITLES = ["序号", "是否禁用", "地址", "图标", "名称", "所有者", "描述", "呼叫序号", "状态", "更新时间", "创建时间", "进度"];

// 从json中读取数据的各项属性，并生成colomn列表，展示在table的第一行
const datacol = Object.keys(userdata[0]).map( (item, index)=>{
    return {
        title: USER_TITLES[index],
        dataIndex: item,
        key: `k_${item}`
    }
} )

// 忽略不显示在页面的属性名
const IGNORE_COLS = ["disabled", "href", "avatar"];

const usercol = datacol.filter( (obj) =>{
    console.log(obj)
    if(!IGNORE_COLS.includes(obj["dataIndex"])){
        console.log(IGNORE_COLS);
        return obj;
    }
})

console.log(userdata);
console.log(usercol);

// TO-DO：添加查询功能
// TO-DO: 为表格第一列添加复选框，选择结果显示在顶端
// TO-DO：为列表最后一列添加编辑操作按钮

function UserForm(props){
    const title = props.pageName;
    
    console.log("in UserForm.js")
    return (
        <div>
            <h2>test UserForm {title}</h2>
            <Table dataSource={userdata} columns={usercol} />
        </div>
    )
}

export default UserForm;