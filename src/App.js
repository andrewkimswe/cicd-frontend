import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import BulletinBoard from './pages/BulletinBoard'
import CreatePost from "./pages/CreatePost";
import PostDetail from './pages/PostDetail'
import EditPostPage from "./pages/EditPostPage";
import Signup from "./pages/SignUp";
import AdminPage from "./pages/AdminPage";

import './App.css';

function App() {
    return (
        <Router> {/* React Router(사용자가 요청한 url에 따라 페이지를 보여주는 도구)를 사용하여 라우터를 설정합니다. */}
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/posts" element={<BulletinBoard />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/posts/:postId" element={<PostDetail />} />
                    <Route path="/edit-post/:postId" element={<EditPostPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
