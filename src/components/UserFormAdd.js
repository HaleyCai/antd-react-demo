import React, {useEffect} from 'react';
import {Button, Input, Form, Modal} from 'antd';


const defaultNewData = (key) => {
    return {
        key: key,
        name: `TradeCode ${key}`,
        owner: "test owner",
        desc: 'test desc',
        callNo: 111,
        status: 0,
        updatedAt: '',
        createdAt: '',
        progress: 0
    }
}

function UserFormAdd (props){
    const [form] = Form.useForm();
    const key = props.nextKey;
    const defaultValue = defaultNewData(key);

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

    const handleOk = () => {
        console.log("handleOk ");
        const inputData = form.getFieldsValue(true);
        // 添加修改时间和创建时间属性：
        const time = new Date().toUTCString();
        inputData["updatedAt"] = time;
        inputData["createdAt"] = time;
        props.getAdd(inputData);
    }

    const handleCancel = ()=>{
        console.log("handleCancel");
        props.getCancel();
    }

    useEffect( () => {
        form.resetFields();
        form.setFieldsValue(defaultValue);
    })

    return (
        <React.Fragment>
            <Modal
                title={"新增数据 key="+key}
                open={props.visible}
                onOk={handleOk}
                onCancel={handleCancel}
                forceRender={true}
                footer={[
                    <Button key="back" onClick={handleCancel}>取消</Button>,
                    <Button key="submit" onClick={handleOk}>确定</Button>
                ]}
                >
                <Form form={form} initialValues={defaultValue}>
                    <Form.Item name="key" label="序号">
                        <Input disabled={true}></Input>
                    </Form.Item>
                    <Form.Item name="name" label="规则名称" rules={[{validator: validName}]}>
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="owner" label="所有者">
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="desc" label="描述">
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="callNo" label="呼叫序号">
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="progress" label="进度">
                        <Input placeholder='请输入：' ></Input>
                    </Form.Item>

                </Form>
            </Modal>
        </React.Fragment>
    )
}

export default UserFormAdd;