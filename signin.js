import React, { useState } from "react";
import axios from "axios";

const Signin = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");

    const handleSignin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/signin", {
                user_id: userId,
                password: password,
            });
            const { token, name } = response.data;

            // Store the token in localStorage
            localStorage.setItem("token", token);

            alert(`Welcome, ${name}`);
            // Redirect to homepage or another page
        } catch (error) {
            console.error(error);
            alert(error.response?.data.message || "Signin failed");
        }
    };

    return (
        <form onSubmit={handleSignin}>
            <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Signin</button>
        </form>
    );
};

export default Signin;