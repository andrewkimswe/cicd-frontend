import axios from 'axios';
import React, { useState } from 'react';
import './CreatePost.css';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
    const [post, setPost] = useState({
        nickname: '',
        password: '',
        title: '',
        content: ''
    });
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let formIsValid = true;
        let errors = {};

        if (!post.nickname) {
            errors.nickname = 'Nickname is required';
            formIsValid = false;
        }
        if (!post.password || post.password.length !== 4) {
            errors.password = 'Password is required (4 digits)';
            formIsValid = false;
        }
        if (!post.title) {
            errors.title = 'Title is required';
            formIsValid = false;
        }
        if (!post.content) {
            errors.content = 'Content is required';
            formIsValid = false;
        }

        setErrors(errors);
        return formIsValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const formData = new FormData();
            formData.append('nickname', post.nickname);
            formData.append('password', post.password);
            formData.append('title', post.title);
            formData.append('content', post.content);

            if (file) {
                formData.append('file', file);
            }

            if (image) {
                formData.append('image', image);
            }

            try {
                await axios.post('http://localhost:8080/api/posts', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                navigate('/posts');
            } catch (err) {
                console.error('Error creating post:', err);
            }
        }
    };

    return (
        <div className="create-post-container">
            <div className="button-container">
                <button onClick={() => navigate('/posts')}>Back to Bulletin Board</button>
            </div>
            <h1>Create New Post</h1>
            <form onSubmit={handleSubmit}>
                {/* Form groups for input fields */}
                <div className="form-group">
                    <input type="text" placeholder="Nickname" value={post.nickname} onChange={(e) => setPost({ ...post, nickname: e.target.value })} />
                    {errors.nickname && <div className="error">{errors.nickname}</div>}
                </div>

                <div className="form-group">
                    <input type="password" placeholder="Password (4 digits)" maxLength="4" value={post.password} onChange={(e) => setPost({ ...post, password: e.target.value })} />
                    {errors.password && <div className="error">{errors.password}</div>}
                </div>

                <div className="form-group">
                    <input type="text" placeholder="Title" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
                    {errors.title && <div className="error">{errors.title}</div>}
                </div>

                <div className="form-group">
                    <textarea placeholder="Content" value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} />
                    {errors.content && <div className="error">{errors.content}</div>}
                </div>

                {/* File and image upload sections */}
                <div className="form-group">
                    <label htmlFor="image" className="custom-file-upload">Upload Image</label>
                    <input type="file" id="image" onChange={(e) => setImage(e.target.files[0])} style={{ display: 'none' }} />
                </div>

                <div className="form-group">
                    <label htmlFor="file" className="custom-file-upload">Upload File</label>
                    <input type="file" id="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                </div>
                <button type="submit">Submit Post</button>
            </form>
        </div>
    );
}

export default CreatePost;
