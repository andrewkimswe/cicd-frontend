import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]); // Added to store posts
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
        fetchPosts(); // Fetch posts on component mount
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/posts');
            setPosts(response.data); // Assuming the API returns an array of posts
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const deletePost = async (postId) => {
        try {
            await axios.delete(`http://localhost:8080/api/posts/${postId}`);
            fetchPosts(); // Refresh posts after deletion
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const suspendUser = async (userId) => {
        try {
            await axios.put(`http://localhost:8080/api/users/${userId}/suspend`);
            fetchUsers(); // Refresh users list after suspension
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    };


    const handleChangeRole = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:8080/api/users/${userId}/role?role=${newRole}`);
            fetchUsers();
        } catch (error) {
            console.error('Error changing role:', error);
        }
    };

    return (
        <div>
            <h2>Admin Page</h2>
            <button onClick={() => navigate('/create-post')}>Write New Notice</button>
            <h3>Users</h3>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.email} - Role: {user.role}
                        <button onClick={() => handleChangeRole(user.id, 'ADMIN')}>Set as Admin</button>
                        <button onClick={() => handleChangeRole(user.id, 'USER')}>Set as User</button>
                        <button onClick={() => suspendUser(user.id)}>Suspend User</button> {/* Add suspend button */}
                    </li>
                ))}
            </ul>
            <h3>Posts</h3>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        {post.title}
                        <button onClick={() => deletePost(post.id)}>Delete Post</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminPage;
