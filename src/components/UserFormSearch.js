import React from 'react';
import {Card, Input, Form, Button, Col, Row, Space} from 'antd';


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

export default SearchField;