// 显示、查询、修改用户信息页面，包含多个components
import React from 'react';
import UserForm from "../components/UserForm"
import { Typography } from 'antd';
const { Title } = Typography;

// TO-DO: 为表格页添加layout布局?
function UserInfoPage (props) {
    return (
        <React.Fragment>
            <Title level={3}>title of UserInfoPage</Title>
            <UserForm />
        </React.Fragment>
    )
}

export default UserInfoPage;