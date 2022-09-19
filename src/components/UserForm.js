// 用antd写一个显示用户信息，带查询，带多选勾选反馈已选择的页面
// 先写死数据，再写从接口调数据（用axios）
// 用function组件而不是class组件
// 需要加flex布局吗？？？
import React, {useState, useEffect} from 'react';
import userdata from "../assets/arr.json";
import {Table, Typography, Card, Input, Form, Button, Col, Row, Space, Popconfirm} from 'antd';
import {SettingFilled, ReloadOutlined, ColumnHeightOutlined} from '@ant-design/icons';

const {Title} = Typography;

const USER_TITLES = ["序号", "是否禁用", "地址", "图标", "规则名称", "所有者", "描述", "呼叫序号", "状态", "更新时间", "创建时间", "进度"];

// 从json中读取数据的各项属性，并生成colomn列表，展示在table的第一行
const datacol = Object.keys(userdata[0]).map( (item, index)=>{
    return {
        title: USER_TITLES[index],
        dataIndex: item,
        key: `k_${item}`
    }
} )

// 为表格第一列添加复选框
const rowSelection = [];


// 忽略不显示在页面的属性名
const IGNORE_COLS = ["disabled", "href", "avatar"];

// TO-DO: 用interface 规定允许显示的属性（必须在TS中使用，研究如何在React中使用ts）

const usercol = datacol.filter( (obj) =>{
    if(!IGNORE_COLS.includes(obj["dataIndex"])){
        return obj;
    }
    return null;
})

// TO-DO:
const handleEdit = ()=>{
    console.log("click 修改")
}

// TO-DO:
const handleDelete = (key)=>{
    console.log("click 删除")
    console.log(key);
}

// TO-DO：为列表最后一列添加编辑操作按钮
usercol.push({
    title: "操作",
    dataIndex: "action",
    key: "k_action",
    render: (_, record) => (
        <Space size="middle">
            <a onClick={handleEdit}>修改</a>
            {/*气泡确认框*/}
            <Popconfirm title="确定删除该条数据吗？" onConfirm={() => handleDelete(record.key)} okText="是" cancelText="否">
                <a>删除</a>
            </Popconfirm>
        </Space>
    )
})

console.log("user coloum");
console.log(usercol);

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
    return (
        <Card className='searchField'>
            <Form name="search">
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
                                <Button name="submit" type="primary">查询</Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    )
}

// 子组件2：查询表格
function TableField(props){
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');

    const edit = (record) => {
        form.setFieldsValue({
            name: '',
            owner: '',
            desc: '',
            callNo: '',
            status: '',
            ...record,
        });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    return (
        <Card className='tableField'>
            <Row justify="space-evenly">
                <Col span={4}>
                    <Title level={4}>查询表格</Title>
                </Col>

                <Col span={4} offset={16}>
                    <Space align='baseline' size="large">
                        <Button name="add" type="primary">新增</Button>
                        <ReloadOutlined />
                        <ColumnHeightOutlined />
                        <SettingFilled />
                    </Space>
                </Col>
            </Row>

            <Table rowSelection={{rowSelection}} 
                    dataSource={props.userdata} columns={usercol} />
        </Card>
    )

}

// 父组件
// state 存储：1. data，
function UserForm(props){
    const [userData, setuserData] = useState(userdata);

    return (
        <React.Fragment>
            <Space direction="vertical" size="large" style={{ display: 'flex' , marginLeft:40, marginRight:40}}>
                <SearchField />
                <TableField userdata={userData}/>
            </Space>
        </React.Fragment>
    )
}

export default UserForm;