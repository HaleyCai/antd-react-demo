import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/antd.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import UserInfoPage from './pages/userInfoPage';

// StrictMode 不会渲染任何可见的 UI，类似React.Fragment，根元素可以多于一个
// 仅在开发环境中运行检查，生产模式不会运行
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <h2>title in index.js with DIY components</h2>
    <UserInfoPage />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
