// 用antd写一个显示用户信息，带查询，带多选勾选反馈已选择的页面
// 先写死数据，再写从接口调数据（用axios）
// 用function组件而不是class组件
// 需要加flex布局吗？？？
import React, {useState} from 'react';
import {Table, Typography, Card, Input, InputNumber, Form, Button, Col, Row, Space, Popconfirm, Checkbox} from 'antd';
import {SettingFilled, ReloadOutlined, ColumnHeightOutlined} from '@ant-design/icons';
const {Text, Title} = Typography;

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

// 子组件1：查询框
function SearchField(props){
    const [form] = Form.useForm();

    // input validator:
    // 1. 检验输入的name是否是TradeCode [number]格式
    const validName = (_, value) => {
        console.log(`输入规则名称为${value}`);
        // 输入为空值也可通过验证
        if(!value){
            return Promise.resolve();
        }

        const match = value.match(/tradeCode \d+/i);
        if(match){
            return Promise.resolve();
        }
        return Promise.reject("输入错误，规则名称必须为TradeCode [数字]的格式");
    }

    // 2. 检验输入的checkCallNo
    const validCallNo = (_, value) => {
        console.log(`输入序号为${value}`);
        // 输入为空值也可通过验证
        if(!value){
            return Promise.resolve();
        }

        const input = parseInt(value);
        if(input){
            return Promise.resolve();
        }
        return Promise.reject("输入错误，呼叫序号必须为数字");
    }

    // TODO：至少一个不为空，否则不能查询
    const validSearch = (values) => {

    }

    const onFinish = (values)=>{
        const {name, callNo} = values;
        const searchValue = {
            name: name ? name : null,
            callNo: callNo ? callNo : null
        }
        // 调用父组件传入的方法onSearch
        props.onSearch(searchValue);
        
    }

    // 重置表单输入框
    const onReset = () => {
        form.resetFields();
        props.onReset();
    }


    return (
        <Card className='searchField'>
            <Form name="search" form={form} onFinish={onFinish} autoComplete="false">
                <Row align="end">
                    <Col span={6} align="end">
                        <Form.Item name="name" label="规则名称" rules={[{validator: validName}]}>
                            <Input placeholder='请输入名称'/>
                        </Form.Item>
                    </Col>

                    <Col span={6} offset={4} align="end">
                        <Form.Item name="callNo" label="呼叫序号" rules={[{validator: validCallNo}]}>
                            <Input placeholder='请输入序号'/>
                        </Form.Item>
                    </Col>

                    <Col span={4} offset={3} align="end">
                        <Form.Item name="buttons">
                            <Space size="large">
                                <Button name="reset" onClick={onReset}>重置</Button>
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

// 子组件2：查询表格
function TableField(props){
    // Form.useForm() 创建 Form 实例，用于管理所有数据状态。
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const usercol = props.columns;
    const isEditing = (record) => record.key === editingKey;

    // 编辑函数：点击后该行样式被重新渲染为Input，修改的值保存在form中
    const edit = (record) => {
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
    const save = async(key) =>{
        try {
            const modifiedRow = await form.validateFields();
            console.log("modified row:")
            console.log(modifiedRow);

            // 传递被修改的一整行数据对象给父组件
            props.handleEdit(key, modifiedRow);
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


    // 删除一条数据功能：遍历data，比对key是传入的值，则在setData中删除该行数据
    const deleteRow = (key)=>{
        console.log("click 删除")
        console.log(key);

        props.handleDelete([key]);
        setEditingKey('');
    }

    // 新增功能：用setData push一个新的值
    // key值如何生成->最大key值+1
    const add = () => {
        console.log("click 新增");
        props.handleAdd();
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
    const deleteMult = () => {
        console.log("click 批量删除: ")
        console.log(selectedRowKeys);

        props.handleDelete(selectedRowKeys);
        setSelectedRowKeys([]);
    }
    
    // 为列表最后一列添加编辑、删除操作
    // 若正在编辑当前行，操作列变为“确认，取消”
    // 不在编辑当前行，操作列为“编辑，删除”
    usercol[usercol.length-1].render = ((_, record) => {
        const editCurrentRow = isEditing(record);
        return editCurrentRow? (
            <Space size="middle">
                <Typography.Link onClick={()=> save(record.key)}>
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
            <Typography.Link onClick={()=>edit(record)}>
                编辑
            </Typography.Link>
            <Popconfirm title="确定删除该条数据吗？" 
                        onConfirm={() => deleteRow(record.key)} 
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

    // 刷新表格
    const refresh = () => {
        props.refresh();
    }

    return (
        <Card className='tableField'>
            <Row justify="start" align='middle'>
                <Col span={4}>
                    <Title level={4}>查询表格</Title>
                    <Text type="secondary">共计{props.data.length}条数据</Text>
                </Col>

                <Col span={4} offset={14}>
                    <Space align='baseline' size="large">
                        <Button name="add" type="primary" onClick={add}>新增</Button>
                        <Popconfirm title="是否要批量删除所勾选的数据？"
                                    onConfirm={deleteMult}
                                    onCancel={cancel}
                                    okText="是"
                                    cancelText="否">
                            <Button name='deleteMult' type="primary">批量删除</Button>
                        </Popconfirm>
                        <ReloadOutlined onClick={refresh}/>
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
                        dataSource={props.data}
                        columns={mergedColumns}/>
            </Form>
        </Card>
    )

}

// 父组件
function UserForm(props){
    // state存储原始数据data?
    // 如果查询，将查询结果代替TableField的dataSource
    // 在查询状态下，也能
    const [data, setData] = useState(props.userdata);
    const [selectData, setSelectData] = useState(props.userdata);
    const [maxKey, setMaxKey] = useState(getMaxKey(props.userdata));
    const [isSearched, setIsSearched] = useState(false);

    // SEARCH: 查询，将查询结果更新到selectData
    // TODO: 调用接口，数据库查询
    const handleSearch = (values)=>{
        console.log("in father handleSearch, get searchValues:");
        const {name, callNo} = values;
        console.log(name, callNo);
        
        // TODO：当查询条件很多时，如何优化判断逻辑？
        let result = [];
        if(name && callNo){
            // 两个个条件都不为空：
            result = data.filter( item => {
                if(item.name === name && item.callNo === parseInt(callNo)){
                    return item;
                }
                return null;
            })

        }else if(name){
            // 只查询name
            result = data.filter( item => {
                if(item.name === name){
                    return item;
                }
                return null;
            })
        }else if(callNo){
            // 只查询callNo
            result = data.filter( item => {
                if(item.callNo === parseInt(callNo)){
                    return item;
                }
                return null;
            })
        }else{
            // 二者都为空
            result = data;
        }

        console.log("search result:");
        console.log(result);
        setSelectData(result);
        // ！！问题，search后的table进行修改，无法改动
        setIsSearched(true);
    }

    const handleReset = () => {
        console.log("in father handleReset");
        setIsSearched(false);
    }

    const updateData = (key, row, data) => {
        const newData = [...data];
        const index = newData.findIndex((item)=>item.key === key);
        const oldRow = newData[index];
        // 从index起始，修改1条数据，修改为{...oldRow, ...modefiedRow}=》用modified的值覆盖old值
        newData.splice(index, 1, {...oldRow, ...row});
        return newData;
    }

    // UPDATE: 修改一条数据并将结果保存，该函数传递给TableField执行
    // TODO：调用接口，数据库修改函数
    const handleEdit = (key, modifiedRow) => {
        console.log("in father handleEdit, modifiedRow:");
        console.log(modifiedRow);
        // 修改 data域
        setData(updateData(key, modifiedRow, data));

        // 修改 selectData域
        setSelectData(updateData(key, modifiedRow, selectData));
    }

    // ADD: 新增一条数据并将结果保存，新增逻辑可在函数getOneNewData(nextKey)中自定义
    // TODO: 调用接口，数据库增加一条数据
    const handleAdd = () => {
        console.log("in father handleAdd:");
        const newData = [...data];
        const nextKey = maxKey + 1;
        newData.push(getOneNewData(nextKey))
        setMaxKey(nextKey);
        setData(newData);
        // 刷新表单域
        setIsSearched(false);
    }

    // DELETE: 删除一条、或多条数据，传入数据的key即可
    // TODO：调用接口，删除一条数据的数据库函数，循环执行多次
    const handleDelete = (keys) => {
        console.log("in father handleDelte, deleteKeys:");
        console.log(keys);
        const newData = [...data].filter( (item) => {
            if(keys.includes(item.key)){
                return null;
            }else{
                return item;
            }
        })
        setData(newData);
        // 刷新表单域
        setIsSearched(false);
    }

    // 刷新表格，删除查询条件
    const refresh = () => {
        setIsSearched(false);
    }

    // 如果查询，isSearched=true，TableField的data渲染selectData，否则渲染data
    return (
        <React.Fragment>
            <Space direction="vertical" size="large" style={{ display: 'flex' , marginLeft:40, marginRight:40}}>
                <SearchField onSearch={handleSearch} onReset={handleReset}/>
                <TableField data={isSearched ? selectData : data} columns={props.usercol}
                            handleEdit={handleEdit}
                            handleAdd={handleAdd}
                            handleDelete={handleDelete}
                            refresh={refresh}/>
            </Space>
        </React.Fragment>
    )
}

export default UserForm;