import userdata from "../assets/arr.json";

const USER_TITLES =         ["序号", "是否禁用", "地址", "图标", "规则名称", "所有者", "描述", "呼叫序号", "状态", "更新时间", "创建时间", "进度"];
const USER_PROPS_EDITABLE = [false, false, false, false, true, true, true, true, true, true, false, true]
// 从json中读取数据的各项属性，并生成colomn列表，展示在table的第一行
const datacol = Object.keys(userdata[0]).map( (item, index)=>{
    return {
        title: USER_TITLES[index],
        dataIndex: item,
        key: `k_${item}`,
        editable: USER_PROPS_EDITABLE[index]
    }
} )


// 忽略不显示在页面的属性名
const IGNORE_COLS = ["disabled", "href", "avatar"];


// 对colomns处理
const usercol = datacol.filter( (obj) =>{
    if(!IGNORE_COLS.includes(obj["dataIndex"])){
        return obj;
    }
    return null;
})

usercol.push({
    title: "操作",
    dataIndex: "action",
    key: "k_action",
    editable: false,
    render: ""
});

console.log()

export {userdata, usercol};