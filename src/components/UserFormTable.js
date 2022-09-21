import React, {useState} from 'react';
import {Table, Typography, Card, Input, InputNumber, Form, Button, Col, Row, Space, Popconfirm} from 'antd';
import {SettingFilled, ReloadOutlined, ColumnHeightOutlined} from '@ant-design/icons';
import UserFormAdd from './UserFormAdd';
const {Text, Title} = Typography;

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
        // 设置表单的值（该值将直接传入 form store 中。如果你不希望传入对象被修改，请克隆后传入）
        // 用record中的同名属性值覆盖前面的默认控制
        form.setFieldsValue({
            name: '',
            owner: '',
            desc: '',
            callNo: '',
            status: '',
            progress: '',
            ...record,
            updatedAt: new Date().toUTCString()
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

    // 控制新增弹出框是否可见
    const [isAddVisible, setIsAddVisible] = useState(false);

    const handleVisibleAdd = ()=>{
        console.log("change add component visible");
        setIsAddVisible(true);
    }

    // 取消新增，关闭弹出框
    const getCancel = ()=>{
        console.log("cancel add component");
        setIsAddVisible(false);
    }

    // 新增功能：
    // key值如何生成->最大key值+1
    const getAdd = (inputData) => {
        console.log("click 新增");
        props.handleAdd(inputData);
        setIsAddVisible(false);
    }

    return (
        <Card className='tableField'>
            <Row justify="start" align='middle'>
                <Col span={4}>
                    <Title level={4}>查询表格 nextKey={props.nextKey}</Title>
                    <Text type="secondary">共计{props.data.length}条数据</Text>
                </Col>

                <Col span={4} offset={14}>
                    <Space align='baseline' size="large">
                        <Button name="add" type="primary" onClick={handleVisibleAdd}>新增</Button>
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
            <UserFormAdd visible={isAddVisible} 
                nextKey={props.nextKey} 
                getCancel={getCancel}
                getAdd={getAdd}/>
        </Card>
    )

}

export default TableField;