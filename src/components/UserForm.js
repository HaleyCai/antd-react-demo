// 用antd写一个显示用户信息，带查询，带多选勾选反馈已选择的页面
// 先写死数据，再写从接口调数据（用axios）
// 用function组件而不是class组件
// 需要加flex布局吗？？？
import React, {useState} from 'react';
import {Space} from 'antd';
import TableField from './UserFormTable';
import SearchField from './UserFormSearch';

// 获取数组中最大的key值【为了新增key不重复】
const getMaxKey = (data) => {
    const keys = data.map((item)=> item.key);
    const maxKey = Math.max(...keys);
    return maxKey;
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
    const handleAdd = (inputData) => {
        console.log("in father handleAdd:");
        const newData = [...data];
        console.log(inputData);
        newData.push(inputData)
        setMaxKey(inputData["key"]);
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
                <TableField data={isSearched ? selectData : data}
                            columns={props.usercol}
                            nextKey={maxKey+1}
                            handleEdit={handleEdit}
                            handleAdd={handleAdd}
                            handleDelete={handleDelete}
                            refresh={refresh}/>
            </Space>
        </React.Fragment>
    )
}

export default UserForm;