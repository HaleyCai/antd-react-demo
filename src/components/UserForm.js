// 用antd写一个显示用户信息，带查询，带多选勾选反馈已选择的页面
// 先写死数据，再写从接口调数据（用axios）
// 用function组件而不是class组件
// 需要加flex布局吗？？？
import React, {useState, useEffect} from 'react';
import userdata from "../assets/arr.json";
import {Table, Typography, Card, Input, InputNumber, Form, Button, Col, Row, Space, Popconfirm} from 'antd';
import {SettingFilled, ReloadOutlined, ColumnHeightOutlined} from '@ant-design/icons';

const {Title} = Typography;

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

// TO-DO：添加查询功能


// 检验输入是否是数字
function checkCallNo(_, value){
    console.log(`输入序号为${value}, doing nothing`);
    const input = parseInt(value);
    if(input){
        return Promise.resolve();
    }
    
    return Promise.reject("输入错误，呼叫序号必须为数字");
}

// 子组件1：搜索框
function SearchField(props){

    const onFinish = (values)=>{
        const {name, callNo} = values;
        const searchValue = {
            name: name ? name : null,
            callNo: callNo ? callNo : null
        }
        // 调用父组件传入的方法onSearch
        props.onSearch(searchValue);
        
    }

    return (
        <Card className='searchField'>
            <Form name="search" onFinish={onFinish} autoComplete="false">
                <Row align="end">
                    <Col span={6}>
                        <Form.Item name="name" label="规则名称">
                            <Input placeholder='请输入名称'/>
                        </Form.Item>
                    </Col>

                    <Col span={6} offset={4}>
                        <Form.Item name="callNo" label="呼叫序号" rules={[{validator: checkCallNo}]}>
                            <Input placeholder='请输入序号'/>
                        </Form.Item>
                    </Col>

                    <Col span={4} offset={3}>
                        <Form.Item name="buttons">
                            <Space size="large">
                                <Button name="reset">重置</Button>
                                <Button name="submit" type="primary" htmlType="submit">查询</Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}

// 可编辑表格组件，正在编辑的行渲染为<Input/>
const EditableCell = ( {
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

    // 如果是正在修改的行，将其Form.Item渲染为input框，否则是table原始元素
    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item 
                    name={dataIndex}
                    rules={[
                        {
                          required: true,
                          message: `Please Input ${title}!`,
                        },
                      ]}
                >
                    {inputNode}
                </Form.Item>
            ):(children)}
        </td>
    );
};

// 获取数组中最大的key值【为了新增key不重复】
const getMaxKey = (data) => {
    const keys = data.map((item)=> item.key);
    const maxKey = Math.max(...keys);
    return maxKey;
}

// 新增一条数据
const getOneNewData = (key) => {
    const time = new Date().toUTCString();
    const newRow = {
        key: key,
        disabled: false,
        href: '',
        avatar: '',
        name: `TradeCode ${key}`,
        owner: "test owner",
        desc: 'test desc',
        callNo: 111,
        status: 0,
        updatedAt: time,
        createdAt: time,
        progress: 0
    }
    return newRow;
}

// 子组件3：查询表格
function TableField(props){
    // Form.useForm() 创建 Form 实例，用于管理所有数据状态。
    const [form] = Form.useForm();
    const [data, setData] = useState(userdata);
    const [maxKey, setMaxKey] = useState(getMaxKey(data));
    const [editingKey, setEditingKey] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const usercol = props.columns;
    
    const isEditing = (record) => record.key === editingKey;

    // 编辑函数：点击后该行样式被重新渲染为Input，修改的值保存在form中
    const handleEdit = (record) => {
        console.log("click 修改")
        console.log(record.key);
        console.log(record);
        const updated = {
            updatedAt: new Date().toUTCString()
        }
        console.log("updatedAt" + updated);
        // 设置表单的值（该值将直接传入 form store 中。如果你不希望传入对象被修改，请克隆后传入）
        // 用record中的同名属性值覆盖前面的默认控制
        form.setFieldsValue({
            name: '',
            owner: '',
            desc: '',
            callNo: '',
            status: '',
            updatedAt: '',
            progress: '',
            ...record,
            ...updated
        });
        setEditingKey(record.key);
    };

    // 确认提交编辑结果函数：在编辑后调用异步save函数，用setData更新table整体的data
    const handelSave = async(key) =>{
        try {
            const modifiedRow = await form.validateFields();
            console.log("modified row:")
            console.log(modifiedRow);
            // 被修改的行的index
            const newData = [...data];
            const index = newData.findIndex((item)=>item.key === key);
            const oldRow = newData[index];
            // 从index起始，修改1条数据，修改为{...oldRow, ...modefiedRow}=》用modified的值覆盖old值
            newData.splice(index, 1, {...oldRow, ...modifiedRow});

            setData(newData);
            setEditingKey('');
        }
        catch(errInfo){
            console.log("Validate Failed", errInfo);
        }
    }

    // 取消提交编辑结果、取消勾选复选框批量删除
    const cancel = () => {
        setEditingKey('');
        setSelectedRowKeys('');
    };



    // 删除函数：遍历data，比对key是传入的值，则在setData中删除该行数据
    const handleDelete = (key)=>{
        console.log("click 删除")
        console.log(key);
        const newData = [...data].filter( (item) => {
            if(item.key === key){
                return null;
            }else{
                    return item;
            }
        })
        console.log(newData);
        setData(newData);
        setEditingKey('');
    }

    // 新增功能：用setData push一个新的值
    // key值如何生成->最大key值+1
    const handleAdd = () => {
        console.log("click 新增");
        const newData = [...data];
        const nextKey = maxKey + 1;
        newData.push(getOneNewData(nextKey))
        setMaxKey(nextKey);
        setData(newData);
    }

    // 批量删除功能：
    // 每当复选框勾选变化，将结果存入state
    const onselectionchange = (newKeys)=>{
        console.log("new selectedRowKeys" + newKeys);
        setSelectedRowKeys(newKeys);
    }

    // 为表格第一列添加复选框
    const rowSelection = {
        selectedRowKeys,
        onChange: onselectionchange
    };

    // 批量删除 selecteRowKeys中的key的数据
    const handelDeleteMult = () => {
        console.log("click 批量删除: ")
        console.log(selectedRowKeys);
        const newData = [...data].filter( (item) => {
            if(selectedRowKeys.includes(item.key)){
                return null;
            }else{
                return item;
            }
        })
        setData(newData);
        setSelectedRowKeys([]);
    }
    
    // 为列表最后一列添加编辑、删除操作
    // 若正在编辑当前行，操作列变为“确认，取消”
    // 不在编辑当前行，操作列为“编辑，删除”
    usercol[usercol.length-1].render = ((_, record) => {
        const editCurrentRow = isEditing(record);
        return editCurrentRow? (
            <Space size="middle">
                <Typography.Link onClick={()=> handelSave(record.key)}>
                    确认
                </Typography.Link>
                <Popconfirm title="取消修改？" 
                            onConfirm={cancel}
                            okText="是" 
                            cancelText="否">
                    <Typography.Link>取消</Typography.Link>
                </Popconfirm>
            </Space>
        ): (
            <Space size="middle">
            <Typography.Link onClick={()=>handleEdit(record)}>
                编辑
            </Typography.Link>
            <Popconfirm title="确定删除该条数据吗？" 
                        onConfirm={() => handleDelete(record.key)} 
                        okText="是" 
                        cancelText="否">
                <Typography.Link>删除</Typography.Link>
            </Popconfirm>
    </Space>)
        
        
    })

    // 最终table显示的colums
    const mergedColumns = usercol.map( (colItem) => {
        // 可为每列添加一个editable属性，判断是否能修改该属性
        // 不可修改的直接返回原colItem, 可修改的返回onCell
        if(!colItem.editable){
            return colItem;
        }

        return {
            ...colItem,
            onCell: (record) => ({
                record,
                inputType: (colItem.dataIndex === "callNo" || colItem.dataIndex=== "progress")? "number": "text",
                dataIndex: colItem.dataIndex,
                title: colItem.title,
                editing: isEditing(record)
            })
        }
    } )

    return (
        <Card className='tableField'>
            <Row justify="space-evenly">
                <Col span={4}>
                    <Title level={4}>查询表格</Title>
                </Col>

                <Col span={8} offset={12}>
                    <Space align='baseline' size="large">
                        <Button name="add" type="primary" onClick={handleAdd}>新增</Button>
                        <Popconfirm title="是否要批量删除所勾选的数据？"
                                    onConfirm={handelDeleteMult}
                                    onCancel={cancel}
                                    okText="是"
                                    cancelText="否">
                            <Button name='deleteMult' type="primary">批量删除</Button>
                        </Popconfirm>
                        <ReloadOutlined />
                        <ColumnHeightOutlined />
                        <SettingFilled />
                    </Space>
                </Col>
            </Row>

            {/* Table外用Form包裹：因为EditableCell是Form.Item，需要用Form包裹在外层*/}
            {/* Table中components：用EditableCell覆盖默认的 table 元素，正在修改的变为input框，否则是原始table元素 */}
            <Form form={form} component={false}>
                <Table  rowSelection={rowSelection}
                        components={{
                            body: {
                            cell: EditableCell,
                            },
                        }}
                        bordered
                        dataSource={data}
                        columns={mergedColumns}/>
            </Form>
        </Card>
    )

}

// 父组件
// state 存储：1. data，
function UserForm(props){
    const onSearch = (values)=>{
        console.log("in onSearch, get searchValues:");
        console.log(values);
    }
    return (
        <React.Fragment>
            <Space direction="vertical" size="large" style={{ display: 'flex' , marginLeft:40, marginRight:40}}>
                <SearchField onSearch={onSearch}/>
                <TableField columns={usercol}/>
            </Space>
        </React.Fragment>
    )
}

export default UserForm;