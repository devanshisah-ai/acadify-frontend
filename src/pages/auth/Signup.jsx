import { useState } from "react";
import API from "../../api/axios";

function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/register", {
        email: form.email,
        password: form.password,
        role: "STUDENT"
      });

      console.log(res.data);
      alert("Signup successful");

    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Signup</h2>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Signup;