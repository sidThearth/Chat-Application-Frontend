import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { storage } from "../../utils/storage";
import { io } from "socket.io-client";
import { PropTypes } from "prop-types";
import { GlobalSocketSet } from "../../utils/util";

// Styled components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #404040;
  font-family: "Arial", sans-serif;
`;

const LoginBox = styled.div`
  background: #202020;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 400px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  font-size: 28px;
  color: #FFFFFF;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 5px rgba(106, 17, 203, 0.5);
  }

  &:invalid {
    border-color: red;
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
`;

// Animation for spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-top: 4px solid #6a11cb;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} 0.6s linear infinite;
  margin: 0 auto;
`;

const LoginButton = styled.button`
  background: ${({ isLoading }) =>
    isLoading ? "#318CE7" : "#318CE7"}; /* Default goes well with black */
  color: #fff;
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: ${({ isLoading }) => (isLoading ? "not-allowed" : "pointer")};
  width: 100%;
  margin-top: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ isLoading }) =>
      isLoading ? "#7CB9E8" : "#555555"}; /* Slightly lighter for hover */
  }

  &:active {
    background: #000000; /* Solid black on click */
  }
`;


const Footer = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: #666;

  a {
    color: #2575fc;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Login Component
export const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Show spinner while processing
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_STRAPI_URL_DEPLOYED}/api/auth/local`,
        {
          identifier: username,
          password: password,
        }
      );

      console.log("Login response: ", response.data.jwt);

      const newAuth = {
        token: response.data.jwt,
        user: {
          username,
          userId: response.data.user.documentId,
        },
      };

      const newUser = { id: Date.now().toString(), data: newAuth };
      storage.setUser(newUser);

      const socket = io(import.meta.env.VITE_STRAPI_URL_DEPLOYED);
      GlobalSocketSet({ socket });
      setAuthenticated(true);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error?.message);
    } finally {
      setIsLoading(false); // Stop spinner after processing
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Welcome Back</Title>
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <LoginButton type="submit" isLoading={isLoading} disabled={isLoading}>
            {isLoading ? <Spinner /> : "Login"}
          </LoginButton>
        </form>
        <Footer>
          Don{`'`}t have an account? <Link to="/signup">Sign up</Link>
        </Footer>
      </LoginBox>
    </LoginContainer>
  );
};

Login.propTypes = {
  setAuthenticated: PropTypes.func,
};
