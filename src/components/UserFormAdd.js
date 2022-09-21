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

    const newDataValidator = (errInfo, value) => {
        const {field} = errInfo;
        console.log("field name="+field);
        console.log(`输入value为${value}`);

        if(!value){
            return Promise.reject("该字段不能为空");
        }

        switch(field){
            case "name":{
                const match = value.match(/tradeCode \d+/i);
                if(match){
                    return Promise.resolve();
                }else{
                    return Promise.reject("输入错误，规则名称必须为TradeCode [数字]的格式");
                }
            }; 
            case "callNo":{
                const inputNum = parseInt(value);
                if(inputNum){
                    return Promise.resolve();
                }else{
                    return Promise.reject("输入错误，呼叫序号必须为数字");
                }
            }; 
            case "status":{
                const inputNum = parseInt(value);
                if(inputNum && (inputNum === 0 || inputNum === 1 || inputNum === 2)){
                    return Promise.resolve();
                }else{
                    return Promise.reject("输入错误，状态只能为0、1、2");
                }
            }; 
            case "progress":{
                const inputNum = parseInt(value);
                if(inputNum && (inputNum >= 0 && inputNum <= 100)){
                    return Promise.resolve();
                }else{
                    return Promise.reject("输入错误，进度只能为0-100的数字");
                }
            }; 
            default :
                return Promise.resolve(); 

        }
        
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
                    <Form.Item name="name" label="规则名称" rules={[{validator: newDataValidator}]}>
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="owner" label="所有者"  rules={[{validator: newDataValidator}]}>
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="desc" label="描述"  rules={[{validator: newDataValidator}]}>
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="callNo" label="呼叫序号"  rules={[{validator: newDataValidator}]}>
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="status" label="状态"  rules={[{validator: newDataValidator}]}>
                        <Input placeholder='请输入：'></Input>
                    </Form.Item>
                    <Form.Item name="progress" label="进度"  rules={[{validator: newDataValidator}]}>
                        <Input placeholder='请输入：' ></Input>
                    </Form.Item>

                </Form>
            </Modal>
        </React.Fragment>
    )
}

export default UserFormAdd;