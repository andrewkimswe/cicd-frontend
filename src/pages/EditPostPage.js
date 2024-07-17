import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditPostPage.css';

function EditPostPage() {
    const [post, setPost] = useState({ title: '', content: '', nickname: '' });
    const [errors, setErrors] = useState({ title: '', content: '' }); // 추가: 에러 상태
    const { postId } = useParams();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [userRole, setUserRole] = useState('USER');


    useEffect(() => {
        fetchPostData();
    }, [postId]);

    const fetchPostData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/posts/${postId}`);
            const postData = response.data;
            setPost({
                title: postData.title,
                content: postData.content,
                nickname: postData.nickname,
                type: postData.type  // 게시글 타입도 상태에 저장
            });
        } catch (error) {
            console.error('Error fetching post:', error);
        }
    };

    const navigateToBulletinBoard = () => {
        navigate('/posts');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPost((prevPost) => ({ ...prevPost, [name]: value }));

        if (name === 'title') {
            setErrors((prevErrors) => ({ ...prevErrors, title: value ? '' : 'Title is required' }));
        } else if (name === 'content') {
            setErrors((prevErrors) => ({ ...prevErrors, content: value ? '' : 'Content is required' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let enteredPassword = '';

        if (userRole !== 'ADMIN') {
            enteredPassword = prompt("Please enter your password to edit this post:");
            if (!enteredPassword) {
                alert("Password is required");
                return;
            }
        }

        if (!post.title || !post.content) {
            alert("Title and content are required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', post.title);
            formData.append('content', post.content);
            formData.append('type', post.type);
            formData.append('password', enteredPassword);

            if (image) {
                formData.append('image', image); // 이미지 첨부
            }

            if (file) {
                formData.append('file', file); // 파일 첨부
            }

            await axios.put(`http://localhost:8080/api/posts/${postId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate(`/posts/${postId}`);
        } catch (error) {
            console.error('Error updating post:', error);
            if (error.response && error.response.status === 403) {
                alert("Incorrect password");
            }
        }
    };



    return (
        <div className="edit-post-container">
            <div className="button-container">
                <button onClick={navigateToBulletinBoard}>Back to Bulletin Board</button>
            </div>
            <h1>Edit Post</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleInputChange}
                        aria-label="Title"
                    />
                    {errors.title && <span className="error">{errors.title}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        name="content"
                        value={post.content}
                        onChange={handleInputChange}
                        aria-label="Content"
                    />
                    {errors.content && <span className="error">{errors.content}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="image" className="custom-file-upload">
                        <i className="fa fa-cloud-upload"></i> Upload Image
                    </label>
                    <input
                        type="file"
                        id="image"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="file" className="custom-file-upload">
                        <i className="fa fa-cloud-upload"></i> Upload File
                    </label>
                    <input
                        type="file"
                        id="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </div>
                <button type="submit">Update Post</button>
            </form>
        </div>
    );
}

export default EditPostPage;
