// import React, { useState } from "react";
// import "./Login.css";
// import { Link, useNavigate } from "react-router-dom";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'mobile'
//   const navigate = useNavigate();

//   // Send OTP to mobile number
//   const sendOtp = async () => {
//     if (!mobile || mobile.length !== 10) {
//       alert("Please enter a valid 10-digit mobile number");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/send-login-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobile }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to send OTP");
//       }

//       setOtpSent(true);
//       alert("OTP sent to your mobile number!");
//     } catch (err) {
//       console.error("OTP send error:", err);
//       alert("Failed to send OTP: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Login with email and password
//   const loginWithEmail = async () => {
//     if (!email || !password) {
//       alert("Please enter email and password");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Login failed");
//       }

//       const userData = {
//         name: data.user.name,
//         email: data.user.email,
//         mobile: data.user.mobile,
//       };
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(userData));

//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Login error:", err);
//       alert("Login failed: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Login with mobile OTP
//   const loginWithOtp = async () => {
//     if (!mobile || !otp) {
//       alert("Please enter mobile number and OTP");
//       return;
//     }

//     if (otp.length !== 6) {
//       alert("Please enter a valid 6-digit OTP");
//       return;
//     }

//     setVerifying(true);
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/login-with-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           mobile, 
//           otp 
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Login failed");
//       }

//       const userData = {
//         name: data.user.name,
//         email: data.user.email,
//         mobile: data.user.mobile,
//       };
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(userData));

//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Login error:", err);
//       alert("Login failed: " + err.message);
//     } finally {
//       setVerifying(false);
//     }
//   };

//   // Resend OTP
//   const resendOtp = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("http://localhost:5000/api/auth/resend-login-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobile }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         throw new Error(data.message || "Failed to resend OTP");
//       }

//       alert("OTP resent to your mobile number!");
//     } catch (err) {
//       console.error("Resend OTP error:", err);
//       alert("Failed to resend OTP: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Switch between login methods
//   const switchLoginMethod = (method) => {
//     setLoginMethod(method);
//     setOtpSent(false);
//     setOtp("");
//     setMobile("");
//     setEmail("");
//     setPassword("");
//   };

//   return (
//     <div className="auth-container">
//       <h2>Welcome Back!</h2>

//       {/* Login Method Toggle */}
//       <div className="login-method-toggle">
//         <button
//           className={`toggle-btn ${loginMethod === "email" ? "active" : ""}`}
//           onClick={() => switchLoginMethod("email")}
//         >
//           📧 Email Login
//         </button>
//         <button
//           className={`toggle-btn ${loginMethod === "mobile" ? "active" : ""}`}
//           onClick={() => switchLoginMethod("mobile")}
//         >
//           📱 Mobile Login
//         </button>
//       </div>

//       {/* Email Login Form */}
//       {loginMethod === "email" && (
//         <>
//           <input
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             type="email"
//             placeholder="Email Address"
//           />
//           <input
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             type="password"
//             placeholder="Password"
//           />
//           <button 
//             onClick={loginWithEmail} 
//             disabled={loading} 
//             className="login-btn"
//           >
//             {loading ? "Logging in..." : "Login with Email"}
//           </button>
//         </>
//       )}

//       {/* Mobile Login Form */}
//       {loginMethod === "mobile" && (
//         <>
//           <div className="mobile-input-container">
//             <input
//               value={mobile}
//               onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
//               type="tel"
//               placeholder="Mobile Number"
//               maxLength="10"
//               disabled={otpSent}
//             />
//             {!otpSent && (
//               <button 
//                 onClick={sendOtp} 
//                 disabled={loading || mobile.length !== 10}
//                 className="otp-btn"
//               >
//                 {loading ? "Sending..." : "Send OTP"}
//               </button>
//             )}
//           </div>

//           {otpSent && (
//             <>
//               <div className="otp-input-container">
//                 <input
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   type="text"
//                   placeholder="Enter 6-digit OTP"
//                   maxLength="6"
//                 />
//                 <button 
//                   onClick={resendOtp} 
//                   disabled={loading}
//                   className="resend-otp-btn"
//                 >
//                   {loading ? "Sending..." : "Resend"}
//                 </button>
//               </div>
              
//               <button 
//                 onClick={loginWithOtp} 
//                 disabled={verifying || otp.length !== 6}
//                 className="verify-btn"
//               >
//                 {verifying ? "Verifying..." : "Login with OTP"}
//               </button>
//             </>
//           )}
//         </>
//       )}

//       <p>
//         Don't have an account? <Link to="/signup">Signup</Link>
//       </p>

//       {/* Forgot Password Link */}
//       <p className="forgot-password">
//         <Link to="/forgot-password">Forgot Password?</Link>
//       </p>
//     </div>
//   );
// }

// export default Login;










import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'mobile'
  const navigate = useNavigate();

  // Send OTP to mobile number
  const sendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      alert("OTP sent to your mobile number!");
    } catch (err) {
      console.error("OTP send error:", err);
      alert("Failed to send OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const loginWithEmail = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      const userData = {
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile,
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login with mobile OTP
  const loginWithOtp = async () => {
    if (!mobile || !otp) {
      alert("Please enter mobile number and OTP");
      return;
    }

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login-with-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mobile, 
          otp 
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      const userData = {
        name: data.user.name,
        email: data.user.email,
        mobile: data.user.mobile,
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      alert("OTP resent to your mobile number!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert("Failed to resend OTP: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Switch between login methods
  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setOtpSent(false);
    setOtp("");
    setMobile("");
    setEmail("");
    setPassword("");
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    if (loginMethod === "email") {
      // Navigate to forgot password page for email
      navigate("/forgot-password");
    } else {
      // Switch to mobile login method
      switchLoginMethod("mobile");
      alert("Please use mobile OTP login if you forgot your password");
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back!</h2>

      {/* Login Method Toggle */}
      <div className="login-method-toggle">
        <button
          className={`toggle-btn ${loginMethod === "email" ? "active" : ""}`}
          onClick={() => switchLoginMethod("email")}
        >
          📧 Email Login
        </button>
        <button
          className={`toggle-btn ${loginMethod === "mobile" ? "active" : ""}`}
          onClick={() => switchLoginMethod("mobile")}
        >
          📱 Mobile Login
        </button>
      </div>

      {/* Email Login Form */}
      {loginMethod === "email" && (
        <>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email Address"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <button 
            onClick={loginWithEmail} 
            disabled={loading} 
            className="login-btn"
          >
            {loading ? "Logging in..." : "Login with Email"}
          </button>
        </>
      )}

      {/* Mobile Login Form */}
      {loginMethod === "mobile" && (
        <>
          <div className="mobile-input-container">
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              type="tel"
              placeholder="Mobile Number"
              maxLength="10"
              disabled={otpSent}
            />
            {!otpSent && (
              <button 
                onClick={sendOtp} 
                disabled={loading || mobile.length !== 10}
                className="otp-btn"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            )}
          </div>

          {otpSent && (
            <>
              <div className="otp-input-container">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                />
                <button 
                  onClick={resendOtp} 
                  disabled={loading}
                  className="resend-otp-btn"
                >
                  {loading ? "Sending..." : "Resend"}
                </button>
              </div>
              
              <button 
                onClick={loginWithOtp} 
                disabled={verifying || otp.length !== 6}
                className="verify-btn"
              >
                {verifying ? "Verifying..." : "Login with OTP"}
              </button>
            </>
          )}
        </>
      )}

      <p>
        Don't have an account? <Link to="/signup">Signup</Link>
      </p>

      {/* Forgot Password Link - Only show for email login */}
      {loginMethod === "email" && (
        <p className="forgot-password">
          <button 
            onClick={handleForgotPassword}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#007bff', 
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              font: 'inherit'
            }}
          >
            Forgot Password?
          </button>
        </p>
      )}
    </div>
  );
}

export default Login;